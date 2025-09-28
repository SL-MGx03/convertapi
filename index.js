/*MIT License

Copyright (c) 2025 SL-MGx03

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

MY Website https://slmgx.live

*/

const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Static / Middleware ----------
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// ---------- Upload (Multer) ----------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// ---------- Helpers ----------
const cleanupFiles = (...files) => {
  files.forEach(file => {
    if (file && fs.existsSync(file)) {
      fs.unlink(file, (err) => {
        if (err) console.error(`Failed to delete file: ${file}`, err);
      });
    }
  });
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSeconds = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

const getLatestFile = (dir, ext) => {
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith(`.${ext}`))
    .map(f => ({ f, time: fs.statSync(path.join(dir, f)).mtime }))
    .sort((a, b) => b.time - a.time);
  return files.length ? path.join(dir, files[0].f) : null;
};

// ---------- Warm / Preload State ----------
let warmState = {
  warming: false,
  warmed: false,
  lastWarmStart: null,
  lastWarmEnd: null,
  error: null
};
let warmPromise = null;

function prewarmLibreOffice() {
  if (warmState.warmed) return Promise.resolve('already warmed');
  if (warmState.warming && warmPromise) return warmPromise;

  warmState.warming = true;
  warmState.lastWarmStart = Date.now();
  warmState.error = null;

  const cmd = 'soffice --headless --invisible --version';

  warmPromise = new Promise((resolve) => {
    exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
      warmState.lastWarmEnd = Date.now();
      warmState.warming = false;
      if (err) {
        warmState.error = stderr || err.message;
        console.error('[PREWARM ERROR]', warmState.error);
        return resolve(false);
      }
      console.log('[PREWARM OUTPUT]', stdout.trim());
      warmState.warmed = true;
      resolve(true);
    });
  });

  return warmPromise;
}

// Lazy prewarm on first request
app.use((req, res, next) => {
  if (!warmState.warmed && !warmState.warming) {
    prewarmLibreOffice();
  }
  next();
});

// ---------- Conversion Core ----------
const handleConversion = async (req, res, outputExtension, libreofficeFilter) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  try {
    await Promise.race([
      prewarmLibreOffice(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Warm timeout')), 20000))
    ]);
  } catch (e) {
    console.warn('[WARN] Proceeding without confirmed warm:', e.message);
  }

  const inputFile = req.file.path;
  const outputDir = path.dirname(inputFile);

  let command;
  if (libreofficeFilter) {
    command = `soffice --headless --infilter=${libreofficeFilter} --convert-to ${outputExtension} "${inputFile}" --outdir "${outputDir}"`;
  } else {
    command = `soffice --headless --convert-to ${outputExtension} "${inputFile}" --outdir "${outputDir}"`;
  }

  console.log(`[JOB START] ${req.file.originalname} -> .${outputExtension}`);
  console.log('[COMMAND]', command);

  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    console.log('[STDOUT]', stdout);
    console.log('[STDERR]', stderr);

    if (error) {
      console.error(`[JOB FAILED] ${req.file.originalname}:`, stderr || error.message);
      cleanupFiles(inputFile);
      if (error.killed) {
        return res.status(500).json({ error: 'Conversion timed out or exceeded resource limits.' });
      }
      return res.status(500).json({ error: 'Conversion failed. Possibly unsupported or corrupt file.' });
    }

    const outputFile = getLatestFile(outputDir, outputExtension);
    if (!outputFile) {
      console.error('[JOB FAILED] Output file not found.');
      cleanupFiles(inputFile);
      return res.status(500).json({ error: 'Conversion succeeded internally but output file missing.' });
    }

    const safeOriginalName = path.basename(req.file.originalname).replace(/\.\w+$/, '');
    res.download(outputFile, `${safeOriginalName}.${outputExtension}`, (downloadErr) => {
      if (downloadErr) console.error('[DOWNLOAD ERROR]', downloadErr);
      cleanupFiles(inputFile, outputFile);
      console.log(`[JOB COMPLETE] Cleaned up for ${req.file.originalname}.`);
    });
  });
};

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health: fast check
app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    warmed: warmState.warmed,
    warming: warmState.warming,
    error: warmState.error,
    uptime: process.uptime(),
    ts: Date.now()
  });
});

// Explicit warm trigger
app.post('/warm', async (req, res) => {
  const already = warmState.warmed;
  await prewarmLibreOffice();
  res.json({
    requested: true,
    already,
    warmed: warmState.warmed,
    warming: warmState.warming,
    error: warmState.error
  });
});

// Status (resource snapshot)
app.get('/api/status', (req, res) => {
  exec('df -h /', (error, stdout) => {
    let diskInfo = { total: 'N/A', used: 'N/A', available: 'N/A', usage: 'N/A' };
    if (!error && stdout) {
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        diskInfo = { total: parts[1], used: parts[2], available: parts[3], usage: parts[4] };
      }
    }
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const pm = process.memoryUsage();
    const cpus = os.cpus();
    res.json({
      service: 'ConvertAI API',
      status: 'online',
      warmed: warmState.warmed,
      warming: warmState.warming,
      timestamp: new Date().toISOString(),
      resources: {
        process: {
          uptime: formatSeconds(process.uptime()),
          memoryUsage: {
            rss: formatBytes(pm.rss),
            heapTotal: formatBytes(pm.heapTotal),
            heapUsed: formatBytes(pm.heapUsed)
          },
          nodeVersion: process.version
        },
        system: {
          uptime: formatSeconds(os.uptime()),
          platform: os.platform(),
          arch: os.arch(),
          cpu: {
            model: cpus[0].model,
            cores: cpus.length,
            loadAverage: os.loadavg().map(l => l.toFixed(2))
          },
          memory: {
            total: formatBytes(totalMem),
            free: formatBytes(freeMem),
            usedRaw: usedMem,
            totalRaw: totalMem
          },
            disk: diskInfo
        }
      }
    });
  });
});

// Conversion Endpoints
app.post('/convert/pptx-to-pdf', upload.single('file'),
  (req, res) => handleConversion(req, res, 'pdf'));

app.post('/convert/pdf-to-pptx', upload.single('file'),
  (req, res) => handleConversion(req, res, 'pptx', 'impress_pdf_import'));

app.post('/convert/docx-to-pdf', upload.single('file'),
  (req, res) => handleConversion(req, res, 'pdf'));

app.post('/convert/pdf-to-docx', upload.single('file'),
  (req, res) => handleConversion(req, res, 'docx', 'writer_pdf_import'));

// Error Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Max size is 25MB.' });
  }
  if (err) {
    console.error('[UNEXPECTED ERROR]', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
  next();
});

// Start
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
