import { useEffect, useState } from 'react';
import {
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  Monitor,
  RefreshCw,
  Share2,
  Smartphone,
  Tablet,
} from 'lucide-react';
import type { Project } from '../types';

interface Props {
  project: Project | null;
  busy: boolean;
  mobileShow?: boolean;
  tab: 'preview' | 'code';
  device: 'desktop' | 'tablet' | 'mobile';
  onTabChange: (tab: 'preview' | 'code') => void;
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onShare: () => void;
  onDownload: () => void;
  onOpen: () => void;
  onRefresh: () => void;
  onCopy: (text: string, label: string) => void;
}

export function PreviewPanel({
  project,
  busy,
  mobileShow,
  tab,
  device,
  onTabChange,
  onDeviceChange,
  onShare,
  onDownload,
  onOpen,
  onRefresh,
  onCopy,
}: Props) {
  const [fileIndex, setFileIndex] = useState(0);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setFileIndex(0);
  }, [project?.id]);

  const files = project?.files || [];
  const file = files[Math.min(fileIndex, Math.max(0, files.length - 1))];
  const lines = file ? file.content.split('\n') : [];

  return (
    <section className={`preview-pane ${mobileShow ? 'mobile-show' : ''}`}>
      <div className="preview-card">
        <div className="preview-toolbar">
          <div className="tabs">
            <button className={`tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => onTabChange('preview')}>
              <Globe2 size={12} /> 预览
            </button>
            <button className={`tab ${tab === 'code' ? 'active' : ''}`} onClick={() => onTabChange('code')}>
              <Code2 size={12} /> 代码
              {files.length > 0 && <span className="tab-count">{files.length}</span>}
            </button>
          </div>
          <div className="toolbar-spacer" />
          {project && (
            <>
              <div className="device-group">
                <button
                  className={`device-btn ${device === 'desktop' ? 'active' : ''}`}
                  onClick={() => onDeviceChange('desktop')}
                  title="桌面"
                >
                  <Monitor size={13} />
                </button>
                <button
                  className={`device-btn ${device === 'tablet' ? 'active' : ''}`}
                  onClick={() => onDeviceChange('tablet')}
                  title="平板"
                >
                  <Tablet size={13} />
                </button>
                <button
                  className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
                  onClick={() => onDeviceChange('mobile')}
                  title="手机"
                >
                  <Smartphone size={13} />
                </button>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setNonce((n) => n + 1);
                  onRefresh();
                }}
                title="刷新预览"
              >
                <RefreshCw size={14} />
              </button>
              <button className="icon-button" onClick={onOpen} title="在新窗口打开">
                <ExternalLink size={14} />
              </button>
              <button className="icon-button" onClick={onDownload} title="下载单文件 HTML">
                <Download size={14} />
              </button>
              <button className="icon-button" onClick={onShare} title="生成分享链接">
                <Share2 size={14} />
              </button>
            </>
          )}
        </div>

        {!project ? (
          <div className="preview-empty">
            <div className="orbit">
              <div className="orbit-ring" />
              <div className="orbit-ring" />
              <div className="orbit-ring" />
              <div className="orbit-core">
                <Globe2 size={22} color="#ff9a66" />
              </div>
              <span className="orbit-dot" style={{ top: 12, left: 62 }} />
              <span className="orbit-dot" style={{ bottom: 26, right: 20, width: 5, height: 5 }} />
            </div>
            <h3>你的应用会在这里运行</h3>
            <p>左侧描述一个想法，Agent 会生成完整代码并实时装载到这个窗口，像真实产品一样操作。</p>
            <div className="feature-row">
              <div className="feature">
                <div className="feature-icon"><RefreshCw size={13} /></div>
                <b>实时预览</b>
                <span>边生成边看</span>
              </div>
              <div className="feature">
                <div className="feature-icon"><Code2 size={13} /></div>
                <b>完整代码</b>
                <span>可读可导出</span>
              </div>
              <div className="feature">
                <div className="feature-icon"><Share2 size={13} /></div>
                <b>一键分享</b>
                <span>公开链接</span>
              </div>
            </div>
          </div>
        ) : tab === 'preview' ? (
          <div className="stage">
            <div className="stage-inner">
              <div className={`frame ${device}`}>
                <iframe
                  key={`${project.id}-${project.updatedAt}-${nonce}`}
                  title={project.name}
                  srcDoc={project.previewHtml}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
                />
              </div>
              {busy && (
                <div className="preview-loading">
                  <div className="spinner" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="code-view">
            <div className="file-tree">
              <div className="file-tree-title">生成的文件</div>
              {files.map((f, i) => (
                <div
                  key={f.path}
                  className={`file-item ${i === fileIndex ? 'active' : ''}`}
                  onClick={() => setFileIndex(i)}
                >
                  <span className="file-dot" /> {f.path}
                </div>
              ))}
            </div>
            <div className="code-body">
              <div className="code-head">
                <span>{file?.path} · {lines.length} 行</span>
                <button
                  className="btn ghost"
                  style={{ padding: '3px 8px', fontSize: 11 }}
                  onClick={() => file && onCopy(file.content, file.path)}
                >
                  <Copy size={11} /> 复制
                </button>
              </div>
              <div className="code-scroll">
                <table className="code-table">
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i}>
                        <td className="gutter">{i + 1}</td>
                        <td className="code-line">{line || ' '}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
