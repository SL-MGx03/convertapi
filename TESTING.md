# Testing Guide

## Testing Locally

### Method 1: Using Node.js Directly

Test individual API endpoints:

```bash
# Test status endpoint
node -e "require('./api/status.js')({}, {status: (c) => ({json: (d) => console.log(d)})})"

# Test health endpoint
node -e "require('./api/healthz.js')({}, {status: (c) => ({json: (d) => console.log(d)})})"

# Test conversion endpoint (should return 503)
node -e "require('./api/convert/pptx-to-pdf.js')({}, {status: (c) => ({json: (d) => console.log(d)})})"
```

### Method 2: Using Vercel CLI (Recommended)

Install Vercel CLI and run locally:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run development server
vercel dev
```

This will start a local server that simulates Vercel's environment.

### Method 3: Test Original Express App

For platforms that support LibreOffice (Replit, Railway, etc.):

```bash
# Start the Express server
npm start
```

## Testing Endpoints

Once running locally with `vercel dev`, test these endpoints:

```bash
# Health check
curl http://localhost:3000/api/healthz

# Status
curl http://localhost:3000/api/status

# API info
curl http://localhost:3000/api

# Conversion (will return 503 with alternatives)
curl -X POST \
  -F "file=@test.pdf" \
  http://localhost:3000/api/convert/pdf-to-docx
```

## Expected Responses

### /api/healthz
```json
{
  "ok": true,
  "platform": "vercel",
  "uptime": 12.345,
  "ts": 1700000000000,
  "note": "Running on Vercel serverless. LibreOffice not available."
}
```

### /api/status
```json
{
  "service": "ConvertAI API (Vercel)",
  "status": "online",
  "platform": "vercel-serverless",
  "note": "LibreOffice conversions not available...",
  "timestamp": "2025-11-13T07:30:00.000Z",
  "resources": { ... }
}
```

### /api/convert/* (All conversion endpoints)
```json
{
  "error": "LibreOffice not available on Vercel",
  "message": "This conversion endpoint requires LibreOffice...",
  "alternatives": [
    "Deploy to Railway, Render, Fly.io...",
    "Use a cloud conversion API service...",
    "Deploy using Docker containers..."
  ],
  "platform": "vercel-serverless",
  "endpoint": "pptx-to-pdf"
}
```

## Deployment Testing

After deploying to Vercel:

```bash
# Replace YOUR_DOMAIN with your Vercel deployment URL
export VERCEL_URL="https://your-project.vercel.app"

# Test health
curl $VERCEL_URL/api/healthz

# Test status
curl $VERCEL_URL/api/status

# Test conversion endpoint
curl -X POST -F "file=@test.pdf" $VERCEL_URL/api/convert/pdf-to-docx
```

## Automated Testing

Create a test script:

```javascript
// test.js
const assert = require('assert');

async function testEndpoints() {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  
  // Test health
  const health = await fetch(`${baseUrl}/api/healthz`);
  assert.strictEqual(health.status, 200);
  
  // Test status
  const status = await fetch(`${baseUrl}/api/status`);
  assert.strictEqual(status.status, 200);
  
  // Test conversion (should be 503)
  const conversion = await fetch(`${baseUrl}/api/convert/pptx-to-pdf`, {
    method: 'POST'
  });
  assert.strictEqual(conversion.status, 503);
  
  console.log('All tests passed!');
}

testEndpoints().catch(console.error);
```

Run with:
```bash
node test.js
```

## Notes

- The API endpoints are designed to work on Vercel but document the LibreOffice limitation
- All conversion endpoints return 503 with helpful error messages
- Status and health endpoints work normally
- For actual conversion functionality, see VERCEL_DEPLOYMENT.md for alternatives
