export type PhaseStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';
export type Log = { timestamp: string; level: string; line: string; stream?: string };
export type Job = { id: string; name: string; status: string; phase: string | null; phases: Record<string, PhaseStatus>; logs: Log[]; result?: Result | null; score: number | null; exitCode: number | null; projectPath: string | null; error?: string | null };
export type Result = { projectPath: string | null; spec: Record<string, unknown> | null; manifest: { files?: { category?: string; name?: string; path?: string }[] } | null; evaluation?: { tests?: { index: number; passed: boolean }[]; incomplete?: boolean } | null; repair?: unknown; inspectError?: string | null };
