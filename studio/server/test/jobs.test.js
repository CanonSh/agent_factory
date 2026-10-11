import test from 'node:test';
import assert from 'node:assert/strict';
import { createJobManager } from '../src/jobManager.js';

function waitFor(predicate) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (predicate()) { clearInterval(timer); resolve(); }
      else if (Date.now() - started > 1000) { clearInterval(timer); reject(new Error('timeout')); }
    }, 5);
  });
}

test('bloquea una segunda generación y libera el lock al terminar', async () => {
  let release;
  const runner = async (_request, onLine) => {
    onLine('[1/4] Analyst: iniciado', 'stdout');
    await new Promise(resolve => { release = resolve; });
    onLine('[4/4] Validator: compilando', 'stdout');
    onLine('[OK] Build correcto (exitCode=0, intento 1/3).', 'stdout');
    return { exitCode: 0 };
  };
  const manager = createJobManager({ runner });
  const job = manager.create({ name: 'First', description: 'Descripción válida', evaluate: false, aiRepair: false });
  assert.throws(() => manager.create({ name: 'Second', description: 'Descripción válida', evaluate: false, aiRepair: false }), /generación en curso/);
  release();
  await waitFor(() => manager.get(job.id).status === 'success');
  assert.equal(manager.isBusy(), false);
  const second = manager.create({ name: 'Second', description: 'Descripción válida', evaluate: false, aiRepair: false });
  release();
  await waitFor(() => manager.get(second.id).status === 'success');
});
