import type { LLMConfig } from '../../types';

const SYSTEM_PROMPT = `你是一名资深产品工程师，负责把一句自然语言需求变成一个可以直接运行的单文件 Web 应用。

输出要求（必须全部满足）：
1. 只输出一个完整的 HTML 文件代码块，使用 \`\`\`html 包裹，不要输出任何解释文字。
2. 所有 CSS 和 JavaScript 内联在同一个 HTML 中，不引用任何外部资源、CDN、字体或图片。
3. 应用必须真实可用：有数据列表、新增/编辑/删除、搜索或筛选、空状态提示、表单校验。
4. 数据必须持久化到 localStorage（用 try/catch 包裹），刷新后保留。
5. 中文界面，视觉精致：统一的色彩系统（CSS 变量）、卡片、圆角、留白、hover 反馈、移动端响应式。
6. 内置 3-5 条贴近场景的示例数据，首次打开即可看到效果。
7. 不要使用 alert 做主要交互；使用页面内 toast 或内联反馈。不要使用任何占位图片。
8. 代码结构清晰，关键逻辑有简短注释。

只输出 HTML，不要输出 markdown 说明。`;

const REVISE_PROMPT = `你是一名资深产品工程师。下面是你之前生成的应用代码，请根据用户的新要求修改它。

规则：
1. 输出修改后的完整 HTML 文件（不是 diff），使用 \`\`\`html 包裹，不要解释。
2. 保留原有功能与数据结构，只做用户要求的改动；除非用户明确要求，不要丢弃已有功能。
3. 所有 CSS/JS 仍然内联，不使用外部资源，数据继续用 localStorage 持久化。
4. 视觉质量与之前保持同等或更高水平。`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateContent(
  config: LLMConfig,
  messages: { role: string; content: string }[],
  temperature: number
): Promise<string> {
  const res = await fetch('/api/llm/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, messages, temperature }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) throw new Error(data?.error || `无法创建生成任务（${res.status}）`);

  const deadline = Date.now() + 190000;
  while (Date.now() < deadline) {
    await sleep(2000);
    const poll = await fetch(`/api/llm/jobs/${data.id}`);
    const state = await poll.json().catch(() => ({}));
    if (!poll.ok) throw new Error(state?.error || `查询生成进度失败（${poll.status}）`);
    if (state.status === 'done') return String(state.content || '');
    if (state.status === 'error') throw new Error(state.error || '模型生成失败');
  }
  throw new Error('模型生成超时，请重试或更换更快的模型');
}

export async function generateWithLLM(
  config: LLMConfig,
  prompt: string,
  previousHtml?: string
): Promise<{ html: string; note: string }> {
  const messages = previousHtml
    ? [
        { role: 'system', content: REVISE_PROMPT },
        { role: 'user', content: `用户的新要求：${prompt}\n\n当前应用代码：\n${previousHtml.slice(0, 90000)}` },
      ]
    : [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ];

  const text = await generateContent(config, messages, 0.6);
  const match = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const html = (match ? match[1] : text).trim();
  if (!/<html[\s>]/i.test(html)) {
    throw new Error('模型没有返回完整的 HTML 应用，请重试或更换模型');
  }
  return { html, note: '由大模型实时生成' };
}

export async function testLLM(config: LLMConfig): Promise<string> {
  const res = await fetch('/api/llm/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...config,
      messages: [{ role: 'user', content: '只回复四个字：连接成功' }],
      temperature: 0,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `连接失败（${res.status}）`);
  return String(data?.content || '').trim().slice(0, 40) || '连接成功';
}
