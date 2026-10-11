import crypto from 'node:crypto';
import { runFactory } from './boxlangRunner.js';
import { createParser, finalStatus } from './logParser.js';
import { inspectProject, readProjectResult } from './resultReader.js';
import { redact } from './redact.js';

export function createJobManager({ runner = runFactory, inspector = inspectProject, resultReader = readProjectResult, maxJobs = 20 } = {}) {
  const jobs = new Map(); let active = false;
  function publicJob(job) { const { listeners, events, ...safe } = job; return { ...safe, recentLogs: job.logs.slice(-100), result: job.result }; }
  function emit(job, event, data) { const item = { id: ++job.eventId, event, data }; job.events.push(item); if (job.events.length > 1500) job.events.shift(); for (const listener of job.listeners) listener(item); }
  function addLog(job, line, stream) { const entry = { timestamp: new Date().toISOString(), level: stream === 'stderr' ? 'error' : /\[ERROR\]/i.test(line) ? 'error' : /\[AVISO\]/i.test(line) ? 'warning' : /\[OK\]/i.test(line) ? 'success' : 'info', line: redact(line), stream }; job.logs.push(entry); if (job.logs.length > 1500) job.logs.shift(); emit(job, 'log', entry); const parsed = job.parser.parse(line); Object.assign(job, parsed); emit(job, 'phase', { phase: parsed.phase, phases: parsed.phases, attempt: parsed.attempt }); }
  async function execute(job, request) {
    job.status = 'running'; job.startedAt = new Date().toISOString(); active = true; emit(job, 'snapshot', publicJob(job));
    const processResult = await runner(request, (line, stream) => addLog(job, line, stream));
    job.exitCode = processResult.exitCode; if (processResult.error) addLog(job, processResult.error.message, 'stderr');
    if (job.phase && job.phases[job.phase] === 'running') job.phases[job.phase] = processResult.exitCode === 0 ? 'success' : 'error';
    if (processResult.exitCode === 0 && job.projectPath) {
      job.result = await resultReader(job.projectPath, job.name, inspector);
      job.result.evaluation = job.evaluation;
    }
    job.status = finalStatus(processResult.exitCode, request.evaluate, job.evaluation); job.finishedAt = new Date().toISOString(); active = false;
    emit(job, 'complete', { status: job.status, exitCode: job.exitCode });
  }
  return {
    isBusy: () => active,
    create(request) { if (active) throw Object.assign(new Error('Ya hay una generación en curso.'), { code: 'BUSY' }); const id = crypto.randomUUID(); const job = { id, name: request.name, status: 'queued', createdAt: new Date().toISOString(), startedAt: null, finishedAt: null, phase: null, phases: { analyst: 'pending', agentSpec: 'pending', generator: 'pending', validator: 'pending', evaluator: request.evaluate ? 'pending' : 'skipped' }, attempt: null, exitCode: null, projectPath: null, score: null, evaluation: null, error: null, logs: [], events: [], eventId: 0, listeners: new Set(), parser: createParser(request.evaluate), result: null }; jobs.set(id, job); while (jobs.size > maxJobs) jobs.delete(jobs.keys().next().value); void execute(job, request).catch(err => { job.status = 'failed'; job.error = redact(err.message); job.finishedAt = new Date().toISOString(); active = false; emit(job, 'error', { message: job.error }); emit(job, 'complete', { status: 'failed', exitCode: job.exitCode }); }); return job; },
    get(id) { return jobs.get(id); }, list() { return [...jobs.values()].reverse().map(publicJob); },
    subscribe(id, res, lastId = 0) { const job = jobs.get(id); if (!job) return false; for (const item of job.events) if (item.id > lastId) send(res, item); const listener = item => send(res, item); job.listeners.add(listener); const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000); res.once('close', () => { job.listeners.delete(listener); clearInterval(heartbeat); }); return true; }
  };
}
function send(res, item) { res.write(`id: ${item.id}\nevent: ${item.event}\ndata: ${JSON.stringify(item.data)}\n\n`); }
