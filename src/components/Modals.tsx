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
            开箱即用，无需 API Key。<br />
            也可以随时在设置里填写自己的大模型 Key。
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
  llm: LLMConfig;
  serverDefault: { available: boolean; model: string } | null;
  onClose: () => void;
  onSave: (llm: LLMConfig) => void;
}

export function SettingsModal({ llm, serverDefault, onClose, onSave }: SettingsProps) {
  const [config, setConfig] = useState<LLMConfig>(llm);
  const [useDefault, setUseDefault] = useState(Boolean(llm.useDefault && serverDefault?.available));
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const update = (patch: Partial<LLMConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const runTest = async () => {
    const payload = useDefault && serverDefault?.available
      ? { baseUrl: '', apiKey: '', model: serverDefault.model, useDefault: true }
      : config;
    if (!payload.useDefault && (!payload.baseUrl || !payload.apiKey || !payload.model)) {
      setResult({ ok: false, text: '请先填写 Base URL、API Key 和模型名称' });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const reply = await testLLM(payload);
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
          <h2>生成模型设置</h2>
          <p className="sub">本站已内置默认大模型，打开即用；也可以填写自己的 Key。</p>
          <button className="icon-button modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        {serverDefault?.available && (
          <label className="server-model-option">
            <input
              type="checkbox"
              checked={useDefault}
              onChange={(e) => setUseDefault(e.target.checked)}
            />
            <span>
              使用服务端默认模型 <b>{serverDefault.model}</b>，无需填写 Key
              <em>由本站统一提供，每人每小时有调用次数限制；也可以取消勾选后填自己的 Key。</em>
            </span>
          </label>
        )}

        <div className="field">
          <label>Base URL</label>
          <input
            value={config.baseUrl}
            onChange={(e) => update({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            disabled={useDefault && Boolean(serverDefault?.available)}
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
              disabled={useDefault && Boolean(serverDefault?.available)}
            />
            <button
              type="button"
              className="icon-button"
              style={{ position: 'absolute', right: 3, top: 3 }}
              onClick={() => setShowKey((v) => !v)}
              disabled={useDefault && Boolean(serverDefault?.available)}
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
        <div className="field">
          <label>模型</label>
          <input
            value={useDefault && serverDefault?.available ? serverDefault.model : config.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="gpt-4o-mini / deepseek-chat …"
            disabled={useDefault && Boolean(serverDefault?.available)}
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
              const usingServerModel = useDefault && Boolean(serverDefault?.available);
              if (!usingServerModel && (!config.baseUrl.trim() || !config.apiKey.trim() || !config.model.trim())) {
                setResult({ ok: false, text: '请填写 Base URL、API Key 和模型名称，或勾选服务端默认模型' });
                return;
              }
              onSave(
                usingServerModel
                  ? { baseUrl: '', apiKey: '', model: serverDefault!.model, useDefault: true }
                  : { ...config, useDefault: false }
              );
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
