import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { outputRoot, repoRoot } from './config.js';
import { redact } from './redact.js';
import { spawn } from 'node:child_process';

const forbidden = /(^|[\\/])(?:\.env|\.git|\.build|node_modules|logs)(?:[\\/]|$)/i;
const allowed = new Set(['.bx', '.md', '.json', '.txt']);
function inside(candidate, root) { const relative = path.relative(root, candidate); return relative && !relative.startsWith('..') && !path.isAbsolute(relative); }
export function safeProjectPath(candidate, expectedName) {
  if (!candidate) return null;
  let resolved;
  let outputReal;
  try {
    resolved = fsSync.realpathSync(path.resolve(candidate.replace(/^['"]|['"]$/g, '')));
    outputReal = fsSync.realpathSync(path.resolve(outputRoot));
  } catch { return null; }
  if (!inside(resolved, outputReal)) return null;
  const base = path.basename(resolved).toLowerCase(); const expected = expectedName.toLowerCase();
  if (base !== expected && !/^.+_repair[23]$/i.test(base)) return null;
  return resolved;
}
async function readJson(file) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; } }
export async function readProjectResult(projectPath, name, inspectRunner) {
  const safePath = safeProjectPath(projectPath, name); if (!safePath) return { projectPath: null, spec: null, manifest: null, evaluation: null, repair: null, inspectError: 'La ruta del proyecto no es segura.' };
  const spec = await readJson(path.join(safePath, 'agent-spec.json'));
  let manifest = null; let inspectError = null;
  if (inspectRunner) {
    try { const out = await inspectRunner(safePath); manifest = JSON.parse(out); } catch (err) { inspectError = redact(`No se pudo comprobar el manifiesto: ${err.message}`); }
  }
  const repair = await readJson(path.join(safePath, 'repair-diagnostics.json'));
  return { projectPath: safePath, spec, manifest, evaluation: null, repair, inspectError };
}
export async function inspectProject(projectPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'powershell.exe' : 'boxlang', process.platform === 'win32' ? ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', 'boxlang module:bxagents inspect --json'] : ['module:bxagents', 'inspect', '--json'], { cwd: projectPath, shell: false, windowsHide: true });
    let out = ''; let err = ''; child.stdout.on('data', d => { out += d; }); child.stderr.on('data', d => { err += d; });
    child.on('error', reject); child.on('close', code => code === 0 ? resolve(out.trim()) : reject(new Error(err || `inspect terminó con código ${code}`)));
  });
}
function assertFilePath(projectPath, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath) || relativePath.includes('..') || relativePath.includes('\\') || forbidden.test(relativePath)) throw new Error('Ruta de archivo no permitida.');
  const candidate = path.resolve(projectPath, relativePath); if (!inside(candidate, path.resolve(projectPath))) throw new Error('Ruta fuera del proyecto.');
  const stat = fsSync.lstatSync(candidate); if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('El archivo no está permitido.');
  if (!allowed.has(path.extname(candidate).toLowerCase()) || stat.size > 200 * 1024) throw new Error('Tipo o tamaño de archivo no permitido.');
  return candidate;
}
export async function listFiles(projectPath) {
  const safeRoot = safeProjectPath(projectPath, path.basename(projectPath));
  if (!safeRoot) throw new Error('La ruta del proyecto no es segura.');
  const result = []; async function walk(dir, depth = 0) { if (depth > 4) return; for (const entry of await fs.readdir(dir, { withFileTypes: true })) { if (forbidden.test(entry.name) || entry.isSymbolicLink()) continue; const full = path.join(dir, entry.name); const relative = path.relative(safeRoot, full); if (entry.isDirectory()) await walk(full, depth + 1); else if (allowed.has(path.extname(entry.name).toLowerCase())) result.push({ path: relative.replaceAll(path.sep, '/'), size: (await fs.stat(full)).size }); } } await walk(safeRoot); return result.sort((a, b) => a.path.localeCompare(b.path));
}
export async function readFileContent(projectPath, relativePath) { return fs.readFile(assertFilePath(projectPath, relativePath), 'utf8'); }
