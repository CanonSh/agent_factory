const phaseNames = ['analyst', 'agentSpec', 'generator', 'validator', 'evaluator'];
export function createParser(evaluate = true) {
  const phases = { analyst: 'pending', agentSpec: 'pending', generator: 'pending', validator: 'pending', evaluator: evaluate ? 'pending' : 'skipped' };
  let projectPath = null; let name = null; let score = null; let attempt = null; let evaluation = null; let lastPhase = null;
  function parse(line) {
    const text = String(line).trim();
    const step = text.match(/\[(\d)\/(\d)\]\s+(Analyst|AgentSpec|Generator|Validator|Evaluator)/i);
    if (step) {
      const phase = step[3].toLowerCase() === 'agentspec' ? 'agentSpec' : step[3].toLowerCase();
      if (lastPhase && lastPhase !== phase) phases[lastPhase] = 'success';
      phases[phase] = 'running'; lastPhase = phase;
    }
    if (/\[OK\]\s+Nombre:/i.test(text)) name = text.replace(/^.*?Nombre:\s*/i, '').trim();
    const project = text.match(/(?:Proyecto creado|Ruta|Proyecto compilado):\s*(.+)$/i); if (project) projectPath = project[1].trim();
    const build = text.match(/Build correcto.*?intento\s+(\d+)\/(\d+)/i); if (build) { phases.validator = 'success'; attempt = Number(build[1]); }
    const repair = text.match(/intento\s+(\d+)\/3/i); if (repair) attempt = Number(repair[1]);
    const rating = text.match(/Puntaje orientativo:\s*(\d+)\/100/i); if (rating) { score = Number(rating[1]); phases.evaluator = 'success'; }
    const test = text.match(/Prueba\s+(\d+):\s+(APROBADA|NO APROBADA)/i); if (test) { evaluation ??= { tests: [] }; evaluation.tests.push({ index: Number(test[1]), passed: test[2].toUpperCase() === 'APROBADA' }); }
    if (/evaluaci[oó]n.*incompleta|no se ejecutar[aá].*Evaluator/i.test(text)) { phases.evaluator = 'error'; evaluation ??= {}; evaluation.incomplete = true; }
    if (/=== AGENTE CREADO/i.test(text)) for (const phase of phaseNames) if (phases[phase] === 'running' || (phase === 'evaluator' && phases[phase] === 'pending')) phases[phase] = phase === 'evaluator' && !evaluate ? 'skipped' : 'success';
    if (/\[ERROR\]/i.test(text) && lastPhase) phases[lastPhase] = 'error';
    return { phases: { ...phases }, phase: lastPhase, projectPath, name, score, attempt, evaluation };
  }
  return { parse, snapshot: () => ({ phases: { ...phases }, phase: lastPhase, projectPath, name, score, attempt, evaluation }) };
}
export function finalStatus(exitCode, evaluate, evaluation) { if (exitCode === 0) return evaluate && evaluation?.incomplete ? 'partial' : 'success'; if (exitCode === 2) return 'partial'; return 'failed'; }
