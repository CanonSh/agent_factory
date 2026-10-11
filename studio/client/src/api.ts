import type { Job, Result } from './types';
export async function api<T>(url: string, options?: RequestInit): Promise<T> { const response = await fetch(url, options); const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || 'Error de conexión con el servidor.'); return data; }
export function createJob(input: { description: string; name?: string; evaluate: boolean; aiRepair: boolean }) { return api<{ jobId: string; name: string }>('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); }
export const getJob = (id: string) => api<Job>(`/api/jobs/${id}`); export const getResult = (id: string) => api<Result>(`/api/jobs/${id}/result`);
