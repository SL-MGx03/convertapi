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

const os = require('os');

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

module.exports = async (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const pm = process.memoryUsage();
  const cpus = os.cpus();

  res.status(200).json({
    service: 'ConvertAI API (Vercel)',
    status: 'online',
    platform: 'vercel-serverless',
    note: 'LibreOffice conversions not available on Vercel. Use external API or deploy to container-friendly platform.',
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
        platform: os.platform(),
        arch: os.arch(),
        cpu: {
          model: cpus[0].model,
          cores: cpus.length
        },
        memory: {
          total: formatBytes(totalMem),
          free: formatBytes(freeMem),
          usedRaw: usedMem,
          totalRaw: totalMem
        }
      }
    }
  });
};
