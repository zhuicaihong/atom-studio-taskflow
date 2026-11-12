export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'url';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;
}

export interface StatusDef {
  key: string;
  label: string;
  color: string;
}

export type AppView = 'list' | 'board' | 'table' | 'grid' | 'week' | 'timer';

export interface AppSpec {
  kind: string;
  appName: string;
  emoji: string;
  tagline: string;
  description: string;
  view: AppView;
  accent: string;
  dark: boolean;
  fields: FieldDef[];
  statuses?: StatusDef[];
  titleField: string;
  subtitleField?: string;
  categoryField?: string;
  numericField?: string;
  valueLabel?: string;
  dateField?: string;
  searchable: boolean;
  seed: Record<string, unknown>[];
  storageKey: string;
  features: string[];
  timer?: { focus: number; rest: number };
}

export interface GeneratedFile {
  path: string;
  language: 'html' | 'css' | 'javascript' | 'json';
  content: string;
}

export interface AgentStep {
  id: string;
  label: string;
  detail: string;
  status: 'running' | 'done' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  steps?: AgentStep[];
  filesTouched?: string[];
  ts: number;
  engine?: 'builtin' | 'llm';
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  prompt: string;
  engine: 'builtin' | 'llm';
  spec: AppSpec | null;
  files: GeneratedFile[];
  messages: ChatMessage[];
  previewHtml: string;
  shareSlug?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  emoji: string;
  updatedAt: number;
  messageCount: number;
  shareSlug?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ToastItem {
  id: string;
  text: string;
  tone?: 'default' | 'success' | 'error';
}
