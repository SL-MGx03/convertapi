/*
MIT License

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


const logEl = document.getElementById('log');
const convertBtn = document.getElementById('convertBtn');
const warmBtn = document.getElementById('warmBtn');
const opSelect = document.getElementById('operation');
const fileInput = document.getElementById('fileInput');
const baseUrlInput = document.getElementById('baseUrl');

function log(msg) {
  const ts = new Date().toISOString().replace('T',' ').replace('Z','');
  logEl.textContent += `[${ts}] ${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function fetchJSON(url, opts = {}, silent = false) {
  try {
    const r = await fetch(url, { cache: 'no-store', ...opts });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    if (!silent) log(`fetchJSON error: ${url} -> ${e.message}`);
    throw e;
  }
}

async function warm(baseUrl) {
  log('Requesting warm...');
  try {
    const r = await fetch(baseUrl + '/warm', { method:'POST' });
    if (!r.ok) {
      log('Warm request failed.');
      return;
    }
    const j = await r.json();
    log(`Warm state: warmed=${j.warmed} warming=${j.warming} already=${j.already}`);
  } catch (e) {
    log(`Warm error: ${e.message}`);
  }
}

async function wakeService(baseUrl, maxMs = 45000) {
  log(`Waking service at ${baseUrl}...`);
  fetch(baseUrl + '/', { cache:'no-store' }).catch(()=>{});
  fetch(baseUrl + '/warm', { method:'POST' }).catch(()=>{});

  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const h = await fetchJSON(baseUrl + '/healthz', {}, true);
      if (h && h.ok) {
        if (h.warmed) { log('Service warmed and ready.'); return true; }
        if (h.warming) log('Service warming (LibreOffice loading)...');
        else {
          fetch(baseUrl + '/warm', { method:'POST' }).catch(()=>{});
          log('Requested warming...');
        }
      }
    } catch {
      log('Health check not available yet...');
    }
    await sleep(2000);
  }
  log('Wake timeout exceeded.');
  return false;
}

async function doConvert() {
  const baseUrl = baseUrlInput.value.trim().replace(/\/+$/, '');
  if (!baseUrl) return log('Enter service base URL.');
  const file = fileInput.files[0];
  if (!file) return log('Choose a file first.');
  const op = opSelect.value;
  const endpoint = `${baseUrl}/convert/${op}`;

  convertBtn.disabled = true;
  warmBtn.disabled = true;
  log('---');
  log(`Starting conversion: ${op}`);

  const woke = await wakeService(baseUrl);
  if (!woke) {
    log('Failed to wake service.');
    convertBtn.disabled = false;
    warmBtn.disabled = false;
    return;
  }

  log('Uploading file...');
  const form = new FormData();
  form.append('file', file);

  let resp;
  try {
    resp = await fetch(endpoint, { method:'POST', body: form });
  } catch (e) {
    log(`Network error: ${e.message}`);
    convertBtn.disabled = false;
    warmBtn.disabled = false;
    return;
  }

  if (!resp.ok) {
    const text = await resp.text();
    log(`Conversion failed: ${resp.status} ${text}`);
    convertBtn.disabled = false;
    warmBtn.disabled = false;
    return;
  }

  const blob = await resp.blob();
  const disposition = resp.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'converted.bin';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  log(`Success. Downloaded: ${filename}`);
  convertBtn.disabled = false;
  warmBtn.disabled = false;
}

convertBtn.addEventListener('click', () => {
  doConvert().catch(e => {
    log(`Fatal error: ${e.message}`);
    convertBtn.disabled = false;
    warmBtn.disabled = false;
  });
});

warmBtn.addEventListener('click', async () => {
  const baseUrl = baseUrlInput.value.trim().replace(/\/+$/, '');
  if (!baseUrl) return log('Enter service base URL first.');
  warmBtn.disabled = true;
  convertBtn.disabled = true;
  await warm(baseUrl);
  warmBtn.disabled = false;
  convertBtn.disabled = false;
});
