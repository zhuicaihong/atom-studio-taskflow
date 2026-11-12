import express from 'express';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
let DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
let DATA_FILE = path.join(DATA_DIR, 'store.json');
const PORT = Number(process.env.PORT || 8787);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));

/* ------------------------------------------------------------------ */
/* 存储层：单文件 JSON，原子写入                                         */
/* ------------------------------------------------------------------ */

let store = { workspaces: {}, projects: {}, shares: {} };
let writing = false;

async function loadStore() {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    store = {
      workspaces: parsed.workspaces || {},
      projects: parsed.projects || {},
      shares: parsed.shares || {},
    };
  } catch {
    store = { workspaces: {}, projects: {}, shares: {} };
  }
}

async function persist() {
  if (writing) return;
  writing = true;
  try {
    try {
      await fsp.mkdir(DATA_DIR, { recursive: true });
      const tmp = DATA_FILE + '.tmp';
      await fsp.writeFile(tmp, JSON.stringify(store), 'utf8');
      await fsp.rename(tmp, DATA_FILE);
    } catch (err) {
      // 容器只读文件系统时回退到临时目录，保证演示环境仍可持久化
      if (err && (err.code === 'EROFS' || err.code === 'EACCES' || err.code === 'EPERM')) {
        DATA_DIR = path.join(os.tmpdir(), 'atom-studio-data');
        DATA_FILE = path.join(DATA_DIR, 'store.json');
        await fsp.mkdir(DATA_DIR, { recursive: true });
        await fsp.writeFile(DATA_FILE, JSON.stringify(store), 'utf8');
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('[atom-studio] persist failed:', err?.message || err);
  } finally {
    writing = false;
  }
}

/* ------------------------------------------------------------------ */
/* 简单的 owner 识别（演示用，非账号体系）                                */
/* ------------------------------------------------------------------ */

function ownerId(req) {
  const id = String(req.get('x-owner-id') || '').trim();
  return /^[a-zA-Z0-9-]{8,64}$/.test(id) ? id : null;
}

function requireOwner(req, res, next) {
  const id = ownerId(req);
  if (!id) return res.status(401).json({ error: '缺少工作区标识，请刷新页面重试' });
  req.ownerId = id;
  next();
}

const now = () => Date.now();

function summarize(p) {
  return {
    id: p.id,
    name: p.name,
    emoji: p.spec?.emoji || '🧩',
    updatedAt: p.updatedAt,
    messageCount: Array.isArray(p.messages) ? p.messages.length : 0,
    shareSlug: p.shareSlug || null,
  };
}

function safeProject(p) {
  return {
    id: p.id,
    ownerId: p.ownerId,
    name: p.name,
    prompt: p.prompt,
    engine: p.engine,
    spec: p.spec,
    files: p.files,
    messages: p.messages,
    previewHtml: p.previewHtml,
    shareSlug: p.shareSlug || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* 工作区                                                              */
/* ------------------------------------------------------------------ */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'atom-studio', time: now() });
});

app.get('/api/workspace', requireOwner, (req, res) => {
  const ws = store.workspaces[req.ownerId];
  res.json({ workspace: ws || null });
});

app.post('/api/workspace', requireOwner, async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 32);
  if (!name) return res.status(400).json({ error: '请填写你的名字' });
  const ws = {
    id: req.ownerId,
    name,
    createdAt: store.workspaces[req.ownerId]?.createdAt || now(),
    updatedAt: now(),
  };
  store.workspaces[req.ownerId] = ws;
  await persist();
  res.json({ workspace: ws });
});

/* ------------------------------------------------------------------ */
/* 项目                                                                */
/* ------------------------------------------------------------------ */

app.get('/api/projects', requireOwner, (req, res) => {
  const list = Object.values(store.projects)
    .filter((p) => p.ownerId === req.ownerId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(summarize);
  res.json({ projects: list });
});

app.post('/api/projects', requireOwner, async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.previewHtml) return res.status(400).json({ error: '项目数据不完整' });
  const id = crypto.randomUUID();
  const project = {
    id,
    ownerId: req.ownerId,
    name: String(body.name).slice(0, 60),
    prompt: String(body.prompt || '').slice(0, 4000),
    engine: body.engine === 'llm' ? 'llm' : 'builtin',
    spec: body.spec || null,
    files: Array.isArray(body.files) ? body.files : [],
    messages: Array.isArray(body.messages) ? body.messages : [],
    previewHtml: String(body.previewHtml),
    shareSlug: null,
    createdAt: now(),
    updatedAt: now(),
  };
  store.projects[id] = project;
  await persist();
  res.status(201).json({ project: safeProject(project) });
});

