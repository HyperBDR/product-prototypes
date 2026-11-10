/* SourceLens 全站交互原型 · 核心框架 */
(function () {
'use strict';
const W = window;
const EMBED = new URLSearchParams(location.search).has('embed');

/* ═════ icons ═════ */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 3-2 4-4 4z"/><path d="M14 21c3 0 7-1 7-8V5h-7v8h4c0 3-2 4-4 4z"/>',
  down: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m6 15 6-6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>', left: '<path d="m15 6-6 6 6 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  msg: '<path d="M4 5h16v11H9l-5 4z"/>',
  bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  server: '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  send: '<path d="M5 12 20 4l-4 16-4-7z"/>',
  clip: '<path d="M20 11 12 19a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6.2A9.6 9.6 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3 3.6M6.6 7.6C3.9 9.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4-.9"/>',
  warn: '<path d="M12 4 2.5 20h19zM12 10v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  okc: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  xc: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M6 3h8l5 5v13H6zM14 3v5h5"/>',
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>',
  logout: '<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  play: '<path d="M7 5v14l12-7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  zap: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  wifioff: '<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 3.4-2M2 9a15 15 0 0 1 5-3M19 12.9a10 10 0 0 0-3-1.9M22 9a15 15 0 0 0-8.5-3.9M12 20h.01"/>',
  term: '<path d="m5 8 4 4-4 4M11 17h8"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
  dollar: '<path d="M12 3v18M16.5 7.5C15.5 6 14 5.5 12 5.5c-2.5 0-4 1.2-4 3 0 4.5 8.5 2 8.5 6.5 0 1.8-1.7 3-4.5 3-2 0-3.8-.7-4.7-2.2"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
  hash: '<path d="M5 9h15M4 15h15M10 3 8 21M16 3l-2 18"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  stars: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.4 6.6 19.500l1.2-6L3.300 9.300l6.100-.7z"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.500 4.500 4.500 0 0 1 17.500 18z"/>',
  rotate: '<path d="M4 12a8 8 0 1 1 3 6.200M4 18v-5h5"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.700 5.700 12.600 12.600"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2v6h-4M14 18h2"/>',
  sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  pin: '<path d="M12 17v5M8 3h8l-1 7 3 3v2H6v-2l3-3z"/>',
  flask: '<path d="M9 3h6M10 3v6L4.500 19a1.500 1.500 0 0 0 1.300 2.200h12.400a1.500 1.500 0 0 0 1.300-2.200L14 9V3M7.500 15h9"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
};
function ic(n, c) { return '<svg class="ico' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (P[n] || P.info) + '</svg>'; }

/* ═════ utils ═════ */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const pick = (r, a) => a[Math.floor(r() * a.length)];
const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const fmt = n => n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const NOW = new Date('2026-11-08T12:00:00');
function ago(min) {
  if (min < 1) return '刚刚';
  if (min < 60) return Math.floor(min) + ' 分钟前';
  if (min < 1440) return Math.floor(min / 60) + ' 小时前';
  if (min < 1440 * 7) return Math.floor(min / 1440) + ' 天前';
  const d = new Date(NOW - min * 60000);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function dt(min) { const d = new Date(NOW - min * 60000); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
const bytes = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : n < 1073741824 ? (n / 1048576).toFixed(1) + ' MB' : (n / 1073741824).toFixed(2) + ' GB';
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
const ACOL = ['', 'c2', 'c3', 'c4', 'c5', 'c6'];
function av(name, cls) { const n = String(name || '?'); return '<span class="av ' + (cls || '') + ' ' + ACOL[hash(n) % ACOL.length] + '">' + esc(n.trim().slice(0, 1).toUpperCase()) + '</span>'; }

/* ═════ state ═════ */
const S = W.S = { page: 'chat', scale: 'normal', status: 'ok', scn: {}, theme: 'system', style: 'soft', role: 'tadmin', tenant: 1, ctx: 'tenant', mode: 'desktop', notes: false,
  ui: {}, tbl: {}, drawer: null, dialog: null, menu: null, pop: null, userMenu: false, notif: false, nav: false, toasts: [], asw: 0 };
const SYNC = ['page', 'scale', 'status', 'scn', 'theme', 'style', 'role', 'tenant', 'ctx'];
const PAGES = [], PMAP = {}, DRAWERS = {}, ACT = {}, INP = {};
W.PAGES = PAGES; W.PMAP = PMAP; W.DRAWERS = DRAWERS; W.ACT = ACT; W.INP = INP;
function page(d) { PAGES.push(d); PMAP[d.id] = d; }
const scn = () => S.scn[S.page] || '';
const cnt = sp => S.scale === 'empty' ? 0 : (sp[S.scale] != null ? sp[S.scale] : sp.normal);
W.H = { ic, esc, rng, hash, pick, int, fmt, ago, dt, bytes, md, av, NOW, page, scn, cnt };

/* ═════ status gate ═════ */
function skeleton(kind) {
  if (kind === 'cards') return '<div class="kpis">' + [1, 2, 3, 4].map(() => '<div class="panel kpi"><div class="sk" style="height:12px;width:50%"></div><div class="sk" style="height:26px;width:70%"></div><div class="sk" style="height:10px;width:40%"></div></div>').join('') + '</div><div class="panel pad"><div class="sk" style="height:12px;width:30%;margin-bottom:16px"></div><div class="sk" style="height:200px"></div></div>';
  if (kind === 'form') return '<div class="panel pad" style="gap:18px">' + [1, 2, 3, 4].map(() => '<div class="field"><div class="sk" style="height:12px;width:20%"></div><div class="sk" style="height:34px"></div></div>').join('') + '</div>';
  return '<div class="panel clip">' + [1, 2, 3, 4, 5, 6, 7].map(() => '<div class="skrow" style="grid-template-columns:30px 1fr 80px 60px"><div class="sk" style="height:30px;border-radius:6px"></div><div><div class="sk" style="height:12px;width:60%;margin-bottom:6px"></div><div class="sk" style="height:9px;width:35%"></div></div><div class="sk" style="height:14px"></div><div class="sk" style="height:14px"></div></div>').join('') + '</div>';
}
function errorPanel(msg) { return '<div class="panel"><div class="empty"><div class="empty-ic bad">' + ic('warn') + '</div><div class="empty-t">加载失败</div><div class="empty-d">' + esc(msg || '服务暂时无法响应，数据没有丢失。请重试，若持续失败可将下方请求编号反馈给管理员。') + '</div><div class="empty-code">request_id: 7f3a-91c2 · 502 Bad Gateway</div><div class="empty-a"><button class="btn btn-pri" data-act="retry">' + ic('refresh') + '重试</button><button class="btn btn-gh" data-act="status" data-a="ok">返回</button></div></div></div>'; }
function deniedPanel() { return '<div class="panel"><div class="empty"><div class="empty-ic warn">' + ic('lock') + '</div><div class="empty-t">没有访问权限</div><div class="empty-d">当前账号 <b>zhang.wei@acme.com</b> 缺少「<span class="mono">admin_console</span>」功能权限。如需访问请联系管理员为你的角色开通，或切换到有权限的账号。</div><div class="empty-a"><button class="btn btn-pri" data-nav="chat">返回工作台</button><button class="btn btn-gh" data-act="toast" data-a="info|已向管理员发送权限申请">申请权限</button></div></div></div>'; }
function offlineBar() { return '<div class="banner warn">' + ic('wifioff') + '<div class="bd"><b>网络已断开</b> · 正在显示 3 分钟前缓存的数据，所有写操作暂不可用。恢复连接后将自动刷新。</div><div class="act"><button class="btn btn-gh sm" data-act="retry">立即重试</button></div></div>'; }
function gate(inner, sk) {
  if (S.status === 'loading') return skeleton(sk || 'cards');
  if (S.status === 'error') return errorPanel();
  if (S.status === 'denied') return deniedPanel();
  return (S.status === 'offline' ? offlineBar() : '') + inner();
}
W.H.gate = gate; W.H.skeleton = skeleton; W.H.errorPanel = errorPanel; W.H.deniedPanel = deniedPanel; W.H.offlineBar = offlineBar;

function emptyBlock(o) {
  return '<div class="empty' + (o.sm ? ' sm' : '') + '"><div class="empty-ic ' + (o.tone || '') + '">' + ic(o.ic || 'folder') + '</div><div class="empty-t">' + esc(o.t) + '</div>' + (o.d ? '<div class="empty-d">' + o.d + '</div>' : '') + (o.btns ? '<div class="empty-a">' + o.btns + '</div>' : '') + '</div>';
}
W.H.empty = emptyBlock;

/* ═════ small components ═════ */
const pill = (t, tone, extra) => '<span class="pill ' + (tone || '') + '">' + (extra === 'dot' ? '<i class="dot ' + (tone || '') + '"></i>' : '') + esc(t) + '</span>';
const stt = (t, tone, pulse) => '<span class="state"><i class="dot ' + (tone || '') + (pulse ? ' pulse' : '') + '"></i>' + esc(t) + '</span>';
const btn = (label, act, a, o) => { o = o || {}; return '<button class="btn ' + (o.k || 'btn-gh') + (o.c ? ' ' + o.c : '') + '" data-act="' + act + '"' + (a != null ? ' data-a="' + esc(a) + '"' : '') + '>' + (o.i ? ic(o.i) : '') + (label ? esc(label) : '') + '</button>'; };
const tgl = (on, act, a, dis) => '<button class="tgl' + (on ? ' on' : '') + (dis ? ' dis' : '') + '" role="switch" aria-checked="' + !!on + '" data-act="' + act + '" data-a="' + esc(a) + '"></button>';
function field(label, inner, o) { o = o || {}; return '<div class="field' + (o.full ? ' full' : '') + '"><label class="lab">' + esc(label) + (o.req ? '<span class="req">*</span>' : '') + (o.opt ? '<span class="opt">可选</span>' : '') + '</label>' + inner + (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + (o.err ? '<div class="ferr">' + ic('warn') + esc(o.err) + '</div>' : '') + '</div>'; }
const inp = (v, o) => { o = o || {}; return '<input class="inp' + (o.err ? ' err' : '') + (o.ro ? ' ro' : '') + (o.mono ? ' mono' : '') + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(o.ph || '') + '"' + (o.ro ? ' readonly' : '') + (o.type ? ' type="' + o.type + '"' : '') + '>'; };
const slt = (opts, cur) => '<select class="slt inp">' + opts.map(o => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';
const banner = (tone, ico, body, acts) => '<div class="banner ' + tone + '">' + ic(ico) + '<div class="bd">' + body + '</div>' + (acts ? '<div class="act">' + acts + '</div>' : '') + '</div>';
const bar = (pct, tone) => '<div class="bar ' + (tone || '') + '"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';
const kpi = (label, val, o) => { o = o || {}; return '<div class="panel kpi' + (val === '—' ? ' empty-v' : '') + '"><div class="kl">' + (o.i ? ic(o.i) : '') + esc(label) + '</div><div class="kv2">' + val + (o.unit ? '<small>' + o.unit + '</small>' : '') + '</div>' + (o.d ? '<div class="kd ' + (o.dir || '') + '">' + (o.dir === 'up' ? '▲ ' : o.dir === 'dn' ? '▼ ' : '') + esc(o.d) + '</div>' : '') + '</div>'; };
const phead = (title, sub, acts, count) => '<div class="phead"><div style="min-width:0"><h1 class="ptitle">' + esc(title) + (count != null ? ' <span class="pcount">' + count + '</span>' : '') + '</h1>' + (sub ? '<p class="psub">' + esc(sub) + '</p>' : '') + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div>';
const ptabs = (tabs, cur, act) => '<div class="ptabs" role="tablist">' + tabs.map(t => '<button class="ptab' + (cur === t[0] ? ' on' : '') + '" role="tab" data-act="' + act + '" data-a="' + t[0] + '">' + esc(t[1]) + (t[2] != null ? '<span class="n">' + t[2] + '</span>' : '') + '</button>').join('') + '</div>';
const segs = (opts, cur, act) => '<div class="segs">' + opts.map(o => '<button class="seg' + (cur === o[0] ? ' on' : '') + '" data-act="' + act + '" data-a="' + o[0] + '">' + esc(o[1]) + (o[2] != null ? '<span class="n">' + o[2] + '</span>' : '') + '</button>').join('') + '</div>';
const kv = rows => '<dl class="kv">' + rows.map(r => '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd>').join('') + '</dl>';
const dgrp = (t, body) => '<section class="dgrp"><div class="dgrp-t">' + esc(t) + '</div>' + body + '</section>';
const code = (txt, copy) => '<div class="code">' + (copy ? '<button class="qbtn cp" data-act="toast" data-a="ok|已复制到剪贴板">' + ic('copy') + '</button>' : '') + esc(txt) + '</div>';
Object.assign(W.H, { pill, stt, btn, tgl, field, inp, slt, banner, bar, kpi, phead, ptabs, segs, kv, dgrp, code });

/* ═════ toast ═════ */
function toast(kind, text, o) {
  o = o || {}; const id = Math.random();
  S.toasts.push({ id, kind, text, undo: o.undo });
  render();
  setTimeout(() => { S.toasts = S.toasts.filter(t => t.id !== id); render(); }, o.ms || 3600);
}
W.H.toast = toast;
function toastsHTML() { const I = { ok: 'okc', bad: 'xc', warn: 'warn', info: 'info' }; return S.toasts.map(t => '<div class="toast">' + ic(I[t.kind] || 'info', 'ic-' + t.kind) + '<span>' + esc(t.text) + '</span>' + (t.undo ? '<button class="undo" data-act="toast" data-a="info|已撤销">撤销</button>' : '') + '</div>').join(''); }

/* ═════ charts ═════ */
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function lineChart(o) {
  const w = 640, h = o.h || 200, pl = 40, pr = 10, pt = 10, pb = 24, n = o.labels.length;
  let mx = 0; o.series.forEach(s => s.data.forEach(v => { if (v > mx) mx = v; })); mx = niceMax(mx || 1);
  const x = i => pl + (n === 1 ? (w - pl - pr) / 2 : i * (w - pl - pr) / (n - 1)), y = v => pt + (h - pt - pb) * (1 - v / mx);
  let g = '';
  for (let i = 0; i <= 4; i++) { const yy = pt + (h - pt - pb) * i / 4; g += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--line)" stroke-dasharray="' + (i === 4 ? '0' : '3 4') + '"/><text x="' + (pl - 6) + '" y="' + (yy + 3) + '" text-anchor="end">' + (o.yFmt || fmt)(mx * (4 - i) / 4) + '</text>'; }
  const step = Math.ceil(n / 8);
  o.labels.forEach((l, i) => { if (i % step === 0) g += '<text x="' + x(i) + '" y="' + (h - 6) + '" text-anchor="middle">' + esc(l) + '</text>'; });
  o.series.forEach(s => {
    const pts = s.data.map((v, i) => x(i) + ',' + y(v)).join(' ');
    if (o.area && o.series.length === 1) g += '<polygon points="' + x(0) + ',' + y(0) + ' ' + pts + ' ' + x(n - 1) + ',' + y(0) + '" fill="' + s.color + '" opacity=".1"/>';
    g += '<polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  });
  const bw = (w - pl - pr) / Math.max(n - 1, 1);
  o.labels.forEach((l, i) => { const tip = esc(l) + '<br>' + o.series.map(s => '<span style=\'color:' + s.color + '\'>●</span> ' + esc(s.name) + ' <b>' + (o.tipFmt || fmt)(s.data[i]) + '</b>').join('<br>'); g += '<rect x="' + (x(i) - bw / 2) + '" y="' + pt + '" width="' + bw + '" height="' + (h - pt - pb) + '" fill="transparent" data-tip="' + tip.replace(/"/g, '&quot;') + '"/>'; });
  return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || '趋势图') + '">' + g + '</svg>';
}
function barChart(o) {
  const w = 640, h = o.h || 200, pl = 40, pr = 10, pt = 10, pb = 24, n = o.labels.length, ss = o.series;
  let mx = 0; for (let i = 0; i < n; i++) { let t = 0; ss.forEach(s => t += s.data[i]); if (t > mx) mx = t; } mx = niceMax(mx || 1);
  const cw = (w - pl - pr) / n, bw = Math.min(cw * .62, 28), y = v => pt + (h - pt - pb) * (1 - v / mx);
  let g = '';
  for (let i = 0; i <= 4; i++) { const yy = pt + (h - pt - pb) * i / 4; g += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--line)" stroke-dasharray="' + (i === 4 ? '0' : '3 4') + '"/><text x="' + (pl - 6) + '" y="' + (yy + 3) + '" text-anchor="end">' + (o.yFmt || fmt)(mx * (4 - i) / 4) + '</text>'; }
  const step = Math.ceil(n / 10);
  for (let i = 0; i < n; i++) {
    const cx = pl + cw * i + cw / 2; let acc = 0;
    ss.forEach(s => { const v = s.data[i]; if (!v) return; const y0 = y(acc), y1 = y(acc + v); g += '<rect x="' + (cx - bw / 2) + '" y="' + y1 + '" width="' + bw + '" height="' + Math.max(y0 - y1, 1) + '" rx="2" fill="' + s.color + '"/>'; acc += v; });
    if (i % step === 0) g += '<text x="' + cx + '" y="' + (h - 6) + '" text-anchor="middle">' + esc(o.labels[i]) + '</text>';
    const tip = esc(o.labels[i]) + '<br>' + ss.map(s => '<span style=\'color:' + s.color + '\'>●</span> ' + esc(s.name) + ' <b>' + fmt(s.data[i]) + '</b>').join('<br>');
    g += '<rect x="' + (cx - cw / 2) + '" y="' + pt + '" width="' + cw + '" height="' + (h - pt - pb) + '" fill="transparent" data-tip="' + tip.replace(/"/g, '&quot;') + '"/>';
  }
  return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || '柱状图') + '">' + g + '</svg>';
}
function donut(items, o) {
  o = o || {}; const tot = items.reduce((a, b) => a + b.v, 0) || 1, R = 54, C = 2 * Math.PI * R; let off = 0, g = '';
  items.forEach(it => { const len = C * it.v / tot; g += '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + it.color + '" stroke-width="16" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 70 70)" data-tip="' + esc(it.name) + ' <b>' + fmt(it.v) + '</b> · ' + (it.v / tot * 100).toFixed(1) + '%"/>'; off += len; });
  return '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap"><svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="' + esc(o.label || '占比') + '"><circle cx="70" cy="70" r="' + R + '" fill="none" stroke="var(--chip)" stroke-width="16"/>' + g + '<text x="70" y="68" text-anchor="middle" style="font:700 20px var(--f);fill:var(--fg)">' + (o.center || fmt(tot)) + '</text><text x="70" y="84" text-anchor="middle" style="font:400 10px var(--m);fill:var(--fg4)">' + esc(o.sub || '合计') + '</text></svg><div style="display:flex;flex-direction:column;gap:9px;min-width:130px;flex:1">' + items.map(it => '<div style="display:flex;align-items:center;gap:8px;font:500 12px var(--f)"><i style="width:8px;height:8px;border-radius:2px;background:' + it.color + '"></i><span style="color:var(--fg2)">' + esc(it.name) + '</span><span class="mono" style="margin-left:auto;color:var(--fg3)">' + fmt(it.v) + '</span></div>').join('') + '</div></div>';
}
function hbars(items, o) {
  o = o || {}; const mx = Math.max.apply(null, items.map(i => i.v).concat(1));
  return '<div style="display:flex;flex-direction:column;gap:11px">' + items.map(it => '<div><div style="display:flex;justify-content:space-between;font:500 12px var(--f);margin-bottom:5px;gap:8px"><span class="trunc" style="color:var(--fg2)">' + esc(it.name) + '</span><span class="mono" style="color:var(--fg3);flex:none">' + (o.fmt ? o.fmt(it.v) : fmt(it.v)) + '</span></div>' + bar(it.v / mx * 100, it.tone) + '</div>').join('') + '</div>';
}
const legend = items => '<div class="legend">' + items.map(i => '<span><i style="background:' + i.color + '"></i>' + esc(i.name) + '</span>').join('') + '</div>';
function chartPanel(title, sub, body, acts) { return '<div class="panel"><div class="ph"><div><h3>' + esc(title) + '</h3>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div><div class="pad">' + body + '</div></div>'; }
Object.assign(W.H, { lineChart, barChart, donut, hbars, legend, chartPanel });

/* ═════ list page (generic) ═════ */
function T(id) { return S.tbl[id] || (S.tbl[id] = { q: '', f: {}, seg: '', page: 1, size: 20, sel: [], sk: '', sd: 1 }); }
W.H.T = T;
function rowsFor(o) {
  const t = T(o.id); let r = o.rows;
  if (o.segKey && t.seg) r = r.filter(x => x[o.segKey] === t.seg);
  (o.filters || []).forEach(f => { const v = t.f[f.k]; if (v) r = r.filter(x => f.fn ? f.fn(x, v) : x[f.k] === v); });
  if (t.q) { const q = t.q.toLowerCase(); r = r.filter(x => (o.searchKeys || []).some(k => String(x[k] == null ? '' : x[k]).toLowerCase().includes(q))); }
  if (t.sk) r = r.slice().sort((a, b) => (a[t.sk] > b[t.sk] ? 1 : a[t.sk] < b[t.sk] ? -1 : 0) * t.sd);
  return r;
}
function popHTML(o, f, t) {
  const cur = t.f[f.k];
  return '<div class="pop" data-keep><div class="pop-l">' + f.opts.map(op => { const on = cur === op[0]; return '<button class="pop-o' + (on ? ' on' : '') + '" data-act="setf" data-a="' + o.id + '|' + f.k + '|' + op[0] + '"><span class="ck">' + (on ? ic('check') : '') + '</span>' + esc(op[1]) + (op[2] != null ? '<span class="n">' + op[2] + '</span>' : '') + '</button>'; }).join('') + '</div>' + (cur ? '<div class="pop-f"><button class="lnkbtn" data-act="setf" data-a="' + o.id + '|' + f.k + '|">清除此筛选</button></div>' : '') + '</div>';
}
function pagerHTML(id, cur, pages) {
  const P2 = []; const add = n => P2.push(n);
  if (pages <= 7) for (let i = 1; i <= pages; i++) add(i); else { add(1); if (cur > 3) add('…'); for (let i = Math.max(2, cur - 1); i <= Math.min(pages - 1, cur + 1); i++) add(i); if (cur < pages - 2) add('…'); add(pages); }
  return '<nav class="pager" aria-label="分页"><button class="pg' + (cur <= 1 ? ' dis' : '') + '" data-act="pg" data-a="' + id + '|' + (cur - 1) + '" aria-label="上一页">' + ic('left') + '</button>' + P2.map(p => p === '…' ? '<span class="pg dis">…</span>' : '<button class="pg' + (p === cur ? ' on' : '') + '" data-act="pg" data-a="' + id + '|' + p + '">' + p + '</button>').join('') + '<button class="pg' + (cur >= pages ? ' dis' : '') + '" data-act="pg" data-a="' + id + '|' + (cur + 1) + '" aria-label="下一页">' + ic('right') + '</button></nav>';
}
function table(o) {
  const t = T(o.id), all = o.rows, rows = rowsFor(o), total = rows.length, size = t.size, pages = Math.max(1, Math.ceil(total / size));
  if (t.page > pages) t.page = pages;
  const slice = rows.slice((t.page - 1) * size, t.page * size);
  const sel = o.sel !== false, cols = o.cols;
  const tpl = (sel ? '20px ' : '') + cols.map((c, i) => { const w = c.w || 'minmax(0,1fr)'; return i === 0 ? w.replace('minmax(0,', 'minmax(var(--c0min,0px),') : w; }).join(' ') + (o.menu ? ' 44px' : '');
  const selIds = t.sel.filter(i => rows.some(r => r.id === i));
  const allOn = slice.length && slice.every(r => t.sel.includes(r.id));
  let h = '<div class="tbl" role="table"><div class="tr thead" role="row" style="grid-template-columns:' + tpl + '">' + (sel ? '<div class="th"><button class="cbx ' + (allOn ? 'on' : selIds.length ? 'part' : '') + '" data-act="selall" data-a="' + o.id + '" aria-label="全选本页">' + ic(selIds.length && !allOn ? 'x' : 'check') + '</button></div>' : '') + cols.map(c => '<div class="th' + (c.sk ? ' srt' : '') + '"' + (c.sk ? ' data-act="sort" data-a="' + o.id + '|' + c.sk + '"' : '') + '>' + esc(c.t) + (c.sk && t.sk === c.sk ? ic(t.sd > 0 ? 'up' : 'down') : '') + '</div>').join('') + (o.menu ? '<div></div>' : '') + '</div>';
  slice.forEach(r => {
    const on = t.sel.includes(r.id), mopen = S.menu === o.id + '|' + r.id;
    h += '<div class="tr trow' + (on ? ' sel' : '') + (mopen ? ' menuopen' : '') + '" role="row" style="grid-template-columns:' + tpl + '"' + (o.onRow ? ' data-act="' + o.onRow + '" data-a="' + esc(r.id) + '"' : '') + '>';
    if (sel) h += '<div class="td sel-c"><button class="cbx ' + (on ? 'on' : '') + '" data-act="sel" data-a="' + o.id + '|' + esc(r.id) + '" data-stop aria-label="选择">' + ic('check') + '</button></div>';
    cols.forEach((c, i) => { h += '<div class="td' + (i === 0 ? ' tmain' : '') + (c.hm ? ' hm' : '') + (c.r ? ' r' : '') + '" data-l="' + esc(c.t) + '">' + c.f(r) + '</div>'; });
    if (o.menu) h += '<div class="td act" style="position:relative" data-stop><div class="rowact"><button class="qbtn" data-act="menu" data-a="' + o.id + '|' + esc(r.id) + '" aria-label="更多操作">' + ic('more') + '</button></div>' + (mopen ? '<div class="menu" data-keep style="right:8px;top:36px">' + o.menu(r).map(m => m === '-' ? '<div class="msep"></div>' : '<button class="mi' + (m.bad ? ' bad' : '') + (m.dis ? ' dis' : '') + '" data-act="' + (m.act || 'toast') + '" data-a="' + esc(m.a == null ? 'info|' + m.t : m.a) + '">' + ic(m.i) + esc(m.t) + '</button>').join('') + '</div>' : '') + '</div>';
    h += '</div>';
  });
  h += '</div>';
  h += '<div class="tfoot"><span>共 <b>' + fmt(total) + '</b> 条' + (total !== all.length ? '（已从 ' + fmt(all.length) + ' 条中筛选）' : '') + (t.sel.length ? ' · 已选 <b>' + t.sel.length + '</b>' : '') + '</span>' + (pages > 1 ? pagerHTML(o.id, t.page, pages) : '') + '<span class="hm-s"><select class="sel" data-ch="size" data-a="' + o.id + '" aria-label="每页条数">' + [10, 20, 50, 100].map(n => '<option' + (n === size ? ' selected' : '') + ' value="' + n + '">' + n + ' 条/页</option>').join('') + '</select></span></div>';
  return h;
}
function listPage(o) {
  const t = T(o.id), all = o.rows, rows = rowsFor(o);
  const hasF = t.q || Object.values(t.f).some(Boolean) || t.seg;
  let tb = '<div class="toolbar">';
  if (o.segs) tb += '<div class="segs">' + [['', '全部', all.length]].concat(o.segs).map(s => '<button class="seg' + ((t.seg || '') === s[0] ? ' on' : '') + '" data-act="seg" data-a="' + o.id + '|' + s[0] + '">' + esc(s[1]) + (s[2] != null ? '<span class="n">' + s[2] + '</span>' : '') + '</button>').join('') + '</div>';
  tb += '<label class="search">' + ic('search') + '<input data-k="q-' + o.id + '" data-in="tq" data-a="' + o.id + '" value="' + esc(t.q) + '" placeholder="' + esc(o.ph || '搜索…') + '" aria-label="搜索">' + (t.q ? '<button class="clr" data-act="tclear" data-a="' + o.id + '" aria-label="清除搜索">' + ic('x') + '</button>' : '') + '</label>';
  (o.filters || []).forEach(f => {
    const v = t.f[f.k], lab = v ? (f.opts.find(x => x[0] === v) || [0, v])[1] : '';
    tb += '<div class="fwrapx"><button class="fchip' + (v ? ' set' : '') + '" data-act="pop" data-a="' + o.id + '|' + f.k + '" data-keep>' + (v ? '' : ic('plus')) + esc(f.label) + (v ? '：' + esc(lab) : '') + ic('down') + '</button>' + (S.pop === o.id + '|' + f.k ? popHTML(o, f, t) : '') + '</div>';
  });
  if (hasF) tb += '<button class="clearall" data-act="clearall" data-a="' + o.id + '">清除全部</button>';
  if (o.tools) tb += '<span style="margin-left:auto;display:flex;gap:6px">' + o.tools + '</span>';
  tb += '</div>';
  const selIds = t.sel;
  const bulk = (o.bulk && selIds.length) ? '<div class="bulkbar"><span class="selcount"><button class="qbtn" data-act="clearsel" data-a="' + o.id + '" aria-label="取消选择">' + ic('x') + '</button>已选 ' + selIds.length + ' 项</span><span class="bdiv"></span>' + o.bulk.map(b => '<button class="bbtn' + (b.bad ? ' warn' : '') + '" data-act="' + (b.act || 'bulk') + '" data-a="' + o.id + '|' + esc(b.t) + '|' + (b.bad ? 1 : 0) + '">' + ic(b.i) + esc(b.t) + '</button>').join('') + '</div>' : '';
  let body;
  if (S.status === 'loading') body = skeleton('list');
  else if (S.status === 'error') body = errorPanel();
  else if (S.status === 'denied') body = deniedPanel();
  else if (!all.length) body = emptyBlock(o.empty || { t: '暂无数据', ic: 'folder' });
  else if (!rows.length) body = emptyBlock({ ic: 'search', t: '没有符合条件的结果', d: t.q ? '没有找到包含「' + esc(t.q) + '」的记录。试试更短的关键词，或清除筛选。' : '当前筛选条件下没有记录。', btns: btn('清除全部筛选', 'clearall', o.id, { k: 'btn-gh' }) });
  else body = table(o);
  const showBars = S.status === 'ok' || S.status === 'offline';
  return (S.status === 'offline' ? offlineBar() : '') + (o.banner || '') + '<div class="panel clip">' + (showBars && all.length ? tb + bulk : '') + body + '</div>';
}
W.H.listPage = listPage; W.H.table = table;
ACT.setf = a => { const [id, k, v] = a.split('|'); const t = T(id); t.f[k] = v; t.page = 1; S.pop = null; };
ACT.pop = (a, el) => { S.pop = PREV.pop === a ? null : a; };
ACT.seg = a => { const [id, v] = a.split('|'); const t = T(id); t.seg = v; t.page = 1; t.sel = []; };
ACT.clearall = a => { const t = T(a); t.q = ''; t.f = {}; t.seg = ''; t.page = 1; };
ACT.tclear = a => { T(a).q = ''; };
ACT.pg = a => { const [id, p] = a.split('|'); T(id).page = +p; document.querySelectorAll('.scroll').forEach(s => s.scrollTop = 0); };
ACT.sort = a => { const [id, k] = a.split('|'); const t = T(id); if (t.sk === k) t.sd = -t.sd; else { t.sk = k; t.sd = 1; } };
ACT.sel = a => { const [id, rid] = a.split('|'); const t = T(id); const i = t.sel.indexOf(rid); if (i >= 0) t.sel.splice(i, 1); else t.sel.push(rid); };
ACT.selall = a => { const t = T(a), o = LISTS[a]; if (!o) return; const rows = rowsFor(o), sl = rows.slice((t.page - 1) * t.size, t.page * t.size).map(r => r.id); if (sl.every(i => t.sel.includes(i))) t.sel = t.sel.filter(i => !sl.includes(i)); else sl.forEach(i => { if (!t.sel.includes(i)) t.sel.push(i); }); };
ACT.clearsel = a => { T(a).sel = []; };
ACT.menu = a => { S.menu = PREV.menu === a ? null : a; };
const LISTS = {};
const _lp = listPage; W.H.listPage = function (o) { LISTS[o.id] = o; return _lp(o); };
INP.tq = (v, el) => { const t = T(el.dataset.a); t.q = v; t.page = 1; };
W.CH = { size: (v, el) => { const t = T(el.dataset.a); t.size = +v; t.page = 1; } };
ACT.bulk = a => { const [id, label, bad] = a.split('|'); const t = T(id); const n = t.sel.length; if (+bad) openConfirm({ tone: 'danger', ic: 'trash', title: label + ' ' + n + ' 项？', desc: '此操作将作用于所选的 <b>' + n + '</b> 项，其中可能包含被其他资源引用的项目；被引用的项目会被跳过并在结果中列出。', ok: label, then: '已' + label + ' ' + n + ' 项，其中 1 项因被引用已跳过', after: () => { t.sel = []; } }); else { t.sel = []; toast('ok', '已对 ' + n + ' 项执行「' + label + '」'); } };

/* ═════ drawer / dialog ═════ */
function openDrawer(kind, id, tab) { S.drawer = { kind, id, tab: tab || '' }; S.menu = null; S.pop = null; }
ACT.drawer = a => { const [k, id, tab] = a.split('|'); openDrawer(k, id, tab); };
ACT.dclose = () => { S.drawer = null; };
ACT.dtab = a => { if (S.drawer) S.drawer.tab = a; };
function openConfirm(d) { S.dialog = d; S.menu = null; }
W.H.openConfirm = openConfirm; W.H.openDrawer = openDrawer;
ACT.confirm = a => { openConfirm(JSON.parse(a)); };
ACT.dlg = a => { const d = S.dialog; S.dialog = null; if (a === 'ok' && d) { if (d.after) d.after(); if (d.then) toast(d.tone === 'danger' ? 'ok' : 'ok', d.then, { undo: d.undo }); if (d.go) go(d.go); } };
function drawerHTML() {
  const d = S.drawer; if (!d) return '';
  const def = DRAWERS[d.kind]; if (!def) return '';
  let r, body;
  try {
    r = def(d.id, d.tab || '');
    if (!d.tab && r.tabs) d.tab = r.tabs[0][0];
    body = r.body(d.tab || '');
  } catch (e) { S.drawer = null; return ''; }
  return '<div class="scrim" data-act="dclose"></div><aside class="drawer' + (r.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(r.title) + '"><div class="dhead"><div style="min-width:0;flex:1"><h2 class="dtitle">' + r.title + '</h2>' + (r.sub ? '<p class="dsub">' + r.sub + '</p>' : '') + '</div><button class="ibtn" data-act="dclose" aria-label="关闭">' + ic('x') + '</button></div>' +
    (r.tabs ? '<div class="dtabs" role="tablist">' + r.tabs.map(t => '<button class="dtab' + (d.tab === t[0] ? ' on' : '') + '" role="tab" data-act="dtab" data-a="' + t[0] + '">' + esc(t[1]) + (t[2] != null ? '<span class="n">' + t[2] + '</span>' : '') + '</button>').join('') + '</div>' : '') +
    '<div class="dbody">' + body + '</div>' + (r.foot ? '<div class="dfoot">' + r.foot + '</div>' : '') + '</aside>';
}
function dialogHTML() {
  const d = S.dialog; if (!d) return '';
  if (d.html && d.side) return '<div class="scrim" data-act="dlg" data-a="cancel"></div><aside class="drawer dlgdrawer' + (d.wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + (d.html.indexOf('dlg-h') < 0 ? '<div class="dlg-h"><h3>' + esc(d.title || '') + '</h3><button class="ibtn" style="margin-left:auto" data-act="dlg" data-a="cancel" aria-label="关闭">' + ic('x') + '</button></div>' : '') + d.html + '</aside>';
  if (d.html) return '<div class="scrim" data-act="dlg" data-a="cancel"></div><div class="dlg ' + (d.wide ? 'wide' : '') + '" role="dialog" aria-modal="true">' + d.html + '</div>';
  return '<div class="scrim" data-act="dlg" data-a="cancel"></div><div class="dlg" role="alertdialog" aria-modal="true"><div class="dlg-b"><div class="dlg-ic ' + (d.tone === 'warn' ? 'warn' : d.tone === 'acc' ? 'acc' : '') + '">' + ic(d.ic || 'warn') + '</div><h3 class="dlg-t">' + esc(d.title) + '</h3><p class="dlg-d">' + d.desc + '</p>' + (d.list ? '<div class="dlg-l">' + d.list + '</div>' : '') + (d.confirmText ? '<div class="field" style="margin-top:14px"><label class="lab">输入 <span class="mono">' + esc(d.confirmText) + '</span> 以确认</label><input class="inp" data-k="cfm" data-in="cfm" placeholder="' + esc(d.confirmText) + '"></div>' : '') + '</div><div class="dlg-f"><button class="btn btn-gh" data-act="dlg" data-a="cancel">取消</button><button class="btn ' + (d.tone === 'danger' ? 'btn-dn' : 'btn-pri') + (d.confirmText && (S.ui.cfm || '') !== d.confirmText ? ' dis' : '') + '" data-act="dlg" data-a="ok">' + esc(d.ok || '确认') + '</button></div></div>';
}
INP.cfm = v => { S.ui.cfm = v; };

/* ═════ shells ═════ */
const ASSISTANTS = [
  ['sourcelens-docs', 'SourceLens 产品文档助手', true], ['infra-ops', '基础设施运维助手', false], ['contract-review', '合同条款审阅', false],
  ['backend-code', '代码库问答 · backend-api', true], ['hr-policy', '人事制度问答', false], ['finance-q3', 'Q3 财务分析与预算执行情况复盘（长名称溢出测试）', false],
].map(a => ({ slug: a[0], name: a[1], pub: a[2] }));
function assistants() {
  const n = cnt({ few: 2, normal: 6, many: 48 });
  if (n <= 6) return ASSISTANTS.slice(0, n);
  const r = rng(5), out = ASSISTANTS.slice(); const pools = ['客服知识库', '销售话术', '研发规范', '安全合规', '运维手册', '财务报销', '采购流程', '产品需求', '测试用例', '法务审阅'];
  for (let i = 6; i < n; i++) out.push({ slug: 'asst-' + i, name: pick(r, pools) + ' #' + (i - 5), pub: r() > .6 });
  return out;
}
W.H.assistants = assistants;
W.H.aswPop = () => aswPop(assistants());
function sessions() {
  const n = cnt({ few: 3, normal: 14, many: 240 }), r = rng(11);
  const T2 = ['如何配置 GitLab 知识库同步', '节点离线后 Run 为什么一直排队', '帮我总结这份季度合同的风险点', 'Celery worker 重启后任务丢失排查', '为什么 MCP 校验失败', '生成 Q3 预算执行报告', '解释 deepagents 中间件装配顺序', 'SSO 登录回调 404 怎么处理', '对比两个版本的接口差异', '把这段日志里的异常归类'];
  return Array.from({ length: n }, (_, i) => ({ id: 's' + i, t: i === 3 ? '一个特别特别长的会话标题用来测试侧栏里的单行省略显示效果是否正常' : pick(r, T2) + (i > 9 ? ' (' + i + ')' : ''), age: i < 2 ? 12 + i * 80 : i < 5 ? 1500 + i * 200 : 1440 * (2 + i) / 2 }));
}
W.H.sessions = sessions;

const ADMIN_NAV = [
  ['助手(Assistant)管理', [['assistants', 'bot', '助手'], ['runs', 'activity', '问答历史'], ['eval', 'flask', '助手评估'], ['shares', 'share', 'QA 榜单审核'], ['envvars', 'key', '环境变量'], ['lenset', 'cpu', '全局配置']]],
  ['知识库管理', [['datasources', 'db', '知识库']]],
  ['插件管理', [['hub', 'spark', '能力市场'], ['connectors', 'key', '连接']]],
  ['租户管理', [['tenantinfo', 'layers', '租户信息'], ['users', 'users', '成员管理'], ['groups', 'layers', '组管理'], ['apikeys', 'key', 'API Key']]],
  ['大模型管理', [['llm-stats', 'chart', '使用统计'], ['llm-usage', 'list', '使用明细'], ['llm-config', 'key', '模型配置'], ['llm-data', 'clock', '定时任务']]],
  ['任务管理', [['task-stats', 'chart', '任务统计'], ['tasks', 'list', '任务列表'], ['task-set', 'sliders', '任务设置']]],
  ['通知管理', [['n-channels', 'send', '通知渠道'], ['a-rules', 'bell', '事件订阅'], ['a-events', 'list', '通知记录']]],
];
const NAV_PARENT = { 'eval-ds': 'eval', 'eval-report': 'eval', roles: 'users', 'n-stats': 'n-channels', 'n-records': 'n-channels', 'n-set': 'n-channels', 'a-msgs': 'a-rules' };
S.navTog = S.navTog || {};
ACT.navgrp = a => { const g = +a, cur = adminGroupOf(S.page) === g, now = S.navTog[g] !== undefined ? S.navTog[g] : cur; S.navTog[g] = !now; };
function adminGroupOf(p) { p = NAV_PARENT[p] || p; return ADMIN_NAV.findIndex(g => g[1].some(i => i[0] === p)); }
function adminNav() {
  const cur = NAV_PARENT[S.page] || S.page, curG = adminGroupOf(S.page), offline = cnt({ few: 1, normal: 3, many: 17 });
  return '<aside class="nav admin" aria-label="管理台导航"><div class="nav-brand"><span class="bmark"></span><span class="bname">SourceLens</span><span class="tagx">ADMIN</span></div><div class="nav-scroll">' +
    ADMIN_NAV.map((g, gi) => {
      const open = S.navTog[gi] !== undefined ? S.navTog[gi] : gi === curG;
      return '<button class="nav-sec nav-grp" aria-expanded="' + open + '" data-act="navgrp" data-a="' + gi + '" data-keep>' + g[0] + '<span class="chv' + (open ? ' o' : '') + '">' + ic('down') + '</span></button>' +
        (open ? g[1].map(i => '<button class="nav-i' + (cur === i[0] ? ' on' : '') + '" data-nav="' + i[0] + '">' + ic(i[1]) + i[2] + (i[0] === 'nodes' && offline ? '<span class="tail hot">' + offline + '</span>' : '') + (i[0] === 'shares' && S.scale !== 'empty' ? '<span class="tail">' + cnt({ few: 1, normal: 6, many: 99 }) + '</span>' : '') + '</button>').join('') : '');
    }).join('') +
    '</div><div class="nav-foot"><button class="nav-i" data-nav="chat" style="margin-bottom:6px">' + ic('back') + '返回工作台</button>' + userCard('admin') + '</div></aside><div class="nav-scrim" data-act="nav"></div>';
}
function userCard(kind) {
  return '<button class="nav-user" data-act="umenu" data-keep>' + av('张伟') + '<span class="nav-u"><b>张伟</b><span>' + esc(W.ZONES ? W.ZONES.userSub() : 'zhang.wei@acme.com') + '</span></span><span style="margin-left:auto;color:var(--nav-mute)">' + ic('more') + '</span></button>' +
    (S.userMenu ? '<div class="menu menu-up" data-keep><div class="mhead">' + av('张伟') + '<span class="mh-t"><b>张伟</b><small>zhang.wei@acme.com</small></span></div>' + (W.ZONES ? (W.ZONES.menuZones() ? W.ZONES.menuZones() + '<div class="msep"></div>' : '') : '') + '<button class="mi" data-nav="myshares">' + ic('share') + '我的分享</button><button class="mi" data-act="settings">' + ic('sliders') + '设置<span class="kb"><span class="pill acc mono" style="height:16px;font-size:9px">新</span></span></button><div class="msep"></div><button class="mi" data-act="appearance">' + ic('sun') + '外观</button><button class="mi bad" data-nav="login">' + ic('logout') + '退出登录</button></div>' : '');
}
function userNav() {
  const as = assistants(), cur = as[S.asw] || as[0], ss = sessions();
  const grp = [['今天', x => x.age < 1440], ['最近 7 天', x => x.age >= 1440 && x.age < 10080], ['更早', x => x.age >= 10080]];
  let list = '';
  if (!cur) list = '<div style="padding:18px 10px;font:400 12px/1.6 var(--f);color:var(--nav-mute);text-align:center">还没有可用的助手</div>';
  else if (!ss.length) list = '<div style="padding:22px 10px;font:400 12px/1.7 var(--f);color:var(--nav-mute);text-align:center">还没有对话<br>在右侧提出第一个问题吧</div>';
  else grp.forEach(g => { const it = ss.filter(g[1]); if (it.length) { list += '<div class="sesgrp">' + g[0] + '</div>' + it.slice(0, S.ui.sesAll ? 999 : 30).map((x, i) => '<button class="ses' + (S.page === 'chat' && x.id === (S.ui.ses || 's0') ? ' on' : '') + '" data-act="ses" data-a="' + x.id + '">' + ic('msg') + '<span>' + esc(x.t) + '</span></button>').join(''); } });
  if (ss.length > 30 && !S.ui.sesAll) list += '<button class="ses" data-act="sesall" style="color:var(--nav-mute)">' + ic('down') + '<span>显示全部 ' + ss.length + ' 个会话</span></button>';
  return '<aside class="nav" aria-label="工作台导航"><div class="nav-brand"><span class="bmark"></span><span class="bname">SourceLens</span></div><div class="nav-scroll">' +
    '<button class="nav-btn" data-act="newchat"' + (cur ? '' : ' disabled style="opacity:.4"') + '>' + ic('plus') + '新对话</button>' + (cur ? '<div class="sesscope" title="' + esc(cur.name) + '">' + ic('bot') + '<span>' + esc(cur.name) + '</span></div>' : '') + list +
    '</div><div class="nav-foot">' + userCard('user') + '</div></aside><div class="nav-scrim" data-act="nav"></div>';
}
function aswPop(as) {
  const q = (S.ui.aq || '').toLowerCase(), f = as.filter(a => !q || a.name.toLowerCase().includes(q));
  return '<div class="pop asw" data-keep>' + (as.length > 6 ? '<div style="padding:8px 8px 4px"><label class="search" style="max-width:none;flex:none;height:30px">' + ic('search') + '<input data-k="aq" data-in="aq" value="' + esc(S.ui.aq || '') + '" placeholder="搜索 ' + as.length + ' 个助手"></label></div>' : '') + '<div class="pop-l" style="max-height:300px">' + (f.length ? f.map(a => '<button class="pop-o' + (as.indexOf(a) === S.asw ? ' on' : '') + '" role="option" data-act="aswpick" data-a="' + as.indexOf(a) + '" style="height:auto;min-height:36px;padding:7px 8px;align-items:flex-start"><span class="ck">' + (as.indexOf(a) === S.asw ? ic('check') : '') + '</span><span style="min-width:0;flex:1;color:var(--fg)"><span class="trunc" style="white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.35">' + esc(a.name) + '</span></span>' + pill(a.pub ? '公开' : '私有', a.pub ? 'ok' : '') + '</button>').join('') : '<div style="padding:14px;font:400 12px var(--f);color:var(--fg4);text-align:center">没有匹配的助手</div>') + '</div></div>';
}
INP.aq = v => { S.ui.aq = v; };
ACT.asw = () => { S.pop = PREV.pop === 'asw' ? null : 'asw'; };
ACT.aswpick = a => { S.asw = +a; S.pop = null; S.ui.ses = 's0'; if (S.page !== 'chat') go('chat'); };
ACT.ses = a => { S.ui.ses = a; S.nav = false; if (S.page !== 'chat') go('chat'); };
ACT.sesall = () => { S.ui.sesAll = true; };
ACT.newchat = () => { S.ui.ses = null; S.nav = false; go('chat'); S.ui.fresh = true; };
ACT.umenu = () => { S.userMenu = !PREV.user; };
ACT.nav = () => { S.nav = !S.nav; };
ACT.appearance = () => { S.userMenu = false; S.ui.set = 'appearance'; S.dialog = { html: settingsHTML(), wide: true, isSettings: true }; };
ACT.setmode = a => { S.theme = a; applyTheme(); chromeKey = ''; S.dialog = { html: settingsHTML(), wide: true, isSettings: true }; emitSync(); };
ACT.settings = () => { S.userMenu = false; openSettings(); };

const NOTIFS = () => S.scale === 'empty' ? [] : [
  ['bad', 'xc', '节点 lens-node-03 已离线', '最近心跳 12 分钟前，2 个运行中的 Run 被挂起。', 4, true],
  ['warn', 'warn', 'GitLab 知识库「backend-api」同步失败', '凭证已过期，请更新 Personal Access Token。', 38, true],
  ['ok', 'okc', '知识库「产品文档」同步完成', '新增 12 个文件，更新 3 个，耗时 42 秒。', 130, false],
  ['info', 'info', '分享「Q3 预算复盘」待审核', '张伟 提交了一条公开分享，等待你的审核。', 300, false],
  ['warn', 'dollar', 'LLM 本月费用已达预算 82%', 'OpenAI gpt-5 本月累计 $1,640 / $2,000。', 1500, false],
].slice(0, S.scale === 'few' ? 2 : 5);
function notifPanel() {
  const ns = NOTIFS(), col = { bad: 'danger', warn: 'warn', ok: 'ok', info: 'info' };
  return '<div class="npanel" data-keep><div class="nh"><span class="nh-t">通知</span>' + (ns.length ? '<span class="pill acc">' + ns.filter(n => n[5]).length + ' 未读</span>' : '') + '<button class="btn btn-ln sm" style="margin-left:auto" data-act="toast" data-a="ok|已全部标为已读">全部已读</button></div>' + (ns.length ? '<div class="nlist">' + ns.map(n => '<div class="ni' + (n[5] ? ' unread' : '') + '"><div class="ni-ic" style="background:var(--' + col[n[0]] + '-soft);color:var(--' + col[n[0]] + ')">' + ic(n[1]) + '</div><div class="ni-b"><div class="ni-t">' + esc(n[2]) + '</div><div class="ni-d">' + esc(n[3]) + '</div><div class="ni-w">' + ago(n[4]) + '</div></div></div>').join('') + '</div><div style="padding:9px;text-align:center;border-top:1px solid var(--line)"><button class="btn btn-ln sm" data-nav="n-records">查看全部通知记录</button></div>' : emptyBlock({ sm: true, ic: 'bell', t: '没有新通知', d: '节点、同步、QA 榜单审核等事件会出现在这里。' })) + '</div>';
}
ACT.notif = () => { S.notif = !PREV.notif; };
function adminTop(def) {
  return '<header class="top"><button class="ibtn hamb" data-act="nav" aria-label="打开导航">' + ic('menu') + '</button><nav class="crumb" aria-label="面包屑"><span class="hm-s">' + esc(W.ZONES ? W.ZONES.crumbRoot() : '管理台') + '</span>' + ((W.ZONES ? W.ZONES.crumbGroup(def) : (def.grp2 || '')) ? '<span class="sep hm-s">/</span><span class="hm-s">' + esc(W.ZONES ? W.ZONES.crumbGroup(def) : (def.grp2 || '')) + '</span>' : '') + '<span class="sep hm-s">/</span><b>' + esc(def.title) + '</b></nav><span style="margin-left:auto"></span><button class="ibtn" data-act="notif" data-keep aria-label="通知">' + ic('bell') + (S.scale !== 'empty' ? '<i class="dotmark"></i>' : '') + '</button>' + (S.role === 'super' ? '' : '<button class="btn btn-gh sm hm-s" data-nav="chat">' + ic('back') + '工作台</button>') + '</header>';
}
function userTop(title, right, back) {
  return '<header class="top"><button class="ibtn hamb" data-act="nav" aria-label="打开导航">' + ic('menu') + '</button>' + (back ? '<button class="ibtn" data-nav="' + back + '" aria-label="返回">' + ic('back') + '</button>' : '') + '<nav class="crumb"><b>' + title + '</b></nav><span style="margin-left:auto"></span>' + (right || '') + '</header>';
}
W.H.userTop = userTop;

/* ═════ settings modal ═════ */
function openSettings() {
  S.ui.set = S.ui.set || 'account';
  S.dialog = { html: settingsHTML(), wide: true, isSettings: true };
}
function settingsHTML() {
  const tab = S.ui.set || 'account', tabs = [['account', 'user', '账号'], ['appearance', 'sun', '外观'], ['password', 'lock', '修改密码'], ['notify', 'bell', '回答通知'], ['agent', 'term', 'Agent 集成'], ['release', 'tag', '更新日志']];
  let b = '';
  if (tab === 'account') b = '<div style="display:flex;align-items:center;gap:14px">' + av('张伟', 'lg') + '<div><div style="font:700 15px var(--f)">张伟</div><div class="muted">zhang.wei@acme.com · 管理员</div></div><button class="btn btn-gh sm" style="margin-left:auto" data-act="toast" data-a="info|头像上传（演示）">更换头像</button></div><div class="fgrid">' + field('显示名称', inp('张伟')) + field('邮箱', inp('zhang.wei@acme.com', { ro: 1 }), { hint: '邮箱用于登录，不可修改' }) + field('语言', slt([['zh', '简体中文'], ['en', 'English']], 'zh')) + field('时区', slt([['sh', '(UTC+08:00) 上海'], ['utc', 'UTC']], 'sh')) + '</div><div class="setrow"><div class="sl"><b>Google 账号</b><span>已绑定 zhang.wei@gmail.com，可用于一键登录</span></div><div class="sr"><button class="btn btn-gh sm" data-act="toast" data-a="info|已解除绑定（演示）">解除绑定</button></div></div>';
  if (tab === 'appearance') b = '<p class="muted" style="margin:0">明暗模式</p><div style="display:flex;flex-direction:column;gap:10px">' + THEME_MODES.map(m => '<button class="optcard' + (S.theme === m[0] ? ' on' : '') + '" style="align-items:center;min-height:64px" data-act="setmode" data-a="' + m[0] + '"><span class="thumb' + (S.theme === m[0] ? ' acc' : '') + '" style="width:36px;height:36px">' + ic(m[2]) + '</span><span style="flex:1"><b>' + m[1] + '</b><span>' + m[3] + (m[0] === 'scheduled' ? ' · 20:00 至次日 07:00 使用深色外观。' : '') + '</span></span><span class="radio' + (S.theme === m[0] ? ' on' : '') + '"></span></button>').join('') + '</div>';
  if (tab === 'password') b = field('当前密码', inp('', { type: 'password', ph: '输入当前密码' })) + field('新密码', inp('', { type: 'password', ph: '至少 8 位，含字母和数字' }), { hint: '密码强度：<b>中</b>。加入符号或延长到 12 位会更安全。' }) + field('确认新密码', inp('', { type: 'password' })) + '<div><button class="btn btn-pri" data-act="toast" data-a="ok|密码已更新，其他设备将被登出">更新密码</button></div>';
  if (tab === 'notify') b = '<p class="muted" style="margin:0">长时间运行的回答完成后，通过以下方式提醒你。</p>' + [['浏览器通知', '回答完成且页面不在前台时弹出系统通知', 1], ['飞书消息', '通过已绑定的飞书账号接收', 0], ['邮件', '仅在回答耗时超过 5 分钟时发送', 0]].map((r, i) => '<div class="setrow"><div class="sl"><b>' + r[0] + '</b><span>' + r[1] + '</span></div><div class="sr">' + tgl(S.ui['sn' + i] != null ? S.ui['sn' + i] : r[2], 'sntgl', i) + '</div></div>').join('');
  if (tab === 'agent') b = banner('info', 'info', '将 SourceLens 助手接入你本地的 Agent（如 Claude Code），使用下方 Access Key 调用。') + field('Access Key', '<div class="inwrap"><input class="inp mono" value="ak_live_9f31••••••••c2a7" readonly><button class="qbtn eye" data-act="toast" data-a="ok|已复制">' + ic('copy') + '</button></div>') + field('接入命令', code('claude mcp add sourcelens \\\n  --url https://lens.acme.com/mcp \\\n  --key ak_live_9f31...c2a7', true)) + '<div><button class="btn btn-gh" data-act="confirm" data-a=\'{"tone":"danger","ic":"key","title":"重置 Access Key？","desc":"旧 Key 将立即失效，所有使用它的 Agent 需要更新配置。","ok":"重置","then":"Access Key 已重置"}\'>' + ic('refresh') + '重置 Key</button></div>';
  if (tab === 'release') b = ['v0.63.8|2026-11-07|断点续传托管知识库转换；单根目录自动展开', 'v0.63.7|2026-11-05|知识库文件并发上传（有界并发）；存储用量实测', 'v0.63.0|2026-10-29|蓝绿零停机部署上线；分享继承助手可见性'].map((r, i) => { const p = r.split('|'); return '<div class="tli"><span class="tdot ' + (i === 0 ? 'acc' : '') + '">' + ic('tag') + '</span><div><b>' + p[0] + (i === 0 ? ' ' + pill('新', 'acc') : '') + '</b><time>' + p[1] + '</time><br><span>' + p[2] + '</span></div></div>'; }).join('');
  return '<div class="dlg-h"><h3>设置</h3><button class="ibtn" style="margin-left:auto" data-act="dlg" data-a="cancel" aria-label="关闭">' + ic('x') + '</button></div><div class="setmodal"><nav class="setnav">' + tabs.map(t => '<button class="' + (tab === t[0] ? 'on' : '') + '" data-act="settab" data-a="' + t[0] + '">' + ic(t[1]) + t[2] + '</button>').join('') + '</nav><div class="setbody">' + b + '</div></div>';
}
ACT.settab = a => { S.ui.set = a; S.dialog = { html: settingsHTML(), wide: true, isSettings: true }; };
ACT.sntgl = a => { S.ui['sn' + a] = !(S.ui['sn' + a] != null ? S.ui['sn' + a] : a == 0); S.dialog = { html: settingsHTML(), wide: true, isSettings: true }; };
W.H.openSettings = openSettings;

/* ═════ app render ═════ */
let PREV = {};
const THEME_MODES = [['light', '浅色', 'sun', '始终使用明亮界面'], ['dark', '深色', 'moon', '始终使用深色界面'], ['system', '跟随系统', 'cpu', '自动匹配此设备设置'], ['scheduled', '按时间', 'clock', '根据时间自动切换外观']];
function resolveTheme(mode) {
  if (mode === 'scheduled') { const h = new Date().getHours(); return h >= 20 || h < 7 ? 'dark' : 'light'; }
  if (mode === 'system') return W.matchMedia && W.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return mode === 'dark' ? 'dark' : 'light';
}
const STYLES = [
  ['soft', '柔和圆润', '圆角、留白、浅蓝灰底；用户端、管理区与平台区统一风格', ['#f5f7fb', '#ffffff', '#4d6bfe']],
];
W.H.STYLES = STYLES;
function applyTheme() {
  const def = PMAP[S.page], adminPage = false;
  const dark = !adminPage && resolveTheme(S.theme) === 'dark';
  document.documentElement.classList.toggle('dk', dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-style', 'soft');
  W.__adminForcedLight = adminPage && resolveTheme(S.theme) === 'dark';
}
function setTheme(t) { S.theme = t; applyTheme(); chromeKey = ''; render(); emitSync(); }
function renderApp() {
  applyTheme();
  const def = PMAP[S.page] || PMAP['404'];
  const root = document.getElementById('root');
  const sc = root.querySelector('.scroll'); const st = sc ? sc.scrollTop : 0;
  const nv = root.querySelector('.nav-scroll'); const nvt = nv ? nv.scrollTop : 0;
  const ae = document.activeElement; const key = ae && ae.dataset && ae.dataset.k; const sel = ae && ae.selectionStart;
  let inner = '';
  try { inner = def.render(); } catch (e) { console.error(e); inner = '<div class="body"><div class="panel pad"><b>渲染出错：</b>' + esc(e.message) + '<pre style="white-space:pre-wrap;font:11px var(--m)">' + esc(e.stack) + '</pre></div></div>'; }
  let html;
  const lay = typeof def.layout === 'function' ? def.layout() : def.layout;
  if (W.ZONES && lay !== 'bare') html = W.ZONES.shell(def, inner, overlays);
  else if (lay === 'admin') html = '<div class="shell adm' + (S.nav ? ' navopen' : '') + '">' + adminNav() + '<div class="main">' + adminTop(def) + '<div class="scroll"><div class="body">' + inner + '</div></div></div>' + overlays() + '</div>';
  else if (lay === 'user') html = '<div class="shell' + (S.nav ? ' navopen' : '') + '">' + userNav() + '<div class="main">' + inner + '</div>' + overlays() + '</div>';
  else html = '<div class="shell bare"><div class="main">' + inner + '</div>' + overlays() + '</div>';
  root.innerHTML = html + '<div class="toasts" aria-live="polite">' + toastsHTML() + '</div>';
  const nsc = root.querySelector('.scroll'); if (nsc && PREVPAGE === S.page) nsc.scrollTop = st;
  const nnv = root.querySelector('.nav-scroll'); if (nnv && nvt) nnv.scrollTop = nvt;
  const fl = root.querySelector('.cflow'); if (fl && def.stick) fl.scrollTop = fl.scrollHeight;
  PREVPAGE = S.page;
  if (key) { const n = root.querySelector('[data-k="' + key + '"]'); if (n) { n.focus(); try { n.setSelectionRange(sel, sel); } catch (e) { } } }
  if (def.after) def.after();
}
let PREVPAGE = null;
function overlays() {
  return (S.drawer ? drawerHTML() : '') + (S.dialog ? dialogHTML() : '') + (S.notif ? '<div class="scrim" style="background:transparent;z-index:94" data-act="notif"></div>' + notifPanel() : '');
}
function render() {
  applyTheme();
  if (!EMBED) renderChrome();
  if (!EMBED && S.mode !== 'desktop') return;
  renderApp();
}
W.render = render;
function go(id) {
  if (!PMAP[id]) return;
  S.page = id; S.ui = {}; S.drawer = null; S.dialog = null; S.menu = null; S.pop = null; S.nav = false; S.userMenu = false; S.notif = false;
  location.hash = '#/' + id;
  if (PMAP[id].enter) PMAP[id].enter();
  render(); emitSync();
  document.querySelectorAll('.scroll').forEach(s => s.scrollTop = 0);
}
W.go = go;

/* ═════ events ═════ */
let tipEl;
document.addEventListener('click', e => {
  PREV = { pop: S.pop, menu: S.menu, user: S.userMenu, notif: S.notif };
  const inside = e.target.closest('.pop,.menu,.npanel,[data-keep]');
  if (!inside) { S.pop = null; S.menu = null; S.userMenu = false; }
  const stop = e.target.closest('[data-stop]');
  const a = e.target.closest('[data-act]');
  const nv = e.target.closest('[data-nav]');
  if (a && !(stop && a !== stop.closest('[data-act]') && a.classList.contains('trow') && stop.contains(e.target) && !e.target.closest('[data-act]').isSameNode(stop) && a.classList.contains('trow'))) {
    const act = a.dataset.act; if (stop && a.classList.contains('trow')) { /* click originated in stop area but matched row: ignore */ }
  }
  let target = e.target.closest('[data-act]');
  if (stop && target && target.classList.contains('trow')) target = null;
  if (target) {
    const f = ACT[target.dataset.act];
    if (target.dataset.act === 'toast') { const p = target.dataset.a.split('|'); toast(p[0], p[1]); return; }
    if (f) { const r = f(target.dataset.a, target, e); if (r !== false) { render(); emitSync(); } }
    return;
  }
  if (nv && !stop) { go(nv.dataset.nav); return; }
  if (PREV.pop !== S.pop || PREV.menu !== S.menu || PREV.user !== S.userMenu) render();
});
document.addEventListener('input', e => {
  const t = e.target; if (!t.dataset || !t.dataset.in) return;
  const f = INP[t.dataset.in]; if (f && f(t.value, t) !== false) render();
});
document.addEventListener('change', e => {
  const t = e.target; if (t.dataset && t.dataset.ch && W.CH[t.dataset.ch]) { W.CH[t.dataset.ch](t.value, t); render(); }
});
document.addEventListener('mouseover', e => {
  const t = e.target.closest && e.target.closest('[data-tip]'); if (!t) { if (tipEl) { tipEl.remove(); tipEl = null; } return; }
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); }
  tipEl.innerHTML = t.getAttribute('data-tip');
});
document.addEventListener('mousemove', e => { if (tipEl) { tipEl.style.left = Math.min(e.clientX + 14, innerWidth - tipEl.offsetWidth - 8) + 'px'; tipEl.style.top = (e.clientY + 14) + 'px'; } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (S.dialog) S.dialog = null; else if (S.drawer) S.drawer = null; else if (S.notif) S.notif = false; else { S.pop = null; S.menu = null; S.userMenu = false; } render(); }
});
ACT.retry = () => { S.status = 'loading'; render(); setTimeout(() => { S.status = 'ok'; toast('ok', '已重新加载'); emitSync(); }, 900); return false; };
ACT.status = a => { S.status = a; };

/* ═════ prototype chrome ═════ */
function emitSync() {
  const msg = { t: 'S', s: {} }; SYNC.forEach(k => msg.s[k] = S[k]);
  if (EMBED) { parent.postMessage({ t: 'nav', s: msg.s }, '*'); return; }
  document.querySelectorAll('iframe.pf').forEach(f => { try { f.contentWindow.postMessage(msg, '*'); } catch (e) { } });
}
W.addEventListener('message', e => {
  const d = e.data; if (!d || !d.t) return;
  if (d.t === 'S' && EMBED) { SYNC.forEach(k => { if (d.s[k] !== undefined) S[k] = d.s[k]; }); if (S.page !== PREVPAGE) { S.ui = {}; S.drawer = null; S.dialog = null; S.nav = false; } applyTheme(); renderApp(); }
  if (d.t === 'nav' && !EMBED) { SYNC.forEach(k => { if (d.s[k] !== undefined) S[k] = d.s[k]; }); applyTheme(); renderChrome(); emitSync(); }
  if (d.t === 'ready' && !EMBED) emitSync();
});
const SCALES = [['empty', '空'], ['few', '少量'], ['normal', '正常'], ['many', '海量']];
const STATUSES = [['ok', '正常'], ['loading', '加载中'], ['error', '加载失败'], ['denied', '无权限'], ['offline', '离线']];
let chromeKey = '';
function renderChrome() {
  const c = document.getElementById('chrome'); if (!c) return;
  const def = PMAP[S.page] || {};
  const groups = {}; PAGES.forEach(p => { (groups[p.grp] = groups[p.grp] || []).push(p); });
  const key = JSON.stringify([S.role, S.tenant, S.page, S.scale, S.status, S.scn[S.page], S.mode, S.notes, S.theme, S.style, document.documentElement.classList.contains('dk')]);
  if (key === chromeKey) return; chromeKey = key;
  c.innerHTML = '<div class="chrome-in"><div class="brand"><span class="bmark"></span><span class="bname">SourceLens</span><span class="btag">全站原型 v2</span></div>' +
    '<div class="cgrp2"><span class="clab">页面</span><select class="sel" id="selPage" aria-label="页面">' + Object.keys(groups).map(g => '<optgroup label="' + g + '">' + groups[g].map(p => '<option value="' + p.id + '"' + (p.id === S.page ? ' selected' : '') + '>' + p.title + '</option>').join('') + '</optgroup>').join('') + '</select></div>' +
    (W.ZONES ? '<div class="cgrp2"><span class="clab">角色</span><select class="sel" id="selRole" aria-label="角色">' + W.ZONES.ROLES.map(m => '<option value="' + m[0] + '"' + (S.role === m[0] ? ' selected' : '') + '>' + m[1] + '</option>').join('') + '</select></div>' : '') +
    '<div class="cgrp2"><span class="clab">数据量</span><div class="switch">' + SCALES.map(s => '<button class="sw' + (S.scale === s[0] ? ' on' : '') + '" data-cs="scale" data-a="' + s[0] + '">' + s[1] + '</button>').join('') + '</div></div>' +
    '<div class="cgrp2"><span class="clab">状态</span><select class="sel" id="selStatus" aria-label="加载状态">' + STATUSES.map(s => '<option value="' + s[0] + '"' + (S.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select></div>' +
    (def.scn && def.scn.length ? '<div class="cgrp2"><span class="clab">边界场景</span><select class="sel" id="selScn" aria-label="页面边界场景"><option value="">默认</option>' + def.scn.map(s => '<option value="' + s[0] + '"' + (S.scn[S.page] === s[0] ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select></div>' : '') +
    '<div class="cgrp2 grow"><div class="switch"><button class="sw' + (S.mode === 'desktop' ? ' on' : '') + '" data-cs="mode" data-a="desktop">' + ic('panel') + '桌面</button><button class="sw' + (S.mode === 'phone' ? ' on' : '') + '" data-cs="mode" data-a="phone">' + ic('phone') + '手机</button><button class="sw' + (S.mode === 'both' ? ' on' : '') + '" data-cs="mode" data-a="both">并排</button></div>' +
    '<div class="cgrp2"><span class="clab">明暗</span><select class="sel" id="selTheme" aria-label="主题模式">' + THEME_MODES.map(m => '<option value="' + m[0] + '"' + (S.theme === m[0] ? ' selected' : '') + '>' + m[1] + '</option>').join('') + '</select>' + (W.__adminForcedLight ? '<span class="pill warn" title="与原产品一致：后台管理页面始终浅色">后台固定浅色·经典</span>' : '') + '</div>' +
    '<button class="btn ' + (S.notes ? 'btn-pri' : 'btn-gh') + ' sm" data-cs="notes">' + ic('info') + '设计说明</button></div></div>' +
    (S.notes ? '<aside class="notes" role="complementary"><h4>' + ic('spark') + esc(def.title || '') + ' · 设计说明</h4>' + (def.scn ? '<div class="tagrow">' + def.scn.map(s => '<span class="pill acc">' + esc(s[1]) + '</span>').join('') + '</div>' : '') + '<ul>' + (def.notes || ['（本页暂无说明）']).map(n => '<li>' + md(n) + '</li>').join('') + '</ul></aside>' : '');
  document.documentElement.style.setProperty('--chrome-h', c.offsetHeight + 'px');
  renderFrames();
}
function renderFrames() {
  const st = document.getElementById('stage'), root = document.getElementById('root');
  const m = S.mode;
  if (st.dataset.m === m) return; st.dataset.m = m;
  if (m === 'desktop') { st.className = 'stage'; st.innerHTML = ''; st.appendChild(root); root.style.display = ''; renderApp(); return; }
  st.className = 'stage frames'; st.innerHTML = '';
  const base = location.pathname + '?embed=1';
  let h = '';
  if (m === 'both') h += '<div class="fwrap fl"><span class="fcap">桌面 · 响应式 ≥ 821px</span><iframe class="pf frame-d" src="' + base + '#/' + S.page + '" title="桌面预览"></iframe></div>';
  h += '<div class="fwrap"><span class="fcap">手机 · 390 × 800</span><iframe class="pf frame-p" src="' + base + '#/' + S.page + '" title="手机预览"></iframe></div>';
  st.innerHTML = h; root.style.display = 'none'; document.body.appendChild(root);
  st.querySelectorAll('iframe').forEach(f => f.addEventListener('load', () => setTimeout(emitSync, 50)));
}
if (!EMBED) {
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cs]'); if (!t) return;
    const k = t.dataset.cs, a = t.dataset.a;
    if (k === 'scale') { S.scale = a; S.tbl = {}; }
    if (k === 'mode') S.mode = a;
    if (k === 'notes') S.notes = !S.notes;
    chromeKey = ''; render(); emitSync();
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'selPage') go(e.target.value);
    if (e.target.id === 'selRole') W.ZONES.setRole(e.target.value);
    if (e.target.id === 'selTheme') setTheme(e.target.value);
    if (e.target.id === 'selStatus') { S.status = e.target.value; render(); emitSync(); }
    if (e.target.id === 'selScn') { S.scn[S.page] = e.target.value; S.ui = {}; chromeKey = ''; render(); emitSync(); }
  });
}

W.H.core = { userNav, userCard, adminTop, userTop, prev: () => PREV, refresh: () => { chromeKey = ''; render(); emitSync(); } };

/* ═════ boot ═════ */
W.boot = function () {
  const m = (location.hash || '').match(/#\/([\w-]+)/); if (m && PMAP[m[1]]) S.page = m[1];
  if (EMBED) { document.body.classList.add('embed'); document.getElementById('chrome').remove(); const stg = document.getElementById('stage'); stg.style.top = '0'; }
  applyTheme();
  if (W.matchMedia) W.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { applyTheme(); render(); });
  W.addEventListener('hashchange', () => { const m2 = (location.hash || '').match(/#\/([\w-]+)/); if (m2 && PMAP[m2[1]] && m2[1] !== S.page) { S.page = m2[1]; S.ui = {}; render(); emitSync(); } });
  renderChrome(); renderApp();
  if (EMBED) parent.postMessage({ t: 'ready' }, '*');
};
})();
