import { useState } from 'react';
import { Plus, Search, Settings, Trash2, X } from 'lucide-react';
import type { ProjectSummary, Workspace } from '../types';

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

interface Props {
  workspace: Workspace | null;
  projects: ProjectSummary[];
  activeId: string | null;
  engineLabel: string;
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({ workspace, projects, activeId, engineLabel, open, onClose, onNew, onSelect, onDelete, onOpenSettings }: Props) {
  const [query, setQuery] = useState('');
  const filtered = projects.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-mark">A</div>
          <div style={{ flex: 1 }}>
            <div className="brand-name">Atom Studio</div>
            <div className="brand-sub">App Agent</div>
          </div>
          <button className="icon-button sidebar-toggle" onClick={onClose} aria-label="收起菜单">
            <X size={15} />
          </button>
        </div>

        <button className="new-btn" onClick={onNew}>
          <Plus size={15} /> 新建应用
        </button>

        <div className="sidebar-search">
          <Search size={13} />
          <input placeholder="搜索我的应用" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="list-label">我的应用 · {projects.length}</div>
        <div className="project-list">
          {filtered.length === 0 && (
            <div className="sidebar-empty">
              {projects.length === 0 ? '还没有应用。描述一个想法，Agent 会帮你把它做出来。' : '没有找到匹配的应用。'}
            </div>
          )}
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`project-item ${p.id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(p.id)}
            >
              <div className="project-emoji">{p.emoji}</div>
              <div className="project-info">
                <div className="project-name">{p.name}</div>
                <div className="project-time">{timeAgo(p.updatedAt)}</div>
              </div>
              <button
                className="project-del"
                title="删除应用"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-foot">
          <div className="engine-row">
            <div className="engine-pill">
              <span className="dot-live" /> {engineLabel}
            </div>
            <span style={{ fontSize: 10, color: 'var(--muted-2)' }}>v1.0</span>
          </div>
          <div className="workspace-card" onClick={onOpenSettings}>
            <div className="avatar">{(workspace?.name || 'A').slice(0, 1).toUpperCase()}</div>
            <div className="workspace-meta">
              <div className="workspace-name">{workspace?.name || '我的工作区'}</div>
              <div className="workspace-sub">个人工作区</div>
            </div>
            <Settings size={14} style={{ color: 'var(--muted-2)' }} />
          </div>
        </div>
      </aside>
    </>
  );
}