app.get('/api/projects/:id', requireOwner, (req, res) => {
  const p = store.projects[req.params.id];
  if (!p || p.ownerId !== req.ownerId) return res.status(404).json({ error: '项目不存在' });
  res.json({ project: safeProject(p) });
});

app.patch('/api/projects/:id', requireOwner, async (req, res) => {
  const p = store.projects[req.params.id];
  if (!p || p.ownerId !== req.ownerId) return res.status(404).json({ error: '项目不存在' });
  const body = req.body || {};
  if (body.name !== undefined) p.name = String(body.name).slice(0, 60);
  if (body.spec !== undefined) p.spec = body.spec;
  if (body.files !== undefined) p.files = Array.isArray(body.files) ? body.files : p.files;
  if (body.messages !== undefined) p.messages = Array.isArray(body.messages) ? body.messages : p.messages;
  if (body.previewHtml !== undefined) p.previewHtml = String(body.previewHtml);
  if (body.engine !== undefined) p.engine = body.engine === 'llm' ? 'llm' : 'builtin';
  p.updatedAt = now();
  await persist();
  res.json({ project: safeProject(p) });
});

app.delete('/api/projects/:id', requireOwner, async (req, res) => {
  const p = store.projects[req.params.id];
  if (!p || p.ownerId !== req.ownerId) return res.status(404).json({ error: '项目不存在' });
  if (p.shareSlug) delete store.shares[p.shareSlug];
  delete store.projects[req.params.id];
  await persist();
  res.json({ ok: true });
});

app.post('/api/projects/:id/share', requireOwner, async (req, res) => {
  const p = store.projects[req.params.id];
  if (!p || p.ownerId !== req.ownerId) return res.status(404).json({ error: '项目不存在' });
  if (!p.shareSlug) {
    let slug = '';
    do {
      slug = crypto.randomBytes(6).toString('base64url').slice(0, 8);
    } while (store.shares[slug]);
    p.shareSlug = slug;
    store.shares[slug] = p.id;
    await persist();
  }
  res.json({ shareSlug: p.shareSlug, path: '/p/' + p.shareSlug });
});

app.get('/p/:slug', (req, res) => {
  const id = store.shares[req.params.slug];
  const p = id ? store.projects[id] : null;
  if (!p) return res.status(404).send('<!doctype html><meta charset="utf-8"><title>页面不存在</title><body style="font-family:system-ui;padding:60px;text-align:center;color:#555"><h2>这个分享链接不存在或已被删除</h2></body>');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(p.previewHtml);
});

/* ------------------------------------------------------------------ */
/* LLM 代理（密钥仅在单次请求中透传，不落盘）                              */
/* ------------------------------------------------------------------ */

app.post('/api/llm/chat', async (req, res) => {
  const { baseUrl, apiKey, model, messages, temperature } = req.body || {};
  if (!baseUrl || !apiKey || !model || !Array.isArray(messages)) {
    return res.status(400).json({ error: '缺少模型配置（baseUrl / apiKey / model）' });
  }
  let url;
  try {
    const u = new URL(String(baseUrl));
    if (!/^https?:$/.test(u.protocol)) throw new Error('unsupported');
    url = u.toString().replace(/\/+$/, '') + '/chat/completions';
  } catch {
    return res.status(400).json({ error: 'Base URL 不合法' });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.6,
      }),
      signal: controller.signal,
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || data?.message || `模型服务返回 ${upstream.status}`,
      });
    }
    const content = data?.choices?.[0]?.message?.content || '';
    if (!content) return res.status(502).json({ error: '模型没有返回内容' });
    res.json({ content });
  } catch (err) {
    const aborted = err?.name === 'AbortError';
    res.status(aborted ? 504 : 502).json({ error: aborted ? '模型响应超时（120s）' : '无法连接模型服务' });
  } finally {
    clearTimeout(timer);
  }
});

/* ------------------------------------------------------------------ */
/* 静态资源                                                            */
/* ------------------------------------------------------------------ */

app.use(express.static(DIST, { index: false, maxAge: '1h' }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/p/')) return next();
  const index = path.join(DIST, 'index.html');
  if (fs.existsSync(index)) return res.sendFile(index);
  res.status(503).send('前端尚未构建，请先执行 npm run build');
});

await loadStore();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[atom-studio] listening on http://0.0.0.0:${PORT}`);
});
