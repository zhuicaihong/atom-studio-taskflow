import type { AppSpec, GeneratedFile } from '../../types';

function escHtml(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/* 生成应用的样式                                                       */
/* ------------------------------------------------------------------ */

function buildCss(spec: AppSpec): string {
  return String.raw`:root {
  --accent: ${spec.accent};
  --accent-ink: #ffffff;
  --bg: #f7f6f3;
  --panel: #ffffff;
  --panel-2: #fbfaf8;
  --text: #1b1b1f;
  --muted: #6f7076;
  --line: #e7e4de;
  --shadow: 0 1px 2px rgba(20, 18, 14, .04), 0 8px 28px rgba(20, 18, 14, .06);
  --radius: 16px;
}
html[data-theme="dark"] {
  --bg: #0e0e11;
  --panel: #16161a;
  --panel-2: #1b1b20;
  --text: #f4f2ee;
  --muted: #9b9ba3;
  --line: #2a2a31;
  --shadow: 0 1px 2px rgba(0, 0, 0, .3), 0 10px 30px rgba(0, 0, 0, .35);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background:
    radial-gradient(1100px 420px at 85% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 65%),
    radial-gradient(900px 380px at -10% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
.app { max-width: 1140px; margin: 0 auto; padding: 26px 28px 64px; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
.brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
.brand-mark {
  width: 48px; height: 48px; border-radius: 15px; flex: none;
  display: grid; place-items: center; font-size: 24px;
  background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 30%, var(--panel)), var(--panel));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
  box-shadow: var(--shadow);
}
.brand h1 { margin: 0; font-size: 20px; letter-spacing: -.02em; }
.brand p { margin: 2px 0 0; color: var(--muted); font-size: 12.5px; }
.top-actions { display: flex; align-items: center; gap: 10px; }
.search { position: relative; }
.search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: .45; }
.search input {
  width: 220px; padding: 10px 14px 10px 34px; border-radius: 12px;
  border: 1px solid var(--line); background: var(--panel); outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.search input:focus { border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent); }
.btn {
  border: 1px solid var(--line); background: var(--panel); padding: 9px 14px; border-radius: 11px;
  font-weight: 600; font-size: 13px; transition: transform .12s, background .15s, border-color .15s;
}
.btn:hover { background: var(--panel-2); }
.btn:active { transform: scale(.98); }
.btn.primary { background: var(--accent); border-color: transparent; color: var(--accent-ink); box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 26%, transparent); }
.btn.primary:hover { filter: brightness(1.05); }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.stat { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 15px 16px; box-shadow: var(--shadow); }
.stat-label { color: var(--muted); font-size: 12px; letter-spacing: .01em; }
.stat-value { font-size: 24px; font-weight: 700; letter-spacing: -.03em; margin-top: 3px; }
.stat-hint { color: var(--muted); font-size: 11.5px; margin-top: 2px; }
.progress-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 20px; box-shadow: var(--shadow); }
.progress-head { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--muted); margin-bottom: 9px; }
.progress-head b { color: var(--text); }
.progress { height: 8px; border-radius: 99px; background: color-mix(in srgb, var(--text) 8%, transparent); overflow: hidden; }
.progress span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #ffffff)); transition: width .35s ease; }
.content-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 12px; flex-wrap: wrap; }
.chips { display: flex; gap: 7px; flex-wrap: wrap; }
.chip { border: 1px solid var(--line); background: var(--panel); color: var(--muted); padding: 6px 12px; border-radius: 99px; font-size: 12.5px; transition: .15s; }
.chip:hover { color: var(--text); }
.chip.active { background: var(--text); color: var(--bg); border-color: var(--text); font-weight: 600; }
.meta { color: var(--muted); font-size: 12px; }
.list { display: flex; flex-direction: column; gap: 8px; }
.row {
  display: flex; align-items: center; gap: 12px; padding: 13px 15px;
  background: var(--panel); border: 1px solid var(--line); border-radius: 13px; box-shadow: var(--shadow);
  animation: rise .25s ease both;
}
.row:hover { border-color: color-mix(in srgb, var(--accent) 38%, var(--line)); }
.check { width: 22px; height: 22px; border-radius: 7px; border: 1.6px solid color-mix(in srgb, var(--text) 22%, transparent); background: transparent; flex: none; display: grid; place-items: center; color: transparent; font-size: 12px; }
.check.done { background: var(--accent); border-color: var(--accent); color: #fff; }
.row-main { flex: 1; min-width: 0; }
.row-title { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-title.done { text-decoration: line-through; color: var(--muted); }
.row-sub { color: var(--muted); font-size: 12px; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; white-space: nowrap; background: color-mix(in srgb, var(--c, #888) 14%, transparent); color: color-mix(in srgb, var(--c, #666) 72%, var(--text)); }
.icon-btn { border: 1px solid transparent; background: transparent; width: 30px; height: 30px; border-radius: 9px; color: var(--muted); display: grid; place-items: center; opacity: 0; transition: .15s; }
.row:hover .icon-btn, .card:hover .icon-btn { opacity: 1; }
.icon-btn:hover { background: var(--panel-2); color: var(--text); border-color: var(--line); }
.icon-btn.danger:hover { color: #e5484d; }
.board { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px; align-items: flex-start; }
.board-col { flex: 1 0 250px; background: color-mix(in srgb, var(--panel) 65%, transparent); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px; min-height: 200px; transition: background .15s, border-color .15s; }
.board-col.drag-over { background: color-mix(in srgb, var(--accent) 9%, var(--panel)); border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); }
.board-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding: 0 2px; }
.board-head .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 7px; }
.board-head b { font-size: 13px; }
.board-count { color: var(--muted); font-size: 11px; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 12px; box-shadow: var(--shadow); margin-bottom: 8px; cursor: grab; animation: rise .25s ease both; }
.card:active { cursor: grabbing; }
.card-title { font-weight: 600; font-size: 13.5px; }
.card-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 9px; }
.card-sub { color: var(--muted); font-size: 12px; margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.add-mini { border: 1px dashed var(--line); background: transparent; color: var(--muted); width: 100%; padding: 8px; border-radius: 10px; font-size: 12px; }
.add-mini:hover { color: var(--text); border-color: color-mix(in srgb, var(--accent) 45%, var(--line)); }
.table-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 620px; }
th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); font-weight: 600; padding: 12px 15px; border-bottom: 1px solid var(--line); }
td { padding: 13px 15px; border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent); font-size: 13px; }
tr:last-child td { border-bottom: none; }
tbody tr:hover { background: var(--panel-2); }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
td .actions { display: flex; gap: 2px; justify-content: flex-end; }
td .icon-btn { opacity: 1; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.tile { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 8px; animation: rise .25s ease both; }
.tile:hover { border-color: color-mix(in srgb, var(--accent) 36%, var(--line)); transform: translateY(-1px); transition: .18s; }
.tile-title { font-weight: 650; font-size: 15px; }
.tile-body { color: var(--muted); font-size: 12.5px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap; flex: 1; }
.tile-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 2px; }
.week { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); overflow-x: auto; }
.week-row { display: grid; grid-template-columns: minmax(150px, 1.4fr) repeat(7, 44px) 64px 58px; align-items: center; gap: 6px; padding: 12px 16px; border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent); min-width: 600px; }
.week-row:last-child { border-bottom: none; }
.week-head { color: var(--muted); font-size: 11.5px; font-weight: 600; text-align: center; }
.week-head.today { color: var(--accent); }
.week-name { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13.5px; }
.week-name span:first-child { font-size: 17px; }
.day { width: 32px; height: 32px; border-radius: 10px; border: 1px solid var(--line); background: transparent; display: grid; place-items: center; justify-self: center; color: transparent; font-size: 13px; transition: .12s; }
.day:hover { border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); }
.day.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.day.today { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.streak { color: var(--muted); font-size: 12px; text-align: right; }
.streak b { color: var(--text); }
.timer-wrap { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; align-items: start; }
.timer-card { background: var(--panel); border: 1px solid var(--line); border-radius: 22px; box-shadow: var(--shadow); padding: 30px 24px; text-align: center; }
.timer-tag { display: inline-block; font-size: 11.5px; font-weight: 600; letter-spacing: .08em; padding: 5px 12px; border-radius: 99px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: color-mix(in srgb, var(--accent) 78%, var(--text)); text-transform: uppercase; }
.ring { width: 236px; height: 236px; margin: 18px auto 8px; position: relative; }
.ring svg { transform: rotate(-90deg); }
.ring-track { stroke: color-mix(in srgb, var(--text) 8%, transparent); fill: none; stroke-width: 10; }
.ring-fill { stroke: var(--accent); fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset .3s linear; }
.ring-time { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-time b { font-size: 42px; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.ring-time small { color: var(--muted); font-size: 12px; }
.timer-label-input { width: 100%; max-width: 300px; margin: 6px auto 16px; display: block; text-align: center; border: 1px solid var(--line); background: var(--panel-2); border-radius: 11px; padding: 9px 12px; outline: none; }
.timer-label-input:focus { border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); }
.timer-actions { display: flex; gap: 9px; justify-content: center; }
.timer-actions .btn { min-width: 92px; }
.history { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
.history h3 { margin: 0 0 12px; font-size: 13px; }
.history-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent); font-size: 12.5px; }
.history-item:last-child { border-bottom: none; }
.history-item b { font-weight: 600; }
.history-item span { color: var(--muted); font-size: 11.5px; }
.empty { text-align: center; padding: 54px 20px; background: var(--panel); border: 1px dashed var(--line); border-radius: var(--radius); }
.empty-emoji { font-size: 34px; }
.empty h3 { margin: 10px 0 4px; font-size: 15px; }
.empty p { margin: 0 0 16px; color: var(--muted); font-size: 12.5px; }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 28px; color: var(--muted); font-size: 11.5px; flex-wrap: wrap; }
.foot button { border: none; background: none; color: var(--muted); text-decoration: underline; padding: 0; font-size: 11.5px; }
.modal-mask { position: fixed; inset: 0; background: rgba(12, 12, 15, .48); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; animation: fade .15s ease; }
.modal { width: 100%; max-width: 480px; background: var(--panel); border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 30px 80px rgba(0,0,0,.35); padding: 22px; animation: pop .18s ease; max-height: 88vh; overflow-y: auto; }
.modal h2 { margin: 0 0 16px; font-size: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 11.5px; color: var(--muted); font-weight: 600; }
.field input, .field select, .field textarea {
  border: 1px solid var(--line); background: var(--panel-2); border-radius: 10px; padding: 9px 11px; outline: none; width: 100%;
  transition: border-color .15s, box-shadow .15s;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 11%, transparent); }
.field textarea { resize: vertical; min-height: 76px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 20px; }
.toast-root { position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 80; align-items: center; }
.toast { background: #17171b; color: #fff; padding: 10px 16px; border-radius: 11px; font-size: 12.5px; box-shadow: 0 12px 30px rgba(0,0,0,.3); animation: toastIn .22s ease; }
@keyframes rise { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pop { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (max-width: 760px) {
  .app { padding: 18px 16px 48px; }
  .top { flex-direction: column; align-items: flex-start; gap: 14px; }
  .top-actions { width: 100%; }
  .search { flex: 1; }
  .search input { width: 100%; }
  .stats { grid-template-columns: 1fr 1fr; }
  .timer-wrap { grid-template-columns: 1fr; }
  .ring { width: 200px; height: 200px; }
  .ring-time b { font-size: 36px; }
  .board-col { flex-basis: 220px; }
  .form-grid { grid-template-columns: 1fr; }
  .foot { justify-content: center; }
}
`;
}

/* ------------------------------------------------------------------ */
/* 生成应用的运行时                                                     */
/* ------------------------------------------------------------------ */

const RUNTIME_JS = String.raw`(function () {
  'use strict';
  var STORAGE_KEY = 'atom-app:' + SPEC.storageKey;
  var THEME_KEY = 'atom-theme:' + SPEC.storageKey;
  var state = { items: [], query: '', filter: 'all', editing: null, timer: null, dragId: null };
  var timerInt = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayISO() { return ymd(new Date()); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    n = Number(n) || 0;
    return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  }
  function safeUrl(u) {
    u = String(u || '');
    return /^https?:\/\//i.test(u) ? u : '';
  }
  function relDate(v) {
    if (!v) return '';
    var s = String(v).slice(0, 10);
    var today = todayISO();
    if (s === today) return '今天';
    var y = new Date(); y.setDate(y.getDate() - 1);
    if (s === ymd(y)) return '昨天';
    return s;
  }
  function find(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }
  function toast(text) {
    var root = document.getElementById('toast-root');
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    root.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; }, 1900);
    setTimeout(function () { el.remove(); }, 2250);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        state.items = Array.isArray(data.items) ? data.items : [];
        return;
      }
    } catch (e) {}
    state.items = SPEC.seed.map(function (seed) {
      var o = Object.assign({}, seed);
      o.id = uid();
      if (SPEC.kind === 'notes' && !o.updatedAt) o.updatedAt = todayISO();
      return o;
    });
    persist();
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items, updatedAt: Date.now() })); } catch (e) {}
  }

  function statusColor(v) {
    if (!SPEC.statuses) return '#888888';
    for (var i = 0; i < SPEC.statuses.length; i++) if (SPEC.statuses[i].key === v) return SPEC.statuses[i].color;
    return '#888888';
  }
  function badge(v) {
    if (v == null || v === '') return '';
    return '<span class="badge" style="--c:' + statusColor(v) + '">' + esc(v) + '</span>';
  }
  function filterOptions() {
    if (SPEC.statuses) return SPEC.statuses.map(function (s) { return s.key; });
    if (SPEC.categoryField) {
      var out = [];
      state.items.forEach(function (it) {
        var v = it[SPEC.categoryField];
        if (v != null && v !== '' && out.indexOf(v) < 0) out.push(v);
      });
      return out;
    }
    return [];
  }
  function filtered() {
    var q = state.query.trim().toLowerCase();
    return state.items.filter(function (it) {
      if (state.filter !== 'all') {
        var fv = it.status != null ? it.status : it[SPEC.categoryField];
        if (fv !== state.filter) return false;
      }
      if (!q) return true;
      for (var i = 0; i < SPEC.fields.length; i++) {
        var v = it[SPEC.fields[i].key];
        if (String(v == null ? '' : v).toLowerCase().indexOf(q) >= 0) return true;
      }
      return false;
    });
  }
  function sum(items, key) {
    return items.reduce(function (a, b) { return a + (Number(b[key]) || 0); }, 0);
  }
  function weekDates() {
    var now = new Date();
    var day = now.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    var out = [];
    var labels = ['一', '二', '三', '四', '五', '六', '日'];
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon);
      d.setDate(mon.getDate() + i);
      out.push({ iso: ymd(d), label: labels[i], today: ymd(d) === todayISO() });
    }
    return out;
  }
  function streak(checks) {
    if (!Array.isArray(checks) || !checks.length) return 0;
    var n = 0;
    var d = new Date();
    if (checks.indexOf(ymd(d)) < 0) d.setDate(d.getDate() - 1);
    for (var i = 0; i < 400; i++) {
      if (checks.indexOf(ymd(d)) >= 0) { n++; d.setDate(d.getDate() - 1); } else break;
    }
    return n;
  }

  function statCards() {
    var all = state.items;
    var c = [];
    var kind = SPEC.kind;
    if (kind === 'habits') {
      var today = todayISO();
      var done = all.filter(function (h) { return Array.isArray(h.checks) && h.checks.indexOf(today) >= 0; }).length;
      var week = weekDates();
      var possible = all.length * 7;
      var totalChecks = 0;
      var best = 0;
      all.forEach(function (h) {
        var ch = h.checks || [];
        ch.forEach(function (d) { if (week.some(function (w) { return w.iso === d; })) totalChecks++; });
        best = Math.max(best, streak(ch));
      });
      c = [
        { label: '今日打卡', value: done + ' / ' + all.length, hint: done === all.length && all.length ? '今天全部完成 🎉' : '继续保持' },
        { label: '本周完成率', value: (possible ? Math.round(totalChecks / possible * 100) : 0) + '%', hint: '本周共 ' + totalChecks + ' 次打卡' },
        { label: '最长连续', value: best + ' 天', hint: '来自所有习惯' },
        { label: '习惯数量', value: all.length, hint: '每天进步一点点' }
      ];
    } else if (kind === 'expenses') {
      var month = todayISO().slice(0, 7);
      var monthItems = all.filter(function (x) { return String(x.date || '').slice(0, 7) === month; });
      var max = all.reduce(function (a, b) { return Math.max(a, Number(b.amount) || 0); }, 0);
      var total = sum(all, 'amount');
      var monthTotal = sum(monthItems, 'amount');
      c = [
        { label: '总支出', value: '¥' + money(total), hint: '共 ' + all.length + ' 笔' },
        { label: '本月支出', value: '¥' + money(monthTotal), hint: month },
        { label: '最大单笔', value: '¥' + money(max), hint: '控制大额开销' },
        { label: '日均支出', value: '¥' + money(all.length ? monthTotal / Math.max(1, new Date().getDate()) : 0), hint: '按本月天数计算' }
      ];
    } else if (kind === 'notes') {
      var cats = [];
      var words = 0;
      all.forEach(function (n) {
        if (n.category && cats.indexOf(n.category) < 0) cats.push(n.category);
        words += String(n.content || '').length;
      });
      var weekNotes = all.filter(function (n) { return String(n.updatedAt || '') >= weekDates()[0].iso; }).length;
      c = [
        { label: '笔记数量', value: all.length, hint: cats.length + ' 个分类' },
        { label: '累计字数', value: money(words), hint: '把想法写下来' },
        { label: '本周更新', value: weekNotes, hint: '持续记录' },
        { label: '分类', value: cats.length, hint: cats.slice(0, 3).join(' · ') || '暂无' }
      ];
    } else if (kind === 'bookmarks') {
      var bcats = [];
      all.forEach(function (b) { if (b.category && bcats.indexOf(b.category) < 0) bcats.push(b.category); });
      c = [
        { label: '收藏数量', value: all.length, hint: bcats.length + ' 个分类' },
        { label: '分类', value: bcats.length, hint: bcats.slice(0, 3).join(' · ') || '暂无' },
        { label: '本周新增', value: all.filter(function (b) { return String(b.createdAt || '') >= weekDates()[0].iso; }).length, hint: '持续积累' },
        { label: '带备注', value: all.filter(function (b) { return b.note; }).length, hint: '写下收藏理由' }
      ];
    } else if (kind === 'reading') {
      var read = all.filter(function (b) { return b.status === '已读'; }).length;
      var reading = all.filter(function (b) { return b.status === '在读'; }).length;
      var want = all.filter(function (b) { return b.status === '想读'; }).length;
      c = [
        { label: '书单总数', value: all.length, hint: '想读 ' + want + ' 本' },
        { label: '已读', value: read, hint: '完成率 ' + (all.length ? Math.round(read / all.length * 100) : 0) + '%' },
        { label: '在读', value: reading, hint: '保持阅读' },
        { label: '平均评分', value: (function () {
          var r = all.filter(function (b) { return Number(b.rating) > 0; });
          return r.length ? (r.reduce(function (a, b) { return a + Number(b.rating); }, 0) / r.length).toFixed(1) : '-';
        })(), hint: '满分 5 分' }
      ];
    } else if (kind === 'crm') {
      var won = all.filter(function (x) { return x.stage === '已成交'; });
      var active = all.filter(function (x) { return x.stage === '线索' || x.stage === '沟通中'; });
      c = [
        { label: '客户数量', value: all.length, hint: active.length + ' 个跟进中' },
        { label: '已成交', value: won.length, hint: '金额 ¥' + money(sum(won, 'value')) },
        { label: '预计总额', value: '¥' + money(sum(all, 'value')), hint: '含全部阶段' },
        { label: '转化率', value: (all.length ? Math.round(won.length / all.length * 100) : 0) + '%', hint: '已成交 / 全部' }
      ];
    } else if (kind === 'timer') {
      var todayS = all.filter(function (s) { return String(s.completedAt || '').slice(0, 10) === todayISO(); });
      var weekMin = all.filter(function (s) { return String(s.completedAt || '').slice(0, 10) >= weekDates()[0].iso; });
      c = [
        { label: '今日专注', value: money(sum(todayS, 'minutes')) + ' 分钟', hint: todayS.length + ' 个番茄' },
        { label: '本周专注', value: money(sum(weekMin, 'minutes')) + ' 分钟', hint: '保持节奏' },
        { label: '累计次数', value: all.length, hint: '所有专注记录' },
        { label: '累计时长', value: money(sum(all, 'minutes')) + ' 分钟', hint: '深度工作总量' }
      ];
    } else {
      var done2 = all.filter(function (x) { return x.status === '已完成'; }).length;
      var doing = all.filter(function (x) { return x.status === '进行中'; }).length;
      c = [
        { label: '全部任务', value: all.length, hint: doing + ' 项进行中' },
        { label: '已完成', value: done2, hint: '完成率 ' + (all.length ? Math.round(done2 / all.length * 100) : 0) + '%' },
        { label: '待办', value: all.filter(function (x) { return x.status === '待办'; }).length, hint: '下一步行动' },
        { label: '完成率', value: (all.length ? Math.round(done2 / all.length * 100) : 0) + '%', hint: '持续推进' }
      ];
    }
    return c.map(function (x) {
      return '<div class="stat"><div class="stat-label">' + esc(x.label) + '</div><div class="stat-value">' + esc(x.value) + '</div><div class="stat-hint">' + esc(x.hint) + '</div></div>';
    }).join('');
  }

  function progressBar() {
    if (SPEC.kind === 'habits' || SPEC.kind === 'notes' || SPEC.kind === 'bookmarks' || SPEC.kind === 'timer') return '';
    var total = state.items.length;
    if (!total) return '';
    var done;
    if (SPEC.kind === 'expenses') {
      done = Math.min(100, Math.round(sum(state.items, 'amount') / 5000 * 100));
      return '<div class="progress-wrap"><div class="progress-head"><span>本月预算使用</span><span><b>' + done + '%</b> · ¥' + money(sum(state.items, 'amount')) + ' / 预估 ¥5,000</span></div><div class="progress"><span style="width:' + done + '%"></span></div></div>';
    }
    if (SPEC.kind === 'crm') {
      done = Math.round(state.items.filter(function (x) { return x.stage === '已成交'; }).length / total * 100);
      return '<div class="progress-wrap"><div class="progress-head"><span>销售管道转化</span><span><b>' + done + '%</b> · ' + total + ' 位客户</span></div><div class="progress"><span style="width:' + done + '%"></span></div></div>';
    }
    if (SPEC.kind === 'reading') {
      done = Math.round(state.items.filter(function (x) { return x.status === '已读'; }).length / total * 100);
      return '<div class="progress-wrap"><div class="progress-head"><span>阅读完成度</span><span><b>' + done + '%</b> · 共 ' + total + ' 本</span></div><div class="progress"><span style="width:' + done + '%"></span></div></div>';
    }
    done = Math.round(state.items.filter(function (x) { return x.status === '已完成'; }).length / total * 100);
    return '<div class="progress-wrap"><div class="progress-head"><span>整体完成进度</span><span><b>' + done + '%</b> · ' + total + ' 项任务</span></div><div class="progress"><span style="width:' + done + '%"></span></div></div>';
  }

  function rowSub(it) {
    var parts = [];
    if (SPEC.subtitleField && it[SPEC.subtitleField]) parts.push(esc(it[SPEC.subtitleField]));
    if (SPEC.categoryField && it[SPEC.categoryField] && SPEC.categoryField !== 'status') parts.push(esc(it[SPEC.categoryField]));
    if (SPEC.dateField && it[SPEC.dateField] && SPEC.dateField !== 'updatedAt') parts.push(esc(relDate(it[SPEC.dateField])));
    if (it.notes && SPEC.fields.some(function (f) { return f.key === 'notes'; })) parts.push(esc(it.notes));
    return parts.join(' · ');
  }

  function viewList() {
    var items = filtered();
    if (!items.length) return emptyState();
    return '<div class="list">' + items.map(function (it) {
      var done = it.status === '已完成';
      return '<div class="row" data-id="' + esc(it.id) + '">' +
        (SPEC.statuses ? '<button class="check ' + (done ? 'done' : '') + '" data-action="toggle" data-id="' + esc(it.id) + '" title="切换状态">✓</button>' : '') +
        '<div class="row-main"><div class="row-title ' + (done ? 'done' : '') + '">' + esc(it[SPEC.titleField]) + '</div><div class="row-sub">' + rowSub(it) + '</div></div>' +
        (it.status ? badge(it.status) : '') +
        (SPEC.numericField && it[SPEC.numericField] != null ? '<b style="font-variant-numeric:tabular-nums">' + money(it[SPEC.numericField]) + '</b>' : '') +
        '<button class="icon-btn" data-action="edit" data-id="' + esc(it.id) + '" title="编辑">✎</button>' +
        '<button class="icon-btn danger" data-action="del" data-id="' + esc(it.id) + '" title="删除">✕</button>' +
        '</div>';
    }).join('') + '</div>';
  }

  function viewBoard() {
    var statuses = SPEC.statuses || [];
    return '<div class="board">' + statuses.map(function (s) {
      var items = filtered().filter(function (it) { return it.status === s.key; });
      return '<div class="board-col" data-status="' + esc(s.key) + '">' +
        '<div class="board-head"><b><span class="dot" style="background:' + s.color + '"></span>' + esc(s.label) + '</b><span class="board-count">' + items.length + '</span></div>' +
        items.map(function (it) {
          return '<div class="card" draggable="true" data-id="' + esc(it.id) + '" data-action="edit" data-edit-id="' + esc(it.id) + '">' +
            '<div class="card-title">' + esc(it[SPEC.titleField]) + '</div>' +
            (rowSub(it) ? '<div class="card-sub">' + rowSub(it) + '</div>' : '') +
            '<div class="card-meta">' + badge(it[SPEC.categoryField] || '') +
            '<span style="color:var(--muted);font-size:11px">' + (SPEC.dateField ? esc(relDate(it[SPEC.dateField])) : '') + '</span></div>' +
            '</div>';
        }).join('') +
        '<button class="add-mini" data-action="new" data-status="' + esc(s.key) + '">+ 添加</button>' +
        '</div>';
    }).join('') + '</div>';
  }

  function viewTable() {
    var items = filtered();
    if (!items.length) return emptyState();
    var cols = [
      { key: SPEC.titleField, label: '名称' },
      SPEC.categoryField ? { key: SPEC.categoryField, label: fieldLabel(SPEC.categoryField) } : null,
      SPEC.numericField ? { key: SPEC.numericField, label: SPEC.valueLabel || '数值', num: true } : null,
      SPEC.dateField ? { key: SPEC.dateField, label: '日期' } : null
    ].filter(Boolean);
    var total = SPEC.numericField ? sum(filtered(), SPEC.numericField) : 0;
    return '<div class="table-wrap"><table><thead><tr>' + cols.map(function (c) {
      return '<th class="' + (c.num ? 'num' : '') + '">' + esc(c.label) + '</th>';
    }).join('') + '<th style="text-align:right">操作</th></tr></thead><tbody>' + items.map(function (it) {
      return '<tr data-id="' + esc(it.id) + '">' + cols.map(function (c) {
        var v = it[c.key];
        var inner = esc(v);
        if (c.key === SPEC.categoryField && SPEC.statuses) inner = badge(v);
        if (c.key === SPEC.dateField) inner = esc(relDate(v));
        if (c.key === SPEC.numericField) inner = v == null || v === '' ? '-' : '¥' + money(v);
        return '<td class="' + (c.num ? 'num' : '') + '">' + inner + '</td>';
      }).join('') + '<td><div class="actions"><button class="icon-btn" data-action="edit" data-id="' + esc(it.id) + '">✎</button><button class="icon-btn danger" data-action="del" data-id="' + esc(it.id) + '">✕</button></div></td></tr>';
    }).join('') + '</tbody>' + (SPEC.numericField ? (function () {
      var ni = 0;
      for (var i = 0; i < cols.length; i++) if (cols[i].num) ni = i;
      return '<tfoot><tr><td colspan="' + ni + '" style="font-weight:600">合计</td><td class="num" style="font-weight:700">¥' + money(total) + '</td><td colspan="' + (cols.length - ni - 1) + '"></td><td></td></tr></tfoot>';
    })() : '') + '</table></div>';
  }

  function fieldLabel(key) {
    for (var i = 0; i < SPEC.fields.length; i++) if (SPEC.fields[i].key === key) return SPEC.fields[i].label;
    return key;
  }

  function viewGrid() {
    var items = filtered();
    if (!items.length) return emptyState();
    return '<div class="grid">' + items.map(function (it) {
      var url = SPEC.kind === 'bookmarks' ? safeUrl(it.url) : '';
      var body = SPEC.subtitleField ? it[SPEC.subtitleField] : '';
      var extra = '';
      if (SPEC.kind === 'notes') extra = '<div class="tile-foot"><span class="meta">' + esc(relDate(it.updatedAt)) + '</span>' + badge(it.category) + '</div>';
      if (SPEC.kind === 'bookmarks') extra = '<div class="tile-foot">' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-size:12px;text-decoration:none">打开链接 ↗</a>' : '<span></span>') + badge(it.category) + '</div>';
      if (SPEC.kind === 'reading') extra = '<div class="tile-foot"><span class="meta">' + esc(it.author || '') + '</span>' + badge(it.status) + '</div>';
      var rating = SPEC.kind === 'reading' && Number(it.rating) > 0 ? '<div style="color:#f5a623;font-size:12px;letter-spacing:2px">' + '★★★★★'.slice(0, Number(it.rating)) + '<span style="color:var(--line)">' + '★★★★★'.slice(Number(it.rating)) + '</span></div>' : '';
      return '<div class="tile" data-id="' + esc(it.id) + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div class="tile-title">' + esc(it[SPEC.titleField]) + '</div>' +
        '<div style="display:flex;gap:2px"><button class="icon-btn" data-action="edit" data-id="' + esc(it.id) + '">✎</button><button class="icon-btn danger" data-action="del" data-id="' + esc(it.id) + '">✕</button></div></div>' +
        (body ? '<div class="tile-body">' + esc(body) + '</div>' : '') +
        rating + extra + '</div>';
    }).join('') + '</div>';
  }

  function viewWeek() {
    var items = filtered();
    var week = weekDates();
    var head = '<div class="week-row" style="background:var(--panel-2)"><div class="week-head" style="text-align:left">习惯</div>' + week.map(function (d) {
      return '<div class="week-head ' + (d.today ? 'today' : '') + '">' + d.label + '<br><span style="font-size:10px;font-weight:400">' + d.iso.slice(5) + '</span></div>';
    }).join('') + '<div class="week-head">连续</div><div class="week-head">操作</div></div>';
    if (!items.length) return emptyState();
    return '<div class="week">' + head + items.map(function (it) {
      var checks = Array.isArray(it.checks) ? it.checks : [];
      return '<div class="week-row" data-id="' + esc(it.id) + '">' +
        '<div class="week-name"><span>' + esc(it.emoji || '🌱') + '</span><div><div>' + esc(it.name) + '</div>' + (it.note ? '<div style="color:var(--muted);font-size:11px;font-weight:400;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(it.note) + '</div>' : '') + '</div></div>' +
        week.map(function (d) {
          var on = checks.indexOf(d.iso) >= 0;
          return '<button class="day ' + (on ? 'on' : '') + ' ' + (d.today ? 'today' : '') + '" data-action="check" data-id="' + esc(it.id) + '" data-date="' + d.iso + '">✓</button>';
        }).join('') +
        '<div class="streak"><b>' + streak(checks) + '</b> 天</div>' +
        '<div style="display:flex;gap:2px;justify-content:flex-end"><button class="icon-btn" data-action="edit" data-id="' + esc(it.id) + '">✎</button><button class="icon-btn danger" data-action="del" data-id="' + esc(it.id) + '">✕</button></div>' +
        '</div>';
    }).join('') + '</div>';
  }

  function timerState() {
    if (!state.timer) {
      var focus = (SPEC.timer && SPEC.timer.focus) || 25;
      state.timer = { mode: 'focus', total: focus * 60, left: focus * 60, running: false, endAt: 0, label: '' };
    }
    return state.timer;
  }
  function viewTimer() {
    var t = timerState();
    var items = filtered().slice().sort(function (a, b) { return String(b.completedAt || '').localeCompare(String(a.completedAt || '')); });
    var pct = t.total ? (t.total - t.left) / t.total : 0;
    var circ = 2 * Math.PI * 104;
    var off = circ * (1 - pct);
    var time = pad(Math.floor(t.left / 60)) + ':' + pad(t.left % 60);
    var modeLabel = t.mode === 'focus' ? '专注模式' : '休息一下';
    return '<div class="timer-wrap">' +
      '<div class="timer-card">' +
      '<div class="timer-tag">' + modeLabel + '</div>' +
      '<div class="ring"><svg width="236" height="236" viewBox="0 0 236 236"><circle class="ring-track" cx="118" cy="118" r="104"></circle><circle id="ring-fill" class="ring-fill" cx="118" cy="118" r="104" stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '"></circle></svg>' +
      '<div class="ring-time"><b id="timer-time">' + time + '</b><small>' + (t.running ? '专注中，别分心' : '准备好了就开始') + '</small></div></div>' +
      '<input class="timer-label-input" id="timer-label" placeholder="这一轮要完成什么？" value="' + esc(t.label) + '">' +
      '<div class="timer-actions">' +
      '<button class="btn primary" data-action="timer-toggle">' + (t.running ? '暂停' : '开始') + '</button>' +
      '<button class="btn" data-action="timer-reset">重置</button>' +
      '<button class="btn" data-action="timer-record">记录一轮</button>' +
      '</div></div>' +
      '<div class="history"><h3>专注记录 · ' + items.length + '</h3>' +
      (items.length ? items.slice(0, 8).map(function (s) {
        return '<div class="history-item"><div><b>' + esc(s.label || '专注') + '</b><div><span>' + esc(s.completedAt) + '</span></div></div><span>' + esc(s.minutes) + ' 分钟</span></div>';
      }).join('') : '<div style="color:var(--muted);font-size:12.5px;padding:12px 0">还没有记录，完成第一轮专注吧。</div>') +
      '</div></div>';
  }

  function emptyState() {
    if (state.query || state.filter !== 'all') {
      return '<div class="empty"><div class="empty-emoji">🔍</div><h3>没有匹配的结果</h3><p>换个关键词，或切换到「全部」。</p></div>';
    }
    return '<div class="empty"><div class="empty-emoji">' + esc(SPEC.emoji) + '</div><h3>从第一条开始</h3><p>' + esc(SPEC.tagline) + '</p><button class="btn primary" data-action="new">新建第一条</button></div>';
  }

  function chipList() {
    var options = filterOptions();
    if (!options.length) return '';
    var html = '<button class="chip ' + (state.filter === 'all' ? 'active' : '') + '" data-action="filter" data-filter="all">全部</button>';
    options.forEach(function (o) {
      html += '<button class="chip ' + (state.filter === o ? 'active' : '') + '" data-action="filter" data-filter="' + esc(o) + '">' + esc(o) + '</button>';
    });
    return html;
  }

  function currentView() {
    if (SPEC.view === 'board') return viewBoard();
    if (SPEC.view === 'table') return viewTable();
    if (SPEC.view === 'grid') return viewGrid();
    if (SPEC.view === 'week') return viewWeek();
    if (SPEC.view === 'timer') return viewTimer();
    return viewList();
  }

  function render() {
    var active = document.activeElement;
    var focusId = active && active.id ? active.id : null;
    var selStart = focusId && active.selectionStart != null ? active.selectionStart : null;
    var root = document.getElementById('app');
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    root.innerHTML =
      '<div class="app">' +
        '<header class="top">' +
          '<div class="brand"><div class="brand-mark">' + esc(SPEC.emoji) + '</div><div><h1>' + esc(SPEC.appName) + '</h1><p>' + esc(SPEC.tagline) + '</p></div></div>' +
          '<div class="top-actions">' +
            (SPEC.searchable ? '<div class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg><input id="search" placeholder="搜索…" value="' + esc(state.query) + '"></div>' : '') +
            '<button class="btn" data-action="theme" title="切换主题">' + (isDark ? '☀' : '☾') + '</button>' +
            '<button class="btn primary" data-action="new">+ 新建</button>' +
          '</div>' +
        '</header>' +
        '<section class="stats">' + statCards() + '</section>' +
        progressBar() +
        '<main class="content">' +
          '<div class="content-head"><div class="chips">' + chipList() + '</div><div class="meta">' + filtered().length + ' 条 · 数据自动保存</div></div>' +
          currentView() +
        '</main>' +
        '<footer class="foot"><span>' + esc(SPEC.description) + ' · 由 Atom Studio 生成</span><span>数据保存在浏览器本地 · <button data-action="export">导出数据</button></span></footer>' +
      '</div>';
    if (focusId) {
      var el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (selStart != null && el.setSelectionRange) {
          try { el.setSelectionRange(selStart, selStart); } catch (e) {}
        }
      }
    }
    if (SPEC.view === 'timer') updateTimerUI();
  }

  function renderModal() {
    var root = document.getElementById('modal-root');
    if (!state.editing) { root.innerHTML = ''; document.body.style.overflow = ''; return; }
    var isNew = state.editing === 'new';
    var item = isNew ? {} : (find(state.editing) || {});
    var title = isNew ? '新建' + (SPEC.kind === 'notes' ? '笔记' : SPEC.kind === 'habits' ? '习惯' : '记录') : '编辑';
    var fields = SPEC.fields.map(function (f) {
      var value = item[f.key] != null ? item[f.key] : '';
      if (isNew && f.type === 'date' && SPEC.kind === 'expenses') value = todayISO();
      if (value === '' && f.type === 'select' && f.options && f.options.length) value = f.options[0];
      var input;
      if (f.type === 'textarea') {
        input = '<textarea name="' + f.key + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(value) + '</textarea>';
      } else if (f.type === 'select') {
        input = '<select name="' + f.key + '">' + (f.options || []).map(function (o) {
          return '<option value="' + esc(o) + '" ' + (String(value) === String(o) ? 'selected' : '') + '>' + esc(o) + '</option>';
        }).join('') + '</select>';
      } else {
        input = '<input name="' + f.key + '" type="' + (f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text') + '" value="' + esc(value) + '" placeholder="' + esc(f.placeholder || '') + '" ' + (f.required ? 'required' : '') + '>';
      }
      return '<div class="field ' + (f.full ? 'full' : '') + '"><label>' + esc(f.label) + (f.required ? ' *' : '') + '</label>' + input + '</div>';
    }).join('');
    root.innerHTML =
      '<div class="modal-mask" data-action="close-modal">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<h2>' + (isNew ? '新建' : '编辑') + ' · ' + esc(SPEC.appName) + '</h2>' +
          '<form id="item-form"><div class="form-grid">' + fields + '</div>' +
          '<div class="modal-actions"><button type="button" class="btn" data-action="close-modal">取消</button><button type="submit" class="btn primary">' + (isNew ? '创建' : '保存') + '</button></div></form>' +
        '</div>' +
      '</div>';
    document.body.style.overflow = 'hidden';
    var first = root.querySelector('input, textarea, select');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }

  function openModal(id, preset) {
    state.editing = id;
    state.preset = preset || null;
    renderModal();
  }
  function closeModal() { state.editing = null; renderModal(); }

  function updateTimerUI() {
    if (!state.timer || SPEC.view !== 'timer') return;
    var t = state.timer;
    var timeEl = document.getElementById('timer-time');
    var ring = document.getElementById('ring-fill');
    if (timeEl) timeEl.textContent = pad(Math.floor(t.left / 60)) + ':' + pad(t.left % 60);
    if (ring) {
      var circ = 2 * Math.PI * 104;
      ring.setAttribute('stroke-dashoffset', String(circ * (1 - (t.total - t.left) / t.total)));
    }
  }
  function tick() {
    var t = state.timer;
    if (!t || !t.running) return;
    var left = Math.max(0, Math.round((t.endAt - Date.now()) / 1000));
    t.left = left;
    updateTimerUI();
    if (left <= 0) finishRound();
  }
  function startTimer() {
    var t = timerState();
    if (t.running) return;
    t.running = true;
    t.endAt = Date.now() + t.left * 1000;
    if (timerInt) clearInterval(timerInt);
    timerInt = setInterval(tick, 250);
    render();
  }
  function pauseTimer() {
    var t = timerState();
    t.running = false;
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    render();
  }
  function resetTimer() {
    var t = timerState();
    t.running = false;
    var focus = (SPEC.timer && SPEC.timer.focus) || 25;
    var rest = (SPEC.timer && SPEC.timer.rest) || 5;
    t.total = (t.mode === 'focus' ? focus : rest) * 60;
    t.left = t.total;
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    render();
  }
  function recordRound(minutes, label) {
    state.items.push({ id: uid(), label: label || state.timer.label || '专注', minutes: minutes || Math.round(state.timer.total / 60), completedAt: todayISO() });
    persist();
  }
  function finishRound() {
    var t = state.timer;
    t.running = false;
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    recordRound(Math.round(t.total / 60), t.label);
    var wasFocus = t.mode === 'focus';
    t.mode = wasFocus ? 'rest' : 'focus';
    var rest = (SPEC.timer && SPEC.timer.rest) || 5;
    var focus = (SPEC.timer && SPEC.timer.focus) || 25;
    t.total = (wasFocus ? rest : focus) * 60;
    t.left = t.total;
    render();
    toast(wasFocus ? '完成一轮专注，休息一下 ☕' : '休息结束，继续专注吧 🍅');
  }

  function toggleHabit(id, date) {
    var it = find(id);
    if (!it) return;
    if (!Array.isArray(it.checks)) it.checks = [];
    var idx = it.checks.indexOf(date);
    if (idx >= 0) it.checks.splice(idx, 1); else it.checks.push(date);
    persist();
    render();
  }

  function exportData() {
    var blob = new Blob([JSON.stringify({ app: SPEC.appName, spec: SPEC, items: state.items }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data-' + SPEC.kind + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('已导出 JSON 备份');
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id') || el.getAttribute('data-edit-id');
    if (action === 'close-modal') {
      if (e.target === el) closeModal();
      return;
    }
    if (action === 'new') { openModal('new', el.getAttribute('data-status')); return; }
    if (action === 'edit') { openModal(id); return; }
    if (action === 'del') {
      var it = find(id);
      if (it && window.confirm('确定删除「' + (it[SPEC.titleField] || '这条记录') + '」吗？')) {
        state.items = state.items.filter(function (x) { return x.id !== id; });
        persist();
        render();
        toast('已删除');
      }
      return;
    }
    if (action === 'toggle') {
      var item = find(id);
      if (!item) return;
      item.status = item.status === '已完成' ? '待办' : '已完成';
      persist();
      render();
      toast(item.status === '已完成' ? '完成，很棒 👍' : '已重新打开');
      return;
    }
    if (action === 'filter') { state.filter = el.getAttribute('data-filter'); render(); return; }
    if (action === 'check') { toggleHabit(id, el.getAttribute('data-date')); return; }
    if (action === 'theme') {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (err) {}
      render();
      return;
    }
    if (action === 'export') { exportData(); return; }
    if (action === 'timer-toggle') {
      var t = timerState();
      if (t.running) pauseTimer(); else startTimer();
      return;
    }
    if (action === 'timer-reset') { resetTimer(); return; }
    if (action === 'timer-record') {
      recordRound((SPEC.timer && SPEC.timer.focus) || 25, state.timer ? state.timer.label : '');
      render();
      toast('已记录一轮专注 🍅');
      return;
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'search') { state.query = e.target.value; render(); return; }
    if (e.target.id === 'timer-label') { timerState().label = e.target.value; return; }
  });

  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'item-form') return;
    e.preventDefault();
    var form = new FormData(e.target);
    var data = {};
    SPEC.fields.forEach(function (f) {
      var v = form.get(f.key);
      data[f.key] = v == null ? '' : String(v);
    });
    var missing = SPEC.fields.filter(function (f) { return f.required && !String(data[f.key] || '').trim(); });
    if (missing.length) { toast('请填写：' + missing[0].label); return; }
    if (state.editing === 'new') {
      var obj = Object.assign({ id: uid() }, data);
      if (SPEC.kind === 'notes') obj.updatedAt = todayISO();
      if (SPEC.kind === 'bookmarks') obj.createdAt = todayISO();
      if (state.preset && SPEC.statuses) obj.status = state.preset;
      if (SPEC.kind === 'habits') obj.checks = [];
      if (SPEC.kind === 'habits' && !obj.emoji) obj.emoji = '🌱';
      state.items.unshift(obj);
      toast('已创建');
    } else {
      var cur = find(state.editing);
      if (cur) {
        Object.assign(cur, data);
        if (SPEC.kind === 'notes') cur.updatedAt = todayISO();
      }
      toast('已保存');
    }
    persist();
    closeModal();
    render();
  });

  document.addEventListener('dragstart', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    state.dragId = card.getAttribute('data-id');
    try { e.dataTransfer.setData('text/plain', state.dragId); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
  });
  document.addEventListener('dragover', function (e) {
    var col = e.target.closest('.board-col');
    if (!col) return;
    e.preventDefault();
    col.classList.add('drag-over');
  });
  document.addEventListener('dragleave', function (e) {
    var col = e.target.closest('.board-col');
    if (col) col.classList.remove('drag-over');
  });
  document.addEventListener('drop', function (e) {
    var col = e.target.closest('.board-col');
    if (!col) return;
    e.preventDefault();
    col.classList.remove('drag-over');
    var id = state.dragId;
    if (!id) id = e.dataTransfer.getData('text/plain');
    var item = find(id);
    if (item && SPEC.statuses) {
      item.status = col.getAttribute('data-status');
      persist();
      render();
      toast('已移动到「' + item.status + '」');
    }
    state.dragId = null;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.editing) closeModal();
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      openModal('new');
    }
  });

  function init() {
    try {
      var savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}
    load();
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();`;

/* ------------------------------------------------------------------ */
/* 文件组装                                                             */
/* ------------------------------------------------------------------ */

export function buildFiles(spec: AppSpec): GeneratedFile[] {
  const specJson = JSON.stringify(spec, null, 2);
  const html = `<!doctype html>
<html lang="zh-CN" data-theme="${spec.dark ? 'dark' : 'light'}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escHtml(spec.appName)}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <div id="modal-root"></div>
    <div id="toast-root" class="toast-root"></div>
    <script src="app.js"></script>
  </body>
</html>
`;

  const js = `/* ${spec.appName} — generated by Atom Studio
 * 数据持久化：浏览器 localStorage（key: atom-app:${spec.storageKey}）
 */
const SPEC = ${specJson.replace(/</g, '\\u003c')};

${RUNTIME_JS}
`;

  return [
    { path: 'index.html', language: 'html', content: html },
    { path: 'styles.css', language: 'css', content: buildCss(spec) },
    { path: 'app.js', language: 'javascript', content: js },
    { path: 'spec.json', language: 'json', content: specJson },
  ];
}

export function buildPreviewHtml(spec: AppSpec, files: GeneratedFile[]): string {
  const get = (p: string) => files.find((f) => f.path === p)?.content || '';
  const css = get('styles.css');
  const js = get('app.js').replace(/<\/script/gi, '<\\/script');
  return `<!doctype html>
<html lang="zh-CN" data-theme="${spec.dark ? 'dark' : 'light'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escHtml(spec.appName)}</title>
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<div id="modal-root"></div>
<div id="toast-root" class="toast-root"></div>
<script>${js}</script>
</body>
</html>`;
}
