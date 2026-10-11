import express from 'express';
import fs from 'node:fs';
import { factoryFile } from './config.js';
import { validateJobInput, nameExists, suggestedName, outputPath, error } from './validation.js';
import { listFiles, readFileContent } from './resultReader.js';

export function createRouter({ manager, health }) {
  const router = express.Router();
  router.get('/health', (_req, res) => res.json({ ok: true, ...health() }));
  router.get('/jobs', (_req, res) => res.json(manager.list()));
  router.post('/jobs', (req, res) => {
    try {
      const input = validateJobInput(req.body); if (nameExists(input.name)) throw error('NAME_EXISTS', `Ya existe un agente con este nombre. Prueba ${suggestedName(input.name)}.`, { suggestedName: suggestedName(input.name) });
      if (!fs.existsSync(factoryFile)) throw error('NOT_READY', 'No se encontró factory.bxs.');
      const ready = health(); if (!ready.boxlangAvailable || !ready.geminiConfigured) throw error('NOT_READY', !ready.boxlangAvailable ? 'BoxLang no está disponible en esta terminal.' : 'GEMINI_API_KEY no está configurada.');
      const job = manager.create(input); res.status(202).json({ jobId: job.id, name: job.name, status: job.status, eventsUrl: `/api/jobs/${job.id}/events` });
    } catch (err) { const status = err.code === 'NAME_EXISTS' || err.code === 'BUSY' ? 409 : err.code === 'NOT_READY' ? 503 : 400; res.status(status).json({ error: { code: err.code || 'INVALID_INPUT', message: err.message, ...(err.suggestedName ? { suggestedName: err.suggestedName } : {}) } }); }
  });
  router.get('/jobs/:id', (req, res) => { const job = manager.get(req.params.id); if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job no encontrado en la memoria de este servidor.' } }); res.json(job); });
  router.get('/jobs/:id/events', (req, res) => { res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' }); res.flushHeaders(); if (!manager.subscribe(req.params.id, res, Number(req.get('Last-Event-ID') || 0))) res.status(404).end(); });
  router.get('/jobs/:id/result', (req, res) => { const job = manager.get(req.params.id); if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job no encontrado.' } }); res.json({ status: job.status, score: job.score, ...job.result }); });
  router.get('/jobs/:id/files', async (req, res) => { try { const job = manager.get(req.params.id); if (!job?.result?.projectPath) throw new Error('Los archivos solo están disponibles después de un resultado.'); res.json({ files: await listFiles(job.result.projectPath) }); } catch (err) { res.status(403).json({ error: { code: 'FORBIDDEN', message: err.message } }); } });
  router.get('/jobs/:id/files/content', async (req, res) => { try { const job = manager.get(req.params.id); if (!job?.result?.projectPath) throw new Error('Proyecto no disponible.'); res.type('text/plain').send(await readFileContent(job.result.projectPath, req.query.path)); } catch (err) { res.status(403).json({ error: { code: 'FORBIDDEN', message: err.message } }); } });
  return router;
}
