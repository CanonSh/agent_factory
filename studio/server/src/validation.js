import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { outputRoot } from './config.js';

const keys = new Set(['description', 'name', 'evaluate', 'aiRepair']);
export function makeName() { return `Agent_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`; }
export function validateJobInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw error('INVALID_INPUT', 'El cuerpo debe ser un objeto JSON.');
  for (const key of Object.keys(body)) if (!keys.has(key)) throw error('INVALID_INPUT', `Campo no permitido: ${key}.`);
  if (typeof body.description !== 'string' || body.description.trim().length < 10 || body.description.trim().length > 2000 || /\0/.test(body.description)) {
    throw error('INVALID_INPUT', 'La descripción debe tener entre 10 y 2000 caracteres y no contener NUL.');
  }
  const name = body.name == null || body.name === '' ? makeName() : body.name;
  if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,49}$/.test(name)) throw error('INVALID_INPUT', 'El nombre debe comenzar con letra y usar solo letras, números, _ o -.');
  if (body.evaluate !== undefined && typeof body.evaluate !== 'boolean') throw error('INVALID_INPUT', 'evaluate debe ser booleano.');
  if (body.aiRepair !== undefined && typeof body.aiRepair !== 'boolean') throw error('INVALID_INPUT', 'aiRepair debe ser booleano.');
  return { description: body.description.trim(), name, evaluate: body.evaluate ?? true, aiRepair: body.aiRepair ?? false };
}
export function outputPath(name) { return path.join(outputRoot, name); }
export function nameExists(name) { return fs.existsSync(outputPath(name)); }
export function suggestedName(name) { let i = 2; while (nameExists(`${name}_${i}`)) i++; return `${name}_${i}`; }
export function error(code, message, extra = {}) { return Object.assign(new Error(message), { code, ...extra }); }
