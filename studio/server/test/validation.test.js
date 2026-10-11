import test from 'node:test';
import assert from 'node:assert/strict';
import { validateJobInput } from '../src/validation.js';

test('valida descripción, nombre y tipos estrictos', () => {
  const value = validateJobInput({ description: 'Crea un agente útil', name: 'Demo_01', evaluate: false, aiRepair: true });
  assert.deepEqual(value, { description: 'Crea un agente útil', name: 'Demo_01', evaluate: false, aiRepair: true });
  assert.throws(() => validateJobInput({ description: 'corta' }), /entre 10 y 2000/);
  assert.throws(() => validateJobInput({ description: 'Descripción válida', name: '../bad' }), /comenzar con letra/);
  assert.throws(() => validateJobInput({ description: 'Descripción válida', evaluate: 'true' }), /booleano/);
  assert.throws(() => validateJobInput({ description: 'Descripción válida', command: 'whoami' }), /no permitido/);
});

test('no convierte texto libre en parámetros adicionales', () => {
  const value = validateJobInput({ description: 'Analiza comillas " & | ; % y saltos\nde línea' });
  assert.equal(value.description.includes('& | ;'), true);
  assert.equal(value.name.startsWith('Agent_'), true);
});
