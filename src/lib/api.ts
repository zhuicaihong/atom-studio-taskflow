import type { LLMConfig, Project, ProjectSummary, Workspace } from '../types';
import { uid } from './id';

const OWNER_KEY = 'atom-owner-id';

export function getOwnerId(): string {
  let id = localStorage.getItem(OWNER_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(OWNER_KEY, id);
  }
  return id;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-owner-id': getOwnerId(),
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string })?.error || `请求失败（${res.status}）`);
  return data as T;
}

export const api = {
  getWorkspace: () => request<{ workspace: Workspace | null }>('/api/workspace'),
  createWorkspace: (name: string) =>
    request<{ workspace: Workspace }>('/api/workspace', { method: 'POST', body: JSON.stringify({ name }) }),
  listProjects: () => request<{ projects: ProjectSummary[] }>('/api/projects'),
  getProject: (id: string) => request<{ project: Project }>(`/api/projects/${id}`),
  createProject: (payload: Partial<Project> & { messages: unknown[] }) =>
    request<{ project: Project }>('/api/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id: string, payload: Partial<Project>) =>
    request<{ project: Project }>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProject: (id: string) => request<{ ok: boolean }>(`/api/projects/${id}`, { method: 'DELETE' }),
  shareProject: (id: string) =>
    request<{ shareSlug: string; path: string }>(`/api/projects/${id}/share`, { method: 'POST' }),
};

export function loadLLMConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem('atom-llm-config');
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o-mini' };
}

export function saveLLMConfig(config: LLMConfig) {
  localStorage.setItem('atom-llm-config', JSON.stringify(config));
}
