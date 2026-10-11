import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRoot, factoryFile, tempRoot, isWindows } from './config.js';
import { redact } from './redact.js';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'run-factory.ps1');
export function runFactory(request, onLine, { timeoutMs = 10 * 60 * 1000 } = {}) {
  const requestFile = path.join(tempRoot, `request-${cryptoRandom()}.json`); fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(requestFile, JSON.stringify(request), 'utf8');
  const args = isWindows ? ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-RequestFile', requestFile] : [factoryFile, `--description=${request.description}`, `--name=${request.name}`, ...(request.evaluate ? ['--evaluate'] : []), ...(request.aiRepair ? ['--ai-repair'] : [])];
  const command = isWindows ? 'powershell.exe' : 'boxlang';
  const child = spawn(command, args, { cwd: repoRoot, env: process.env, shell: false, windowsHide: true });
  let stdout = ''; let stderr = ''; let buffer = ''; let timer;
  const emit = (line, stream) => { const safe = redact(line); onLine(safe, stream); };
  const consume = (chunk, stream) => { buffer += chunk.toString('utf8'); const lines = buffer.split(/\r?\n/); buffer = lines.pop() ?? ''; for (const line of lines) { if (stream === 'stdout') stdout += line + '\n'; else stderr += line + '\n'; emit(line, stream); } };
  child.stdout.on('data', (chunk) => consume(chunk, 'stdout')); child.stderr.on('data', (chunk) => consume(chunk, 'stderr'));
  timer = setTimeout(() => child.kill(), timeoutMs);
  return new Promise((resolve) => {
    child.on('error', (err) => { clearTimeout(timer); if (buffer) emit(buffer, 'stderr'); fs.rmSync(requestFile, { force: true }); resolve({ exitCode: -1, stdout, stderr: `${stderr}${err.message}`, error: err }); });
    child.on('close', (exitCode) => { clearTimeout(timer); if (buffer) { stderr += buffer; emit(buffer, 'stderr'); } fs.rmSync(requestFile, { force: true }); resolve({ exitCode: exitCode ?? -1, stdout, stderr }); });
  });
}
export function cryptoRandom() { return Math.random().toString(16).slice(2) + Date.now().toString(16); }
