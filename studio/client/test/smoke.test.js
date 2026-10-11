import test from 'node:test'; import assert from 'node:assert/strict';
test('el paquete cliente contiene una aplicación real', async () => { const source = await (await import('node:fs/promises')).readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'); assert.match(source, /EventSource/); assert.match(source, /createJob/); });
