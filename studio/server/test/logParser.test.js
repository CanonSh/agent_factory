import test from 'node:test';
import assert from 'node:assert/strict';
import { createParser, finalStatus } from '../src/logParser.js';

test('detecta las cinco etapas, nombre, ruta, intento y evaluación', () => {
  const parser = createParser(true);
  for (const line of [
    '[1/5] Analyst: generando especificacion con Gemini...',
    '[2/5] AgentSpec: validando los ocho campos...',
    '[OK] Nombre: DemoAgent',
    '[3/5] Generator: creando proyecto BX Agents...',
    '[OK] Proyecto creado: C:\\repo\\output\\DemoAgent',
    '[4/5] Validator: compilando proyecto BX Agents...',
    '[OK] Build correcto (exitCode=0, intento 1/3).',
    '[5/5] Evaluator: ejecutando 3 pruebas reales...',
    '[OK] Evaluacion completada. Puntaje orientativo: 90/100',
    '  Prueba 1: APROBADA',
    '=== AGENTE CREADO, COMPILADO Y EVALUADO ==='
  ]) parser.parse(line);
  const state = parser.snapshot();
  assert.equal(state.name, 'DemoAgent');
  assert.match(state.projectPath, /DemoAgent$/);
  assert.equal(state.score, 90);
  assert.equal(state.attempt, 1);
  assert.equal(state.evaluation.tests[0].passed, true);
  assert.equal(state.phases.evaluator, 'success');
  assert.equal(finalStatus(0, true, state.evaluation), 'success');
});

test('distingue evaluación desactivada e incompleta', () => {
  const parser = createParser(false);
  parser.parse('[4/4] Validator: compilando proyecto BX Agents...');
  parser.parse('[OK] Build correcto (exitCode=0, intento 2/3).');
  assert.equal(parser.snapshot().phases.evaluator, 'skipped');
  assert.equal(finalStatus(2, true, { incomplete: true }), 'partial');
  assert.equal(finalStatus(1, false, null), 'failed');
});
