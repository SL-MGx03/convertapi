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

module.exports = async (req, res) => {
  res.status(503).json({
    error: 'LibreOffice not available on Vercel',
    message: 'This conversion endpoint requires LibreOffice which cannot run on Vercel serverless platform.',
    alternatives: [
      'Deploy to Railway, Render, Fly.io, or other platforms that support system packages',
      'Use a cloud conversion API service (e.g., CloudConvert, ConvertAPI, Adobe PDF Services)',
      'Deploy using Docker containers on platforms like Google Cloud Run or AWS ECS'
    ],
    platform: 'vercel-serverless',
    endpoint: 'pptx-to-pdf'
  });
};
