import test from 'node:test';
import assert from 'node:assert/strict';
import { safeProjectPath, readFileContent } from '../src/resultReader.js';

test('rechaza rutas externas, traversal, symlinks conceptuales y secretos', async () => {
  assert.equal(safeProjectPath('C:\\outside\\Demo', 'Demo'), null);
  await assert.rejects(() => readFileContent('C:\\outside\\Demo', '../.env'), /Ruta de archivo no permitida|ENOENT/);
  await assert.rejects(() => readFileContent('C:\\outside\\Demo', '.env'), /Ruta de archivo no permitida|ENOENT/);
});
