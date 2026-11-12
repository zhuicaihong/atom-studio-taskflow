import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { Onboarding, SettingsModal, ShareModal, ToastRoot } from './components/Modals';
import { api, loadLLMConfig, saveLLMConfig } from './lib/api';
import { generate, makeAgentMessage, makeUserMessage, revise } from './lib/agent/engine';
import { inferSpec } from './lib/agent/specs';
import { generateWithLLM } from './lib/agent/llm';
import { uid } from './lib/id';
import type {
  AgentStep,
  ChatMessage,
  LLMConfig,
  Project,
  ProjectSummary,
  ToastItem,
  Workspace,
} from './types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function animateSteps(steps: AgentStep[], update: (steps: AgentStep[]) => void) {
  const shown: AgentStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    shown.push({ ...steps[i], status: 'running' });
    update(shown.map((s) => ({ ...s })));
    await sleep(i === 0 ? 480 : 320);
    shown[shown.length - 1] = { ...steps[i], status: 'done' };
    update(shown.map((s) => ({ ...s })));
    await sleep(70);
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<{ steps: AgentStep[]; content: string; engine: 'builtin' | 'llm' } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [share, setShare] = useState<{ url: string; name: string } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');
  const [llm, setLlm] = useState<LLMConfig>(() => loadLLMConfig());
  const [engine, setEngine] = useState<'builtin' | 'llm'>(() => {
    const saved = localStorage.getItem('atom-engine');
    const config = loadLLMConfig();
    return saved === 'llm' && config.apiKey ? 'llm' : 'builtin';
  });

  const toast = (text: string, tone: ToastItem['tone'] = 'default') => {
    const id = uid();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  };

  const refreshProjects = async () => {
    try {
      const res = await api.listProjects();
      setProjects(res.projects);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [ws, list] = await Promise.all([api.getWorkspace(), api.listProjects()]);
        setWorkspace(ws.workspace);
        setProjects(list.projects);
      } catch {
        toast('无法连接服务，请确认后端已启动', 'error');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const createWorkspace = async (name: string) => {
    setCreatingWorkspace(true);
    try {
      const res = await api.createWorkspace(name);
      setWorkspace(res.workspace);
      toast(`欢迎，${res.workspace.name}`, 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const resetToNew = () => {
    if (generating) return;
    setProject(null);
    setMessages([]);
    setDraft(null);
    setPreviewTab('preview');
    setMobileView('chat');
    setSidebarOpen(false);
  };

  const selectProject = async (id: string) => {
    if (generating) {
      toast('正在生成中，请稍候再切换', 'error');
      return;
    }
    try {
      const res = await api.getProject(id);
      setProject(res.project);
      setMessages(res.project.messages || []);
      setDraft(null);
      setPreviewTab('preview');
      setMobileView('preview');
      setSidebarOpen(false);
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const deleteProject = async (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!window.confirm(`确定删除「${target?.name || '这个应用'}」吗？此操作不可恢复。`)) return;
    try {
      await api.deleteProject(id);
      if (project?.id === id) {
        setProject(null);
        setMessages([]);
      }
      await refreshProjects();
      toast('应用已删除');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const runBuiltin = async (text: string, userMsg: ChatMessage) => {
    const isRevise = !!project && !!project.spec;
    if (project && !project.spec) {
      throw new Error('当前应用由大模型生成，内置引擎无法增量修改。请切换到「大模型」引擎，或新建一个应用。');
    }
    setDraft({ steps: [], content: '', engine: 'builtin' });

    if (isRevise) {
      const output = revise(project!.spec!, text);
      await animateSteps(output.steps, (steps) => setDraft({ steps, content: '', engine: 'builtin' }));
      const agentMsg = makeAgentMessage(output.reply, output.steps, 'builtin');
      const finalMessages = [...messages, userMsg, agentMsg];
      setDraft(null);
      setMessages(finalMessages);
      if (output.changed) {
        const res = await api.updateProject(project!.id, {
          spec: output.spec,
          files: output.files,
          previewHtml: output.previewHtml,
          messages: finalMessages,
          engine: 'builtin',
        });
        setProject(res.project);
        setPreviewTab('preview');
      } else {
        const res = await api.updateProject(project!.id, { messages: finalMessages });
        setProject(res.project);
      }
    } else {
      const output = generate(text);
      await animateSteps(output.steps, (steps) => setDraft({ steps, content: '', engine: 'builtin' }));
      const agentMsg = makeAgentMessage(output.reply, output.steps, 'builtin');
      const finalMessages = [...messages, userMsg, agentMsg];
      setDraft(null);
      setMessages(finalMessages);
      const res = await api.createProject({
        name: output.name,
        prompt: text,
        engine: 'builtin',
        spec: output.spec,
        files: output.files,
        previewHtml: output.previewHtml,
        messages: finalMessages,
      });
      setProject(res.project);
      setPreviewTab('preview');
      setMobileView('preview');
    }
    await refreshProjects();
  };

  const runLLM = async (text: string, userMsg: ChatMessage) => {
    if (!llm.apiKey.trim()) {
      setSettingsOpen(true);
      throw new Error('还没有配置大模型 API Key，请先在设置里填写。');
    }
    const isRevise = !!project;
    const step1: AgentStep = {
      id: 'l1',
      label: '理解需求',
      detail: isRevise ? '结合当前应用代码解析修改意图' : '解析场景、核心对象与操作',
      status: 'done',
    };
    const step2: AgentStep = {
      id: 'l2',
      label: '调用大模型',
      detail: `${llm.model || '模型'} · ${isRevise ? '增量修改' : '从零生成'}完整应用`,
      status: 'running',
    };
    const step3: AgentStep = {
      id: 'l3',
      label: '解析与自检',
      detail: '提取 HTML，检查依赖与完整性',
      status: 'running',
    };
    setDraft({ steps: [step1, step2], content: '', engine: 'llm' });

    const [result] = await Promise.all([
      generateWithLLM(llm, text, isRevise ? project!.previewHtml : undefined, (progress) => {
        setDraft((current) => current ? {
          ...current,
          steps: current.steps.map((step) => step.id === 'l2' ? {
            ...step,
            detail: progress.receivedChars > 0
              ? `实时接收中 · ${progress.receivedChars.toLocaleString()} 字符 · ${progress.elapsedSeconds}s`
              : `模型已连接，等待正文输出 · ${progress.elapsedSeconds}s`,
            streamText: progress.content
              ? `${progress.receivedChars > progress.content.length ? '…\n' : ''}${progress.content}`
              : undefined,
          } : step),
        } : current);
      }),
      sleep(700),
    ]);

    setDraft({ steps: [step1, { ...step2, status: 'done' }, step3], content: '', engine: 'llm' });
    await sleep(420);

    const step4: AgentStep = { id: 'l4', label: '装载预览', detail: '写入沙箱 iframe，可在右侧直接操作', status: 'done' };
    const finalSteps: AgentStep[] = [step1, { ...step2, status: 'done' }, { ...step3, status: 'done' }, step4];
    const reply = isRevise
      ? `已根据你的要求重新生成应用。\n\n- 生成方式：${llm.model} 完整重写单文件应用\n- 数据存储：浏览器 localStorage\n- 提醒：大模型生成的应用已替换上一版，可继续用自然语言迭代`
      : `已经为你生成一个完整应用，直接运行在右侧预览区。\n\n- 生成方式：${llm.model}\n- 交付物：单文件 HTML（内联 CSS / JS）\n- 数据持久化：浏览器 localStorage\n\n继续描述想改的地方即可迭代。`;
    const agentMsg = makeAgentMessage(reply, finalSteps, 'llm');
    const finalMessages = [...messages, userMsg, agentMsg];
    const files = [{ path: 'index.html' as const, language: 'html' as const, content: result.html }];
    setDraft(null);
    setMessages(finalMessages);

    if (isRevise) {
      const res = await api.updateProject(project!.id, {
        files,
        previewHtml: result.html,
        messages: finalMessages,
        engine: 'llm',
        spec: null,
      });
      setProject(res.project);
    } else {
      const res = await api.createProject({
        name: inferSpec(text).appName,
        prompt: text,
        engine: 'llm',
        spec: null,
        files,
        messages: finalMessages,
        previewHtml: result.html,
      });
      setProject(res.project);
      setPreviewTab('preview');
      setMobileView('preview');
    }
    await refreshProjects();
  };

  const handleSubmit = async (text: string) => {
    if (generating) return;
    const userMsg = makeUserMessage(text);
    setMessages((prev) => [...prev, userMsg]);
    setGenerating(true);
    try {
      if (engine === 'llm') await runLLM(text, userMsg);
      else await runBuiltin(text, userMsg);
    } catch (err) {
      setDraft(null);
      const message = (err as Error).message || '生成失败';
      setMessages((prev) => [
        ...prev,
        makeAgentMessage(`这次没有完成：${message}\n\n你可以调整设置或换一种描述再试一次。`, [], engine),
      ]);
      toast(message, 'error');
    } finally {
      setGenerating(false);
      setDraft(null);
    }
  };

  const shareProject = async () => {
    if (!project) return;
    try {
      const res = await api.shareProject(project.id);
      const url = window.location.origin + res.path;
      setShare({ url, name: project.name });
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const download = () => {
    if (!project) return;
    const blob = new Blob([project.previewHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'app'}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已下载单文件 HTML', 'success');
  };

  const openExternal = () => {
    if (!project) return;
    const blob = new Blob([project.previewHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) toast('浏览器拦截了新窗口，请允许弹窗', 'error');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label}已复制`, 'success');
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      toast(`${label}已复制`, 'success');
    }
  };

  const saveSettings = (nextEngine: 'builtin' | 'llm', config: LLMConfig) => {
    saveLLMConfig(config);
    localStorage.setItem('atom-engine', nextEngine);
    setLlm(config);
    setEngine(nextEngine);
    setSettingsOpen(false);
    toast('设置已保存', 'success');
  };

  if (!ready) {
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <Loader2 size={16} className="spin" /> 正在载入工作区…
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <>
        <Onboarding busy={creatingWorkspace} onCreate={createWorkspace} />
        <ToastRoot items={toasts} />
      </>
    );
  }

  return (
    <div className="shell">
      <Sidebar
        workspace={workspace}
        projects={projects}
        activeId={project?.id || null}
        engineLabel={engine === 'llm' ? `大模型 · ${llm.model}` : '内置引擎 · 就绪'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNew={resetToNew}
        onSelect={selectProject}
        onDelete={deleteProject}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="main">
        <ChatPanel
          projectName={project?.name || null}
          projectMeta={
            project
              ? `${project.engine === 'llm' ? '大模型生成' : '内置引擎'} · ${project.files.length} 个文件 · 自动保存`
              : ''
          }
          messages={messages}
          draft={draft}
          generating={generating}
          engine={engine}
          llmModel={llm.model}
          mobileHidden={mobileView === 'preview'}
          onToggleSidebar={() => setSidebarOpen(true)}
          onNew={resetToNew}
          onOpenSettings={() => setSettingsOpen(true)}
          onSubmit={handleSubmit}
        />

        <PreviewPanel
          project={project}
          busy={generating}
          mobileShow={mobileView === 'preview'}
          tab={previewTab}
          device={device}
          onTabChange={setPreviewTab}
          onDeviceChange={setDevice}
          onShare={shareProject}
          onDownload={download}
          onOpen={openExternal}
          onRefresh={() => {}}
          onCopy={copyText}
        />
      </main>

      <div className="mobile-tabs">
        <button className={`mobile-tab ${mobileView === 'chat' ? 'active' : ''}`} onClick={() => setMobileView('chat')}>
          对话
        </button>
        <button
          className={`mobile-tab ${mobileView === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileView('preview')}
        >
          预览
        </button>
      </div>

      {settingsOpen && (
        <SettingsModal
          engine={engine}
          llm={llm}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
        />
      )}
      {share && <ShareModal url={share.url} name={share.name} onClose={() => setShare(null)} onCopy={copyText} />}
      <ToastRoot items={toasts} />
    </div>
  );
}
