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
  res.status(200).json({
    name: 'ConvertAI API',
    version: '1.0.0',
    platform: 'Vercel Serverless',
    status: 'online',
    important: 'LibreOffice conversions are NOT available on Vercel serverless platform',
    endpoints: {
      status: '/api/status',
      health: '/api/healthz',
      conversions: {
        note: 'Conversion endpoints return 503 on Vercel - LibreOffice not supported',
        endpoints: [
          '/api/convert/pptx-to-pdf',
          '/api/convert/pdf-to-pptx',
          '/api/convert/docx-to-pdf',
          '/api/convert/pdf-to-docx'
        ]
      }
    },
    deployment: {
      platform: 'vercel',
      limitations: [
        'No system packages (LibreOffice)',
        'Serverless functions have time limits',
        'File system is read-only except /tmp'
      ],
      recommendations: [
        'For full LibreOffice conversion support, deploy to: Railway, Render, Fly.io, or use Docker',
        'Alternatively, integrate with cloud conversion APIs like CloudConvert or Adobe PDF Services'
      ]
    }
  });
};
