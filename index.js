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

// --- Static File Setup ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Middleware & CORS ---
app.use(cors());

// --- Multer Storage Setup ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage: storage, limits: { fileSize: 25 * 1024 * 1024 } });

// --- Helper Functions ---
const cleanupFiles = (...files) => {
  files.forEach(file => {
    if (file && fs.existsSync(file)) fs.unlink(file, (err) => { if (err) console.error(`Failed to delete file: ${file}`, err); });
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
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

// --- Generic Conversion Logic ---
const handleConversion = (req, res, outputExtension, libreofficeFormat) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const inputFile = req.file.path;
  const outputDir = path.dirname(inputFile);
  console.log(`[JOB START] Converting ${req.file.originalname} to ${outputExtension}.`);
  let command;
  if (outputExtension === 'docx' && req.file.mimetype === 'application/pdf') {
      command = `pdftotext "${inputFile}" - | soffice --headless --infilter="writer_pdf_import" --convert-to docx --outdir "${outputDir}" /dev/stdin`;
  } else {
      command = `soffice --headless --convert-to ${libreofficeFormat || outputExtension} "${inputFile}" --outdir "${outputDir}"`;
  }
  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[JOB FAILED] Error for ${req.file.originalname}:`, stderr || error);
      cleanupFiles(inputFile);
      if (error.killed) return res.status(500).json({ error: 'Conversion process timed out or ran out of memory.' });
      return res.status(500).json({ error: 'File conversion failed. The file may be unsupported or corrupt.' });
    }
    const safeOriginalName = path.basename(req.file.originalname).replace(/\.\w+$/, '');
    const expectedOutputFilename = path.basename(inputFile, path.extname(inputFile)) + `.${outputExtension}`;
    const outputFile = path.join(outputDir, expectedOutputFilename);
    if (!fs.existsSync(outputFile)) {
      console.error('[JOB FAILED] Output file not found after conversion.');
      cleanupFiles(inputFile);
      return res.status(500).json({ error: 'Conversion succeeded, but the output file could not be found.' });
    }
    res.download(outputFile, `${safeOriginalName}.${outputExtension}`, (downloadErr) => {
      if (downloadErr) console.error('[DOWNLOAD ERROR]', downloadErr);
      cleanupFiles(inputFile, outputFile);
      console.log(`[JOB COMPLETE] Cleaned up files for ${req.file.originalname}.`);
    });
  });
};

// --- API Endpoints ---
app.get('/', (req, res) => res.status(200).send('ConvertAI API is running. Visit /status for resource usage.'));

// Serves the static HTML page
app.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Provides status data as JSON
app.get('/api/status', (req, res) => {
    exec('df -h /', (error, stdout, stderr) => {
        let diskInfo = { total: 'N/A', used: 'N/A', available: 'N/A', usage: 'N/A' };
        if (!error && stdout) {
            const lines = stdout.trim().split('\n');
            const parts = lines[1].split(/\s+/);
            diskInfo = { total: parts[1], used: parts[2], available: parts[3], usage: parts[4] };
        }
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const processMemory = process.memoryUsage();
        const cpus = os.cpus();
        const data = {
            service: 'ConvertAI API', status: 'online', timestamp: new Date().toISOString(),
            resources: {
                process: {
                    uptime: formatSeconds(process.uptime()),
                    memoryUsage: { rss: formatBytes(processMemory.rss), heapTotal: formatBytes(processMemory.heapTotal), heapUsed: formatBytes(processMemory.heapUsed) },
                    nodeVersion: process.version,
                },
                system: {
                    uptime: formatSeconds(os.uptime()), platform: os.platform(), arch: os.arch(),
                    cpu: { model: cpus[0].model, cores: cpus.length, loadAverage: os.loadavg().map(l => l.toFixed(2)) },
                    memory: { total: formatBytes(totalMem), free: formatBytes(freeMem), usedRaw: usedMem, totalRaw: totalMem },
                    disk: diskInfo,
                }
            }
        };
        res.json(data);
    });
});

// --- Conversion Endpoints ---
app.post('/convert/pptx-to-pdf', upload.single('file'), (req, res) => handleConversion(req, res, 'pdf'));
app.post('/convert/pdf-to-pptx', upload.single('file'), (req, res) => handleConversion(req, res, 'pptx', 'impress_pdf_import'));
app.post('/convert/docx-to-pdf', upload.single('file'), (req, res) => handleConversion(req, res, 'pdf'));
app.post('/convert/pdf-to-docx', upload.single('file'), (req, res) => handleConversion(req, res, 'docx'));

// --- Error Handling & Server Start ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `File too large. Max size is 25MB.` });
  }
  if (err) {
    console.error('[UNEXPECTED ERROR]', err);
    return res.status(500).json({ error: `An unexpected server error occurred.` });
  }
  next();
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
