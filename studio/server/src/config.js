import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const studioDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const repoRoot = path.resolve(studioDir, '..');
export const outputRoot = path.join(repoRoot, 'output');
export const factoryFile = path.join(repoRoot, 'factory.bxs');
export const clientDist = path.join(studioDir, 'client', 'dist');
export const tempRoot = path.join(studioDir, 'server', '.tmp');
export const port = Number(process.env.STUDIO_PORT || 4317);
export const isWindows = process.platform === 'win32';
export function ensureTempRoot() { fs.mkdirSync(tempRoot, { recursive: true }); }
