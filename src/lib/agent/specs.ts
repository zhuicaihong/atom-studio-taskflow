import type { AppSpec, AppView, FieldDef, StatusDef } from '../../types';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const daysAhead = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

const COLOR_WORDS: [RegExp, string][] = [
  [/橙|橘/, '#ff7a45'],
  [/紫|罗兰/, '#8b5cf6'],
  [/蓝/, '#3b82f6'],
  [/绿|森/, '#22c55e'],
  [/粉|玫瑰/, '#ec4899'],
  [/红/, '#ef4444'],
  [/黄|金/, '#eab308'],
  [/青|蓝绿|teal/, '#06b6d4'],
  [/黑|酷/, '#18181b'],
];

function pickAccent(prompt: string, fallback = '#ff7a45') {
  for (const [re, color] of COLOR_WORDS) if (re.test(prompt)) return color;
  return fallback;
}

function pickView(prompt: string, fallback: AppView, hasStatus: boolean): AppView {
  if (/看板|kanban|board/i.test(prompt) && hasStatus) return 'board';
  if (/表格|报表|流水|明细/.test(prompt)) return 'table';
  if (/卡片|画廊|瀑布/.test(prompt)) return 'grid';
  if (/周视图|日历|打卡/.test(prompt)) return 'week';
  if (/列表|清单|待办/.test(prompt)) return 'list';
  return fallback;
}

const TASK_STATUSES: StatusDef[] = [
  { key: '待办', label: '待办', color: '#94a3b8' },
  { key: '进行中', label: '进行中', color: '#f59e0b' },
  { key: '已完成', label: '已完成', color: '#22c55e' },
];

const TASK_FIELDS: FieldDef[] = [
  { key: 'title', label: '任务名称', type: 'text', required: true, full: true, placeholder: '例如：完成产品评审' },
  { key: 'status', label: '状态', type: 'select', options: ['待办', '进行中', '已完成'] },
  { key: 'priority', label: '优先级', type: 'select', options: ['高', '中', '低'] },
  { key: 'due', label: '截止日期', type: 'date' },
  { key: 'notes', label: '备注', type: 'textarea', full: true, placeholder: '补充一些细节…' },
];

function taskSeed(): Record<string, unknown>[] {
  return [
    { title: '梳理需求与目标用户', status: '已完成', priority: '高', due: daysAgo(1), notes: '确认核心流程只需要三步' },
    { title: '完成首页高保真设计', status: '进行中', priority: '高', due: daysAhead(1), notes: '主色使用暖橙，留白充足' },
    { title: '接入数据持久化', status: '进行中', priority: '中', due: daysAhead(2), notes: '本地存储 + 导出备份' },
    { title: '写一份 5 分钟演示脚本', status: '待办', priority: '中', due: daysAhead(3), notes: '' },
    { title: '邀请 3 位同事试用并收集反馈', status: '待办', priority: '低', due: daysAhead(5), notes: '' },
  ];
}

function baseSpec(kind: string, appName: string, emoji: string, tagline: string, description: string): AppSpec {
  return {
    kind,
    appName,
    emoji,
    tagline,
    description,
    view: 'list',
    accent: '#ff7a45',
    dark: false,
    fields: TASK_FIELDS,
    statuses: TASK_STATUSES,
    titleField: 'title',
    categoryField: 'priority',
    dateField: 'due',
    searchable: true,
    seed: [],
    storageKey: kind + '-' + Math.random().toString(36).slice(2, 8),
    features: [],
  };
}

