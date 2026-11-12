import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import type { LLMConfig, ToastItem } from '../types';
import { testLLM } from '../lib/agent/llm';

/* ------------------------------------------------------------------ */
/* 首次进入：初始化工作区                                                */
/* ------------------------------------------------------------------ */

export function Onboarding({ busy, onCreate }: { busy: boolean; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="onboarding">
      <div className="onboard-card">
        <div className="onboard-visual">
          <div className="orb-bg" />
          <div className="sidebar-brand" style={{ padding: 0 }}>
            <div className="logo-mark">A</div>
            <div>
              <div className="brand-name">Atom Studio</div>
              <div className="brand-sub">AI App Agent</div>
            </div>
          </div>
          <h1>
            用一句话，
            <br />
            构建<em>可用的应用</em>。
          </h1>
          <p>
            这是一个 Agent 驱动的应用生成器：理解需求、设计数据模型、生成界面与交互，
            并在浏览器里直接运行、保存、分享。
          </p>
          <div className="onboard-points">
            <div className="point">
              <div className="point-icon"><Sparkles size={13} /></div>
              <div><b>Agent 生成</b><span>自动拆解需求，输出真实可运行的 HTML / CSS / JS</span></div>
            </div>
            <div className="point">
              <div className="point-icon"><Database size={13} /></div>
              <div><b>数据持久化</b><span>应用数据与项目内容都会保存，刷新不丢失</span></div>
            </div>
            <div className="point">
              <div className="point-icon"><Layers size={13} /></div>
              <div><b>持续迭代</b><span>用自然语言修改主题、视图、字段与功能</span></div>
            </div>
            <div className="point">
              <div className="point-icon"><Code2 size={13} /></div>
              <div><b>代码可见</b><span>随时查看、复制、下载生成的应用代码</span></div>
            </div>
          </div>
        </div>
        <div className="onboard-form">
          <h2>创建你的工作区</h2>
          <p className="sub">不需要邮箱和密码，输入一个称呼即可开始。你的应用会和这个浏览器绑定。</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && !busy) onCreate(name.trim());
            }}
          >
            <div className="field">
              <label>你的名字</label>
              <input
                autoFocus
                maxLength={20}
                placeholder="例如：龚幹"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="hint">用于工作区展示，之后可以在设置中修改。</div>
            </div>
            <button className="btn primary" type="submit" disabled={!name.trim() || busy}>
              {busy ? '正在创建工作区…' : '进入 Atom Studio'}
              <ArrowRight size={14} />
            </button>
          </form>
          <div className="onboard-foot">
            默认使用内置生成引擎，无需 API Key。<br />
            也可以随时在设置里接入 OpenAI 兼容的大模型。
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 设置                                                                */
/* ------------------------------------------------------------------ */

interface SettingsProps {
  engine: 'builtin' | 'llm';
  llm: LLMConfig;
  onClose: () => void;
  onSave: (engine: 'builtin' | 'llm', llm: LLMConfig) => void;
}

export function SettingsModal({ engine, llm, onClose, onSave }: SettingsProps) {
  const [nextEngine, setNextEngine] = useState(engine);
  const [config, setConfig] = useState<LLMConfig>(llm);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const update = (patch: Partial<LLMConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const runTest = async () => {
    if (!config.baseUrl || !config.apiKey || !config.model) {
      setResult({ ok: false, text: '请先填写 Base URL、API Key 和模型名称' });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const reply = await testLLM(config);
      setResult({ ok: true, text: `连接成功：${reply}` });
    } catch (err) {
      setResult({ ok: false, text: (err as Error).message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>生成引擎设置</h2>
          <p className="sub">内置引擎开箱即用；接入大模型后可生成更自由的应用。</p>
          <button className="icon-button modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="engine-cards">
          <button
            className={`engine-card ${nextEngine === 'builtin' ? 'active' : ''}`}
            onClick={() => setNextEngine('builtin')}
          >
            <b><Zap size={12} style={{ verticalAlign: -1 }} /> 内置引擎</b>
            <span>本地规则生成，无需 API Key，响应快、稳定，支持任务/习惯/记账/笔记等场景。</span>
          </button>
          <button
            className={`engine-card ${nextEngine === 'llm' ? 'active' : ''}`}
            onClick={() => setNextEngine('llm')}
          >
            <b><Sparkles size={12} style={{ verticalAlign: -1 }} /> 大模型</b>
            <span>OpenAI 兼容接口，可生成任意类型的单文件应用，需要你自己的 API Key。</span>
          </button>
        </div>

        <div className="field">
          <label>Base URL</label>
          <input
            value={config.baseUrl}
            onChange={(e) => update({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
          />
        </div>
        <div className="field">
          <label>API Key</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              placeholder="sk-…"
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              className="icon-button"
              style={{ position: 'absolute', right: 3, top: 3 }}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
        <div className="field">
          <label>模型</label>
          <input
            value={config.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="gpt-4o-mini / deepseek-chat …"
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn" onClick={runTest} disabled={testing}>
            {testing ? '测试中…' : '测试连接'}
          </button>
          {result && <span className={`test-result ${result.ok ? 'ok' : 'err'}`}>{result.text}</span>}
        </div>

        <p className="settings-note">
          Key 只保存在当前浏览器的 localStorage 中，生成时仅由本站后端单次转发给你的模型服务，
          不写入服务端存储。若使用第三方代理，请自行确认其可信度。
        </p>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>取消</button>
          <button
            className="btn primary"
            onClick={() => {
              if (nextEngine === 'llm' && !config.apiKey.trim()) {
                setResult({ ok: false, text: '使用大模型前需要填写 API Key' });
                return;
              }
              onSave(nextEngine, config);
            }}
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 分享                                                                */
/* ------------------------------------------------------------------ */

export function ShareModal({
  url,
  name,
  onClose,
  onCopy,
}: {
  url: string;
  name: string;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>分享「{name}」</h2>
          <p className="sub">任何拿到链接的人都可以打开这个应用并使用它。数据仍保存在各自浏览器中。</p>
          <button className="icon-button modal-close" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="share-link">
          <input readOnly value={url} onFocus={(e) => e.target.select()} />
          <button className="btn primary" onClick={() => onCopy(url, '分享链接')}>
            <Copy size={13} /> 复制
          </button>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>关闭</button>
          <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} /> 打开链接
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

export function ToastRoot({ items }: { items: ToastItem[] }) {
  return (
    <div className="toast-root">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.tone || ''}`}>
          {t.tone === 'success' && <Check size={13} color="#4ade80" />}
          {t.text}
        </div>
      ))}
    </div>
  );
}
