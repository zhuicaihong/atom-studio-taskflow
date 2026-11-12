import type { AgentStep, AppSpec, ChatMessage, GeneratedFile } from '../../types';
import { uid } from '../id';
import { inferSpec, patchSpec } from './specs';
import { buildFiles, buildPreviewHtml } from './templates';

const KIND_LABEL: Record<string, string> = {
  tasks: '任务管理',
  habits: '习惯追踪',
  expenses: '记账',
  notes: '笔记',
  bookmarks: '收藏夹',
  reading: '阅读清单',
  crm: '客户管理',
  timer: '专注计时',
};

const VIEW_LABEL: Record<string, string> = {
  list: '清单',
  board: '看板',
  table: '表格',
  grid: '卡片',
  week: '周视图',
  timer: '计时器',
};

export interface GenerateOutput {
  spec: AppSpec;
  files: GeneratedFile[];
  previewHtml: string;
  name: string;
  summary: string;
  reply: string;
  steps: AgentStep[];
}

export function generate(prompt: string): GenerateOutput {
  const spec = inferSpec(prompt);
  const files = buildFiles(spec);
  const previewHtml = buildPreviewHtml(spec, files);
  const storageKey = 'atom-app:' + spec.storageKey;

  const steps: AgentStep[] = [
    { id: 's1', label: '理解需求', detail: `识别为「${KIND_LABEL[spec.kind] || '通用工具'}」场景，提取核心对象与操作`, status: 'done' },
    {
      id: 's2',
      label: '设计数据模型',
      detail: `定义 ${spec.fields.length} 个字段${spec.statuses ? `、${spec.statuses.length} 个状态` : ''}，并生成示例数据`,
      status: 'done',
    },
    {
      id: 's3',
      label: '生成界面',
      detail: `${VIEW_LABEL[spec.view]}视图 + 统计卡片 + 响应式布局，主色 ${spec.accent}`,
      status: 'done',
    },
    { id: 's4', label: '编写交互', detail: '新增 / 编辑 / 删除 / 搜索 / 筛选 / 状态流转', status: 'done' },
    { id: 's5', label: '接入数据持久化', detail: `localStorage · ${storageKey}`, status: 'done' },
    { id: 's6', label: '自检并准备预览', detail: '校验必填项、空状态、移动端适配，生成 4 个文件', status: 'done' },
  ];

  const feedback = spec.features.length ? `\n\n**已内置能力**：${spec.features.join('、')}` : '';
  const reply = `已经为你生成 **${spec.appName}** —— ${spec.description}。\n\n- 视图模式：${VIEW_LABEL[spec.view]}${spec.statuses ? `\n- 状态流转：${spec.statuses.map((s) => s.label).join(' → ')}` : ''}\n- 数据字段：${spec.fields.map((f) => f.label).join('、')}\n- 数据自动保存在浏览器本地，刷新不丢失${feedback}\n\n继续告诉我你的想法，例如「换成深色主题」「改用看板视图」「增加一个备注字段」，我会直接改。`;

  return {
    spec,
    files,
    previewHtml,
    name: spec.appName,
    summary: `${VIEW_LABEL[spec.view]}视图 · ${spec.fields.length} 个字段${spec.statuses ? ` · ${spec.statuses.length} 个状态` : ''}`,
    reply,
    steps,
  };
}

export interface ReviseOutput {
  spec: AppSpec;
  files: GeneratedFile[];
  previewHtml: string;
  reply: string;
  steps: AgentStep[];
  changed: boolean;
}

export function revise(spec: AppSpec, message: string): ReviseOutput {
  const result = patchSpec(spec, message);
  if (!result.changed) {
    return {
      spec,
      files: [],
      previewHtml: '',
      reply: result.reply,
      steps: [{ id: 'r1', label: '解析修改意图', detail: result.summary, status: 'done' }],
      changed: false,
    };
  }
  const files = buildFiles(result.spec);
  const previewHtml = buildPreviewHtml(result.spec, files);
  const steps: AgentStep[] = [
    { id: 'r1', label: '解析修改意图', detail: result.summary, status: 'done' },
    { id: 'r2', label: '更新应用配置', detail: `字段 ${result.spec.fields.length} 个 · 视图 ${VIEW_LABEL[result.spec.view]}`, status: 'done' },
    { id: 'r3', label: '重新生成代码', detail: '同步更新 index.html / styles.css / app.js', status: 'done' },
    { id: 'r4', label: '校验预览', detail: '保持本地数据兼容，刷新预览', status: 'done' },
  ];
  return { spec: result.spec, files, previewHtml, reply: result.reply, steps, changed: true };
}

export function makeUserMessage(text: string): ChatMessage {
  return { id: uid(), role: 'user', content: text, ts: Date.now() };
}

export function makeAgentMessage(content: string, steps: AgentStep[], engine: 'builtin' | 'llm'): ChatMessage {
  return {
    id: uid(),
    role: 'agent',
    content,
    steps,
    filesTouched: [],
    ts: Date.now(),
    engine,
  };
}