export function inferSpec(prompt: string): AppSpec {
  const text = prompt.toLowerCase();
  const accent = pickAccent(prompt);

  const has = (re: RegExp) => re.test(prompt);

  // 习惯 / 打卡
  if (has(/习惯|打卡|habit|坚持|喝水|早睡|冥想|运动|健身|跑步/)) {
    const spec = baseSpec('habits', '习惯打卡', '🌱', '每天向前一点点，让好习惯被看见', '一个轻量的每周习惯追踪器');
    let name = '习惯打卡';
    if (has(/健身|运动|跑步/)) name = '运动打卡';
    else if (has(/喝水/)) name = '喝水打卡';
    else if (has(/早睡|睡眠/)) name = '睡眠打卡';
    else if (has(/学习/)) name = '学习打卡';
    spec.appName = name;
    spec.view = 'week';
    spec.accent = accent;
    spec.statuses = undefined;
    spec.categoryField = undefined;
    spec.dateField = undefined;
    spec.fields = [
      { key: 'name', label: '习惯名称', type: 'text', required: true, full: true, placeholder: '例如：阅读 20 分钟' },
      { key: 'emoji', label: '图标', type: 'text', placeholder: '🌱', full: true },
      { key: 'note', label: '备注', type: 'textarea', full: true, placeholder: '为什么要坚持它？' },
    ];
    const seeds: [string, string][] = [
      ['早起', '🌅'], ['阅读 20 分钟', '📖'], ['运动 30 分钟', '🏃'], ['喝水 8 杯', '💧'],
    ];
    spec.seed = seeds.map(([n, e], i) => {
      const checks: string[] = [];
      for (let d = 0; d <= 4; d++) if ((d + i) % 3 !== 2) checks.push(daysAgo(d));
      return { name: n, emoji: e, note: '', checks };
    });
    spec.features = ['连续打卡天数', '本周完成率', '今日一键打卡'];
    return spec;
  }

  // 记账
  if (has(/记账|支出|账单|预算|消费|expense|报销/)) {
    const spec = baseSpec('expenses', '预算手账', '💸', '每一笔都清楚，花钱更有底气', '记录日常开销并自动汇总');
    spec.view = 'table';
    spec.accent = accent;
    spec.statuses = undefined;
    spec.categoryField = 'category';
    spec.numericField = 'amount';
    spec.valueLabel = '金额';
    spec.dateField = 'date';
    spec.titleField = 'title';
    spec.fields = [
      { key: 'title', label: '事项', type: 'text', required: true, full: true, placeholder: '例如：午餐' },
      { key: 'amount', label: '金额（元）', type: 'number', required: true, placeholder: '0.00' },
      { key: 'category', label: '分类', type: 'select', options: ['餐饮', '交通', '购物', '居住', '娱乐', '其他'] },
      { key: 'date', label: '日期', type: 'date' },
    ];
    spec.seed = [
      { title: '午餐 · 沙拉', amount: 38, category: '餐饮', date: daysAgo(0) },
      { title: '地铁通勤', amount: 12, category: '交通', date: daysAgo(0) },
      { title: '云服务器续费', amount: 68, category: '其他', date: daysAgo(1) },
      { title: '咖啡豆', amount: 89, category: '餐饮', date: daysAgo(2) },
      { title: '周末电影', amount: 59, category: '娱乐', date: daysAgo(3) },
      { title: '房租', amount: 3200, category: '居住', date: daysAgo(5) },
    ];
    spec.features = ['分类统计', '本月支出汇总', '明细表格'];
    return spec;
  }

  // 笔记
  if (has(/笔记|灵感|知识库|note|记录想法|草稿|blog|博客/)) {
    const spec = baseSpec('notes', '灵感笔记', '📝', '随手记下，随时找回你的灵感', '一个轻盈的卡片式笔记应用');
    spec.view = 'grid';
    spec.accent = accent;
    spec.statuses = undefined;
    spec.categoryField = 'category';
    spec.subtitleField = 'content';
    spec.dateField = 'updatedAt';
    spec.fields = [
      { key: 'title', label: '标题', type: 'text', required: true, full: true, placeholder: '给这条灵感起个名字' },
      { key: 'category', label: '分类', type: 'select', options: ['灵感', '工作', '生活', '学习'] },
      { key: 'content', label: '内容', type: 'textarea', full: true, placeholder: '写点什么…' },
    ];
    spec.seed = [
      { title: 'Atom Demo 的产品切入点', category: '工作', content: '不做大而全的生成器，先让「一句话 → 一个能用的工具」这件事变得可靠。核心是预览、迭代与数据留存。', updatedAt: daysAgo(0) },
      { title: '关于简洁的一条原则', category: '灵感', content: '如果用户要读说明书才会用，那说明设计还没完成。把复杂度留给自己。', updatedAt: daysAgo(1) },
      { title: '周末清单', category: '生活', content: '去美术馆、修车、给家里打电话、跑 5 公里。', updatedAt: daysAgo(2) },
      { title: 'TypeScript 类型体操笔记', category: '学习', content: 'Conditional types 的本质是分发；infer 用来在结构里捕获类型变量。', updatedAt: daysAgo(4) },
    ];
    spec.features = ['分类筛选', '全文搜索', '卡片瀑布流'];
    return spec;
  }

  // 收藏 / 书签
  if (has(/收藏|书签|链接|bookmark|资源|导航/)) {
    const spec = baseSpec('bookmarks', '资源书架', '🔖', '把好用的东西，收进自己的书架', '一个带分类的链接收藏夹');
    spec.view = 'grid';
    spec.accent = accent;
    spec.statuses = undefined;
    spec.categoryField = 'category';
    spec.subtitleField = 'note';
    spec.fields = [
      { key: 'title', label: '标题', type: 'text', required: true, full: true, placeholder: '例如：Vercel 文档' },
      { key: 'url', label: '链接', type: 'url', required: true, full: true, placeholder: 'https://' },
      { key: 'category', label: '分类', type: 'select', options: ['开发', '设计', '产品', '阅读'] },
      { key: 'note', label: '备注', type: 'textarea', full: true, placeholder: '为什么收藏它？' },
    ];
    spec.seed = [
      { title: 'Vercel', url: 'https://vercel.com', category: '开发', note: '前端部署与 Serverless 首选' },
      { title: 'Atoms', url: 'https://atoms.dev', category: '产品', note: 'AI Agent 平台，参考它的生成体验' },
      { title: 'Dribbble', url: 'https://dribbble.com', category: '设计', note: '找视觉灵感' },
      { title: 'Hacker News', url: 'https://news.ycombinator.com', category: '阅读', note: '每天扫一眼技术趋势' },
    ];
    spec.features = ['分类筛选', '一键打开链接', '备注搜索'];
    return spec;
  }

  // 阅读
  if (has(/阅读|书单|读书|book|书架/)) {
    const spec = baseSpec('reading', '阅读清单', '📚', '想读、在读、读完，都算数', '管理你的个人书单与阅读进度');
    spec.view = 'grid';
    spec.accent = accent;
    spec.categoryField = 'status';
    spec.statuses = [
      { key: '想读', label: '想读', color: '#94a3b8' },
      { key: '在读', label: '在读', color: '#f59e0b' },
      { key: '已读', label: '已读', color: '#22c55e' },
    ];
    spec.subtitleField = 'author';
    spec.fields = [
      { key: 'title', label: '书名', type: 'text', required: true, full: true, placeholder: '例如：建造原子习惯' },
      { key: 'author', label: '作者', type: 'text', placeholder: '作者姓名' },
      { key: 'status', label: '状态', type: 'select', options: ['想读', '在读', '已读'] },
      { key: 'rating', label: '评分', type: 'select', options: ['5', '4', '3', '2', '1'] },
      { key: 'note', label: '短评', type: 'textarea', full: true, placeholder: '读完想说点什么…' },
    ];
    spec.seed = [
      { title: '建造原子习惯', author: 'James Clear', status: '已读', rating: '5', note: '习惯是身份投票。' },
      { title: '设计中的设计', author: '原研哉', status: '在读', rating: '4', note: '重新理解「留白」。' },
      { title: '纳瓦尔宝典', author: 'Eric Jorgenson', status: '想读', rating: '', note: '' },
      { title: '人月神话', author: 'Fred Brooks', status: '已读', rating: '4', note: '没有银弹。' },
    ];
    spec.features = ['阅读状态筛选', '评分', '书单统计'];
    return spec;
  }

  // 客户 / CRM
  if (has(/客户|crm|销售|线索|商机|联系人/)) {
    const spec = baseSpec('crm', '客户看板', '🤝', '把每一条线索，推进到成交', '轻量销售管道与客户管理');
    spec.view = 'table';
    spec.accent = accent;
    spec.categoryField = 'stage';
    spec.statuses = [
      { key: '线索', label: '线索', color: '#94a3b8' },
      { key: '沟通中', label: '沟通中', color: '#3b82f6' },
      { key: '已成交', label: '已成交', color: '#22c55e' },
      { key: '已流失', label: '已流失', color: '#ef4444' },
    ];
    spec.numericField = 'value';
    spec.valueLabel = '金额';
    spec.dateField = 'next';
    spec.fields = [
      { key: 'name', label: '客户姓名', type: 'text', required: true, placeholder: '例如：王先生' },
      { key: 'company', label: '公司', type: 'text', placeholder: '公司名称' },
      { key: 'stage', label: '阶段', type: 'select', options: ['线索', '沟通中', '已成交', '已流失'] },
      { key: 'value', label: '预计金额（元）', type: 'number', placeholder: '0' },
      { key: 'next', label: '下次跟进', type: 'date' },
      { key: 'notes', label: '备注', type: 'textarea', full: true, placeholder: '沟通要点…' },
    ];
    spec.seed = [
      { name: '王先生', company: '青屿科技', stage: '沟通中', value: 80000, next: daysAhead(1), notes: '关注私有化部署' },
      { name: '李女士', company: '山海设计', stage: '已成交', value: 32000, next: '', notes: '已签约，待交付' },
      { name: '陈总', company: '南风传媒', stage: '线索', value: 15000, next: daysAhead(3), notes: '朋友介绍' },
      { name: '周经理', company: '壹方零售', stage: '已流失', value: 50000, next: '', notes: '预算冻结' },
    ];
    spec.features = ['销售阶段筛选', '金额汇总', '跟进提醒'];
    return spec;
  }

  // 番茄钟
  if (has(/番茄|专注|pomodoro|计时|timer|考试倒计时/)) {
    const spec = baseSpec('timer', '专注番茄钟', '🍅', '25 分钟，只做一件事', '记录每一次深度专注');
    spec.view = 'timer';
    spec.accent = accent;
    spec.statuses = undefined;
    spec.categoryField = undefined;
    spec.dateField = 'completedAt';
    spec.timer = { focus: 25, rest: 5 };
    spec.fields = [
      { key: 'label', label: '专注事项', type: 'text', required: true, full: true, placeholder: '这一轮要完成什么？' },
      { key: 'minutes', label: '时长（分钟）', type: 'number', placeholder: '25' },
    ];
    spec.seed = [
      { label: '写产品方案', minutes: 25, completedAt: daysAgo(0) },
      { label: '整理代码结构', minutes: 25, completedAt: daysAgo(0) },
      { label: '阅读论文', minutes: 25, completedAt: daysAgo(1) },
    ];
    spec.features = ['番茄计时', '专注记录', '今日/本周统计'];
    return spec;
  }

  // 默认：任务 / 看板
  const spec = baseSpec('tasks', '任务流', '✅', '把想法拆成下一步，然后完成它', '一个支持看板与清单的任务管理应用');
  const hasStatus = true;
  spec.view = pickView(prompt, has(/项目|协作|看板/) ? 'board' : 'list', hasStatus);
  spec.accent = accent;
  if (/个人|我的/.test(prompt)) spec.appName = '我的任务';
  if (/团队/.test(prompt)) spec.appName = '团队任务板';
  spec.seed = taskSeed();
  spec.features = ['看板拖拽', '优先级筛选', '完成进度'];
  return spec;
}

