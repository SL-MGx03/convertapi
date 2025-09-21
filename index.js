const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware Setup ---
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// --- Helper function to clean up files ---
const cleanupFiles = (...files) => {
  files.forEach(file => {
    if (file && fs.existsSync(file)) {
      fs.unlink(file, (err) => {
        if (err) console.error(`Failed to delete file: ${file}`, err);
      });
    }
  });
};

// --- API Endpoints ---
app.get('/', (req, res) => {
  res.status(200).send('ConvertAI API is running and ready.');
});

app.post('/convert/pptx-to-pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const inputFile = req.file.path;
  const outputDir = path.dirname(inputFile);
  
  console.log(`[JOB START] Received file: ${req.file.originalname}. Size: ${req.file.size} bytes.`);
  console.log(`Input path: ${inputFile}`);

  // Increased timeout to 2 minutes (120000 ms) for large files
  const command = `soffice --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;
  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('[JOB FAILED] LibreOffice execution error:', error);
      console.error('[STDERR]', stderr);
      cleanupFiles(inputFile); // Clean up the failed input
      // Provide a more specific error message
      if (error.killed) {
        return res.status(500).json({ error: 'Conversion process timed out or ran out of memory.' });
      }
      return res.status(500).json({ error: 'File conversion failed on the server.' });
    }

    const expectedOutputFilename = path.basename(inputFile, path.extname(inputFile)) + '.pdf';
    const outputFile = path.join(outputDir, expectedOutputFilename);
    
    console.log(`[JOB SUCCESS] stdout: ${stdout}`);
    console.log(`Checking for output file: ${outputFile}`);

    if (!fs.existsSync(outputFile)) {
      console.error('[JOB FAILED] Output file not found after conversion.');
      cleanupFiles(inputFile);
      return res.status(500).json({ error: 'Conversion succeeded, but the output file could not be found.' });
    }

    res.download(outputFile, path.basename(req.file.originalname, '.pptx') + '.pdf', (downloadErr) => {
      if (downloadErr) {
        console.error('[DOWNLOAD ERROR]', downloadErr);
      }
      // Cleanup both original and converted files after download attempt
      cleanupFiles(inputFile, outputFile);
      console.log(`[JOB COMPLETE] Cleaned up files for job.`);
    });
  });
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File too large. Maximum size is 25MB.` });
    }
  }
  if (err) {
    console.error('[UNEXPECTED ERROR]', err);
    return res.status(500).json({ error: `An unexpected server error occurred.` });
  }
  next();
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
