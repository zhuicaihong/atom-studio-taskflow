import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Loader2, Menu, Plus, Settings, Sparkles } from 'lucide-react';
import type { AgentStep, ChatMessage } from '../types';

const SUGGESTIONS = [
  { emoji: '🗂️', text: '一个带看板的任务管理工具，支持拖拽、优先级和截止日期', tag: '任务 · 看板' },
  { emoji: '🌱', text: '帮我做一个每周习惯打卡应用，统计连续打卡天数', tag: '习惯 · 周视图' },
  { emoji: '💸', text: '记账应用：记录支出、按分类汇总本月开销', tag: '记账 · 表格' },
  { emoji: '📝', text: '一个卡片式灵感笔记，支持分类、搜索和快速记录', tag: '笔记 · 卡片' },
  { emoji: '🔖', text: '书签收藏夹，按开发 / 设计 / 产品分类整理链接', tag: '收藏 · 分类' },
  { emoji: '🍅', text: '番茄钟专注应用，记录每天每个任务的专注时长', tag: '专注 · 计时' },
];

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function RichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split('\n');
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {list.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      list.push(trimmed.slice(2));
      return;
    }
    flush();
    if (trimmed) blocks.push(<p key={index}><Inline text={trimmed} /></p>);
  });
  flush();
  return <>{blocks}</>;
}

function stepIcon(status: AgentStep['status']) {
  if (status === 'done') return <Check size={10} strokeWidth={3} />;
  if (status === 'running') return <Loader2 size={10} />;
  return <span style={{ width: 4, height: 4, borderRadius: 99, background: 'currentColor', display: 'block' }} />;
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  projectName: string | null;
  projectMeta: string;
  messages: ChatMessage[];
  draft: { steps: AgentStep[]; content: string; engine: 'builtin' | 'llm' } | null;
  generating: boolean;
  engine: 'builtin' | 'llm';
  llmModel: string;
  mobileHidden?: boolean;
  onToggleSidebar: () => void;
  onNew: () => void;
  onOpenSettings: () => void;
  onSubmit: (text: string) => void;
}

export function ChatPanel({
  projectName,
  projectMeta,
  messages,
  draft,
  generating,
  engine,
  llmModel,
  mobileHidden,
  onToggleSidebar,
  onNew,
  onOpenSettings,
  onSubmit,
}: Props) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, draft]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  }, [text]);

  const send = () => {
    const value = text.trim();
    if (!value || generating) return;
    setText('');
    onSubmit(value);
  };

  const useSuggestion = (value: string) => {
    if (generating) return;
    onSubmit(value);
  };

  const showHero = messages.length === 0 && !draft && !generating;

  return (
    <section className={`chat-pane ${mobileHidden ? 'mobile-hide' : ''}`}>
      <header className="chat-head">
        <button className="icon-button sidebar-toggle" onClick={onToggleSidebar} aria-label="打开菜单">
          <Menu size={16} />
        </button>
        <div className="chat-title">
          <h2>{projectName || '新应用'}</h2>
          <p>{projectName ? projectMeta : '描述你的想法，Agent 会生成一个可运行的应用'}</p>
        </div>
        <span className="status-badge">
          <span className="dot-live" style={{ width: 5, height: 5 }} />
          {generating ? '生成中' : projectName ? '已保存' : '就绪'}
        </span>
        <button className="icon-button" onClick={onNew} title="新建应用">
          <Plus size={16} />
        </button>
        <button className="icon-button" onClick={onOpenSettings} title="设置">
          <Settings size={16} />
        </button>
      </header>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {showHero && (
            <div className="hero">
              <div className="hero-orb">
                <Sparkles size={24} color="#ffb347" />
              </div>
              <h1>
                把一句话，<br />变成<em>真正能用</em>的应用。
              </h1>
              <p>
                Atom Studio 会理解你的需求、设计数据模型、生成界面与交互，并直接在右侧运行。
                不用写代码，也不用配置环境。
              </p>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s.tag} className="suggestion" onClick={() => useSuggestion(s.text)}>
                    <span className="suggestion-emoji">{s.emoji}</span>
                    <span>
                      <span className="suggestion-text">{s.text}</span>
                      <span className="suggestion-tag">{s.tag}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="hero-foot">
                <Sparkles size={12} /> 默认使用内置生成引擎，无需 API Key
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="msg-avatar">{m.role === 'agent' ? 'A' : '你'}</div>
              <div className="msg-body">
                <div className="msg-name">
                  <b>{m.role === 'agent' ? 'Atom Agent' : '你'}</b>
                  <span className="msg-time">{timeLabel(m.ts)}</span>
                  {m.engine === 'llm' && <span className="msg-time">· 大模型</span>}
                </div>
                {m.steps && m.steps.length > 0 && (
                  <div className="steps">
                    {m.steps.map((s) => (
                      <div key={s.id} className={`step ${s.status}`}>
                        <div className="step-icon">{stepIcon(s.status)}</div>
                        <div className="step-text">
                          <div className="step-label">{s.label}</div>
                          <div className="step-detail">{s.detail}</div>
                        {s.status === 'running' && s.streamText && (
                          <pre className="llm-stream"><code>{s.streamText}</code></pre>
                        )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {m.content && (
                  <div className="msg-content">
                    <RichText text={m.content} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {draft && (
            <div className="msg agent">
              <div className="msg-avatar">A</div>
              <div className="msg-body">
                <div className="msg-name">
                  <b>Atom Agent</b>
                  <span className="msg-time">正在工作</span>
                </div>
                <div className="steps">
                  {draft.steps.map((s) => (
                    <div key={s.id} className={`step ${s.status}`}>
                      <div className="step-icon">{stepIcon(s.status)}</div>
                      <div className="step-text">
                        <div className="step-label">{s.label}</div>
                        <div className="step-detail">{s.detail}</div>
                        {s.status === 'running' && s.streamText && (
                          <pre className="llm-stream"><code>{s.streamText}</code></pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {draft.content ? (
                  <div className="msg-content">
                    <RichText text={draft.content} />
                  </div>
                ) : !draft.steps.some((s) => s.streamText) ? (
                  <div className="typing">
                    <i /><i /><i />
                  </div>
                ) : null}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="composer-wrap">
        <div className="composer">
          <div className="composer-box">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={projectName ? '继续描述要修改的地方，例如「换成深色主题，主色改成紫色」' : '描述你想构建的应用，例如：一个带看板的团队任务管理工具…'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <div className="composer-bar">
              <button className="engine-select" onClick={onOpenSettings} title="切换生成引擎">
                <Sparkles size={11} />
                {engine === 'llm' ? llmModel || '大模型' : '内置引擎'}
              </button>
              <span className="composer-hint">Enter 发送 · Shift+Enter 换行</span>
              <button className="send-btn" onClick={send} disabled={!text.trim() || generating} title="发送">
                {generating ? <Loader2 size={14} className="spin" /> : <ArrowUp size={15} strokeWidth={2.4} />}
              </button>
            </div>
          </div>
          <div className="composer-note">
            {engine === 'llm'
              ? '当前使用大模型生成，密钥仅保存在你的浏览器中'
              : '内置引擎 · 可离线运行 · 生成的应用数据保存在浏览器本地'}
          </div>
        </div>
      </div>
    </section>
  );
}