export interface PatchResult {
  spec: AppSpec;
  changed: boolean;
  reply: string;
  summary: string;
}

export function patchSpec(spec: AppSpec, message: string): PatchResult {
  const next: AppSpec = JSON.parse(JSON.stringify(spec));
  const changes: string[] = [];
  const m = message.trim();

  // 主题
  if (/深色|暗色|夜间|黑色|dark/i.test(m)) {
    next.dark = true;
    changes.push('切换为深色主题');
  } else if (/浅色|亮色|白色|light/i.test(m)) {
    next.dark = false;
    changes.push('切换为浅色主题');
  }

  // 主色
  for (const [re, color] of COLOR_WORDS) {
    if (re.test(m) && /(色|主题|换成|改成|变成)/.test(m)) {
      next.accent = color;
      changes.push('主色调整为 ' + color);
      break;
    }
  }

  // 视图
  if (/看板/.test(m) && next.statuses) {
    next.view = 'board';
    changes.push('切换为看板视图');
  } else if (/表格|明细/.test(m) && next.numericField) {
    next.view = 'table';
    changes.push('切换为表格视图');
  } else if (/卡片/.test(m)) {
    next.view = 'grid';
    changes.push('切换为卡片视图');
  } else if (/列表/.test(m) && next.statuses) {
    next.view = 'list';
    changes.push('切换为列表视图');
  }

  // 重命名
  const rename = m.match(/(?:改名为|名称改成|名字改成|标题改成|叫做|命名为)\s*[「“"']?([^」”"'，。,.\n]{1,20})/);
  if (rename && rename[1].trim()) {
    next.appName = rename[1].trim();
    changes.push('应用更名为「' + next.appName + '」');
  }

  // 增加字段
  const addField = m.match(/(?:增加|添加|新增|加一个|加个)(?:一个)?[「“"']?([^「」“”"'，。,.\n]{1,10})[」”"']?(?:字段|列|信息|属性)/);
  if (addField) {
    const label = addField[1].replace(/^(一个|个)/, '').trim();
    const key = 'field_' + Math.random().toString(36).slice(2, 6);
    if (!next.fields.some((f) => f.label === label)) {
      next.fields.push({ key, label, type: 'text', full: true });
      changes.push('新增字段「' + label + '」');
    }
  }

  // 删除字段
  const removeField = m.match(/(?:删除|去掉|移除)(?:「|")?([^「」"，。,\n]{1,10})(?:」|")?(?:字段|列|信息)?/);
  if (removeField) {
    const label = removeField[1].trim();
    const idx = next.fields.findIndex((f) => f.label === label || f.key === label);
    if (idx >= 0 && next.fields[idx].key !== next.titleField && next.fields.length > 1) {
      changes.push('删除字段「' + next.fields[idx].label + '」');
      next.fields.splice(idx, 1);
    }
  }

  // 示例数据
  if (/(示例|演示|样例)数据/.test(m)) {
    next.seed = next.seed.concat(next.seed.slice(0, 2).map((s) => ({ ...s, title: (s[next.titleField] as string) || '示例条目' })));
    changes.push('补充了示例数据（清空浏览器本地数据后可见）');
  }

  if (changes.length === 0) {
    return {
      spec,
      changed: false,
      reply:
        '这条修改我还没有完全理解。你可以试试更具体的指令，例如：\n\n- 「换成深色主题，主色改成紫色」\n- 「改成看板视图」\n- 「改名为 我的健身计划」\n- 「增加一个备注字段」',
      summary: '未做改动',
    };
  }

  return {
    spec: next,
    changed: true,
    reply: '已经按你的要求更新：' + changes.join('；') + '。预览已刷新，原有数据会保留。',
    summary: changes.join(' · '),
  };
}
