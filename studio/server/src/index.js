import express from 'express';
import fs from 'node:fs';
import { clientDist, factoryFile, isWindows, port } from './config.js';
import { createJobManager } from './jobManager.js';
import { createRouter } from './routes.js';
import { execFileSync } from 'node:child_process';

const app = express(); const manager = createJobManager();
let runtimeCache = { value: false, checkedAt: 0 };
function boxlangAvailable() {
  if (process.env.STUDIO_BOX_LANG_AVAILABLE === 'true') return true;
  if (process.env.STUDIO_BOX_LANG_AVAILABLE === 'false') return false;
  if (!fs.existsSync(factoryFile)) return false;
  if (Date.now() - runtimeCache.checkedAt < 10_000) return runtimeCache.value;
  try {
    const command = process.platform === 'win32'
      ? ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '& boxlang --version']
      : ['--version'];
    execFileSync(process.platform === 'win32' ? 'powershell.exe' : 'boxlang', command, { stdio: 'ignore', timeout: 5000, windowsHide: true });
    runtimeCache = { value: true, checkedAt: Date.now() };
  } catch {
    runtimeCache = { value: false, checkedAt: Date.now() };
  }
  return runtimeCache.value;
}
function health() { return { boxlangAvailable: boxlangAvailable(), geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'coloca_tu_api_key_aqui'), busy: manager.isBusy(), version: 'studio-1.0' }; }
app.disable('x-powered-by'); app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => { if (req.method === 'POST' && req.headers.origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(req.headers.origin)) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Origen no permitido.' } }); next(); });
app.use('/api', createRouter({ manager, health }));
if (fs.existsSync(clientDist)) { app.use(express.static(clientDist)); app.get('*path', (_req, res) => res.sendFile(`${clientDist}/index.html`)); }
if (process.env.NODE_ENV !== 'test') app.listen(port, '127.0.0.1', () => console.log(`Agent Factory Studio: http://127.0.0.1:${port}`));
export { app, manager, health };
