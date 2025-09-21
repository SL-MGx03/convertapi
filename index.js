const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware Setup ---

// Enable CORS: This allows your frontend website to make requests to this API
app.use(cors());

// Create a directory for temporary file uploads if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads with a 25MB size limit
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

// --- API Endpoints ---

// Health check endpoint to confirm the API is running
app.get('/', (req, res) => {
  res.status(200).send('ConvertAI API is running. Ready to convert files.');
});

/**
 * PPTX to PDF Conversion Endpoint
 * This endpoint is fully functional.
 */
app.post('/convert/pptx-to-pdf', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const inputFile = req.file.path;
  const outputDir = path.dirname(inputFile); // Use the same 'uploads' directory

  // This is the powerful LibreOffice command-line instruction
  // --headless: Run without a graphical user interface
  // --convert-to pdf: Specify the target format
  // --outdir: Specify where to save the converted file
  const command = `soffice --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;

  exec(command, (error, stdout, stderr) => {
    // Always delete the original uploaded PPTX to save space
    fs.unlink(inputFile, (err) => {
      if (err) console.error(`Failed to delete original file: ${inputFile}`, err);
    });

    if (error) {
      console.error('LibreOffice Conversion Error:', stderr);
      return res.status(500).json({ error: 'File conversion failed on the server.' });
    }

    // Construct the expected output filename
    const outputFilename = path.basename(req.file.originalname, path.extname(req.file.originalname)) + '.pdf';
    const outputFile = path.join(outputDir, outputFilename);

    if (!fs.existsSync(outputFile)) {
      console.error('Conversion seemed to succeed, but output file was not found.');
      return res.status(500).json({ error: 'An unknown conversion error occurred.' });
    }

    // Send the converted file to the user for download
    res.download(outputFile, outputFilename, (err) => {
      if (err) {
        console.error('Download Error:', err);
      }
      // After the download is complete (or failed), delete the converted PDF to save space
      fs.unlink(outputFile, (unlinkErr) => {
        if (unlinkErr) console.error(`Failed to delete converted file: ${outputFile}`, unlinkErr);
      });
    });
  });
});

/**
 * PDF to PPTX Conversion Endpoint
 * This is a placeholder. Real conversion is not feasible with open-source tools.
 */
app.post('/convert/pdf-to-pptx', (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: 'Converting PDF to an editable PPTX is an extremely complex task that is not supported by this API. This feature is for demonstration purposes only.',
  });
});


// --- Error Handling ---

// Custom error handler to catch file-size limit errors from Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `File too large. Maximum size is 25MB.` });
  }
  // Handle other errors
  if (err) {
    return res.status(500).json({ error: `An unexpected error occurred: ${err.message}` });
  }
  next();
});

// --- Server Start ---

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('When running on Replit, your public URL will be available in the webview.');
});
