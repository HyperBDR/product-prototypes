/* 治理：租户管理概览 · 平台共享节点 */
(function () {
'use strict';
const { ic, esc, rng, pick, int, ago, fmt, page, scn, cnt, gate, pill, stt, btn, tgl, field, inp, slt, banner, bar, kv, dgrp, phead, empty, listPage, toast, openDrawer, kpi, segs } = H;
const CF = o => JSON.stringify(o);
function mi(i, t, o) { return Object.assign({ i, t }, o || {}); }
const TEN = [['Acme 科技', 'ok'], ['星河教育', 'ok'], ['云帆医疗', 'warn'], ['北辰能源', 'info'], ['远航物流', 'bad']];
const TEN_NOTE = { ok: '正常', warn: '额度告急', info: '待激活', bad: '已停用' };

/* ═════ 租户管理概览 ═════ */
const GSTEPS = [
  ['ds', 'db', '连接知识库', '接入 GitLab / 飞书 / 本地文件，让助手有资料可答', 'datasources', '去连接'],
  ['asst', 'bot', '创建第一个助手', '选择数据范围与模型，一分钟内可以开始提问', 'assistants', '去创建'],
  ['user', 'users', '邀请成员', '发出邀请，成员加入后即可在对话里使用助手', 'users', '去邀请'],
];
function doneCount() {
  const sc = scn();
  if (sc === 'new' || S.scale === 'empty') return 0;
  if (sc === 'done') return 3;
  return 1;
}
function setupLink() {
  const d = doneCount(); if (d >= GSTEPS.length) return '';
  return banner('info', 'bolt', '<b>初始配置还没完成</b>（已完成 ' + d + ' / ' + GSTEPS.length + ' 步：' + GSTEPS.map(x => x[2]).join(' → ') + '）。<a class="lnk" style="cursor:pointer;text-decoration:underline;font-weight:700" data-act="gonav" data-a="setup">去配置向导继续配置 ›</a>');
}
ACT.gonav = a => { go(a); return false; };

function todos() {
  const sc = scn(), many = sc === 'alerts' || S.scale === 'many', none = S.scale === 'empty' || sc === 'done' || sc === 'new';
  if (none) return [];
  const k = many ? 4 : 1;
  const l = [
    ['warn', 'warn', (2 * k) + ' 个知识库同步失败', '凭证已过期或仓库不可达，最近一次失败 38 分钟前', 'datasources'],
    ['info', 'share', (many ? 99 : 6) + ' 条分享待审核', '公开分享需要人工审核后才会上线', 'shares'],
    ['warn', 'bot', (2 * k) + ' 个助手需要处理', '使用的模型已下线或依赖的节点离线', 'assistants'],
  ];
  return l;
}
function todoList() {
  const l = todos();
  if (!l.length) return '<div class="panel"><div class="ph"><div><h3>待办</h3><div class="sub">需要你处理的事项</div></div></div>' + empty({ sm: true, ic: 'okc', tone: 'ok', t: doneCount() === 0 ? '暂时没有待办' : '一切正常', d: doneCount() === 0 ? '完成初始配置后，同步失败、节点离线、待审核等事项会出现在这里。' : '没有需要处理的事项。' }) + '</div>';
  return '<div class="panel"><div class="ph"><div><h3>待办</h3><div class="sub">按紧急程度排序，点击直达</div></div><span class="pill bad">' + l.length + ' 项</span></div><div class="todos">' + l.map(t => '<button class="todo" data-nav="' + t[4] + '"><span class="ti ' + t[0] + '">' + ic(t[1]) + '</span><span class="tx"><b>' + esc(t[2]) + '</b><small>' + esc(t[3]) + '</small></span>' + ic('right') + '</button>').join('') + '</div></div>';
}
function nodeSummary() {
  const none = S.scale === 'empty' || scn() === 'new';
  const n = cnt({ few: 2, normal: 16, many: 240 }), bad = cnt({ few: 1, normal: 3, many: 17 }), run = cnt({ few: 0, normal: 2, many: 12 });
  const rows = none ? [] : [['同步正常', 'okc', n, n - bad - run], ['同步中', 'refresh', n, run], ['同步异常', 'warn', n, bad]];
  return '<div class="panel"><div class="ph"><div><h3>知识库状态</h3><div class="sub">各知识库的同步情况</div></div><button class="btn btn-ln sm" data-nav="datasources">查看知识库</button></div>' + (rows.length ? '<div class="nsum">' + rows.map(r => '<div class="nrow"><span class="thumb">' + ic(r[1]) + '</span><span class="nt"><b>' + r[0] + '</b><small>' + r[3] + ' / ' + r[2] + ' 个</small></span><span class="nbar">' + bar(r[2] ? r[3] * 100 / r[2] : 0, r[0] === '同步异常' && r[3] ? 'warn' : '') + '</span></div>').join('') + '</div>' : empty({ sm: true, ic: 'db', t: '还没有知识库', d: '创建第一个知识库，让助手有资料可答。', btns: btn('新建知识库', 'gonav', 'datasources', { k: 'btn-pri', c: 'sm' }) })) + '</div>';
}
function activity() {
  const none = S.scale === 'empty' || scn() === 'new';
  const r = rng(77), who = ['张伟', '李娜', '王磊', '刘洋'];
  const ev = [['知识库「产品文档」同步完成', 'ok', 8], ['李娜 加入了租户', 'info', 35], ['助手「合同条款审阅」被停用', 'warn', 70], ['王磊 提交了一条公开分享', 'info', 130], ['知识库「客服工单」同步失败', 'bad', 190], ['张伟 创建了助手「客服知识库」', 'ok', 420]].slice(0, S.scale === 'few' ? 3 : 6);
  return '<div class="panel"><div class="ph"><div><h3>最近动态</h3><div class="sub">本租户内的关键事件</div></div></div>' + (none ? empty({ sm: true, ic: 'activity', t: '还没有动态', d: '知识库同步、成员加入、助手变更等事件会显示在这里。' }) : '<div class="acts2">' + ev.map(e => '<div class="act2"><i class="dot ' + e[1] + '"></i><span>' + esc(e[0]) + '</span><small>' + ago(e[2]) + '</small></div>').join('') + '</div>') + '</div>';
}
page({
  id: 'overview', grp: '管理 · 概览', title: '管理概览', layout: 'admin', grp2: '概览',
  scn: [['new', '新租户 · 全空，配置未完成'], ['done', '配置完成 · 一切正常'], ['alerts', '大量待办与告警']],
  notes: ['**概览专注于租户级别的信息统计**：成员、助手、知识库、提问量等统计，加上待办、知识库状态和最近动态。**不再放“继续完成初始配置”的引导区**，初始配置统一到「配置向导」页。', '**只保留一个醒目的引导链接**：初始配置没完成时，顶部一条提示“去配置向导继续配置 ›”，点击跳到配置向导；全部完成后这条提示消失。', '**待办直达**：每条待办带影响面（影响多少助手 / Run），点击进入对应页面；没有待办时显示“一切正常”，不留空白。', '**不显示额度 / 计量**：额度功能尚未上线，先不占位。'],
  render() {
    const none = S.scale === 'empty' || scn() === 'new';
    return phead('管理概览', (proxy => proxy ? '代管中 · ' + window.ZONES.tname() : '欢迎回来，张伟 · ' + window.ZONES.tname())(S.role === 'super' && S.tenant !== 0), '') + gate(() => setupLink() +
      '<div class="kpis c4">' + kpi('成员', none ? '0' : fmt(cnt({ few: 4, normal: 128, many: 3420 })), { i: 'users' }) + kpi('助手', none ? '0' : fmt(cnt({ few: 2, normal: 12, many: 186 })), { i: 'bot' }) + kpi('知识库', none ? '0' : fmt(cnt({ few: 2, normal: 16, many: 240 })), { i: 'db' }) + kpi('近 7 天提问', none ? '—' : fmt(cnt({ few: 38, normal: 3412, many: 86400 })), { i: 'msg', d: none ? '' : '+8.2%', dir: 'up' }) + '</div>' +
      '<div class="grid2">' + todoList() + nodeSummary() + '</div><div class="grid2">' + (none ? '<div class="panel"><div class="ph"><div><h3>近 7 天提问</h3></div></div>' + empty({ sm: true, ic: 'chart', t: '暂无数据', d: '有人提问后，这里会显示趋势。' }) + '</div>' : H.chartPanel('近 7 天提问', '按天统计', H.barChart({ labels: ['周二', '周三', '周四', '周五', '周六', '周日', '周一'], series: [{ name: '提问', color: 'var(--c1)', data: [420, 510, 488, 530, 190, 142, 520].map(v => S.scale === 'few' ? Math.round(v / 90) : S.scale === 'many' ? v * 25 : v) }], h: 190 })) ) + activity() + '</div>' + H.metricsPanel('tenant'), 'cards');
  },
});

/* ═════ 平台 · 共享节点 ═════ */
const MODE = { all: ['全部租户', 'ok'], deny: ['全部，排除 ', 'warn'], allow: ['仅指定租户', 'acc'] };
function snRows() {
  const n = cnt({ few: 2, normal: 6, many: 36 }), r = rng(91);
  return Array.from({ length: n }, (_, i) => {
    const mode = i % 3 === 0 ? 'all' : i % 3 === 1 ? 'allow' : 'deny';
    const st = i === 2 ? 'offline' : i === 4 ? 'error' : 'online';
    const list = mode === 'allow' ? (i % 2 ? [0, 1] : [1, 2, 3]) : mode === 'deny' ? [4] : [];
    return { id: 's' + i, name: 'shared-node-' + String(i + 1).padStart(2, '0'), where: pick(r, ['阿里云 cn-hangzhou', 'AWS ap-east-1', '总部机房 A1']), st, mode, list, ver: i === 3 ? '0.62.1' : '0.63.8', run: st === 'online' ? int(r, 0, 9) : 0, q: st === 'online' ? int(r, 0, 5) : 0, asst: int(r, 2, 14), cap: i % 3 === 0 ? 0 : 6, hb: st === 'online' ? int(r, 0, 1) : 40 + int(r, 10, 400) };
  });
}
const NST2 = { online: ['在线', 'ok'], offline: ['离线', 'bad'], error: ['异常', 'bad'] };
function visText(x) {
  if (x.mode === 'all') return '全部租户';
  if (x.mode === 'deny') return '全部，排除 ' + x.list.length + ' 个';
  return x.list.length ? '仅 ' + x.list.length + ' 个租户' : '无租户可见';
}
page({
  id: 'shared-nodes', grp: '平台 · 节点管理', title: '节点', layout: 'admin', grp2: '节点管理',
  scn: [['revoke', '移出租户 · 影响面预览'], ['empty-allow', '白名单为空（无租户可见）'], ['offline', '节点下线 · 多租户受影响']],
  notes: ['**所有节点都由平台管理、默认共享**：由超管注册与运维；租户只能使用（绑定助手），不能编辑、重启、删除，也看不到节点管理。没有“租户私有节点”这个概念，所以不再有单独的“全部节点”页。节点相关的全局设置（对外访问地址、镜像、健康检查等）在「节点设置」。', '**可见范围二选一**：「仅指定租户」（白名单）或「全部租户，排除…」（黑名单）。在同一个开关里切换，避免两套规则冲突。', '**移出租户有影响面预览**：取消某租户的可见权限前，列出该租户绑定了此节点的助手 / 运行中 Run，并可选过渡期（立即 / 7 天 / 30 天）。', '**每租户并发上限（可选）**：防止一个租户占满共享节点；默认不限制，由超管打开。', '**多租户隔离**：同一节点上各租户的 Run 与工作区互相隔离，租户之间看不到彼此。'],
  render() {
    const rows = snRows(), off = rows.filter(x => x.st !== 'online');
    if (scn() === 'revoke' && !S.ui.auto) { S.ui.auto = 1; S.ui.vm = 'allow'; S.ui.vt = [1]; S.drawer = { kind: 'snode', id: 's1', tab: 'vis' }; }
    if (scn() === 'empty-allow' && !S.ui.auto) { S.ui.auto = 1; S.ui.vm = 'allow'; S.ui.vt = []; S.drawer = { kind: 'snode', id: 's1', tab: 'vis' }; }
    const ban = scn() === 'offline' || off.length ? banner('bad', 'wifioff', '<b>' + off.length + ' 个共享节点离线或异常</b>，共影响 ' + Math.min(4, TEN.length) + ' 个租户的 ' + off.length * 5 + ' 个助手。', '<button class="btn btn-gh sm" data-act="seg" data-a="snodes|offline">只看异常</button>') : '';
    return phead('节点', '平台统一管理的 LensNode：默认对租户共享，可设置哪些租户可见；节点相关的全局设置在「节点设置」', btn('新建节点', 'snnew', null, { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + gate(() => listPage({
      id: 'snodes', rows, bulk: [{ i: 'refresh', t: '重启' }, { i: 'trash', t: '下线', bad: 1 }], banner: ban, ph: '搜索节点名称', searchKeys: ['name', 'where'], segs: [['online', '在线', rows.filter(x => x.st === 'online').length], ['offline', '离线', rows.filter(x => x.st === 'offline').length], ['error', '异常', rows.filter(x => x.st === 'error').length]], segKey: 'st', filters: [{ k: 'mode', label: '可见范围', opts: [['all', '全部租户'], ['deny', '全部，排除…'], ['allow', '仅指定租户']] }],
      cols: [{ t: '节点', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb acc">' + ic('shield') + '</span><div class="cname"><span class="nm">' + x.name + '</span><span class="slug">' + x.where + '</span></div></div>' }, { t: '运行状态', w: '110px', f: x => stt(NST2[x.st][0], NST2[x.st][1]) }, { t: '可见范围', w: '170px', f: x => pill(MODE[x.mode][0].trim(), MODE[x.mode][1]) + ' <span class="muted">' + (x.mode === 'all' ? '' : x.list.length + ' 个租户') + '</span>' }, { t: '使用中', w: '110px', hm: 1, f: x => '<span class="mono2">' + x.asst + ' 个助手</span>' }, { t: '运行中 / 排队', w: '110px', hm: 1, f: x => '<span class="mono2">' + x.run + ' / ' + x.q + '</span>' }, { t: '每租户并发', w: '100px', hm: 1, f: x => '<span class="mono2">' + (x.cap ? '≤ ' + x.cap : '不限') + '</span>' }, { t: '版本', w: '90px', f: x => '<span class="mono2">' + x.ver + '</span>' + (x.ver !== '0.63.8' ? ' ' + pill('落后', 'warn') : '') }],
      onRow: 'drawer_snode', menu: x => [mi('eye', '查看详情', { act: 'drawer_snode', a: x.id }), mi('shield', '设置可见范围', { act: 'drawer_snodevis', a: x.id }), mi('refresh', '重启节点'), '-', mi('trash', '下线共享节点', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'trash', title: '下线 ' + x.name + '？', desc: '将影响 <b>' + Math.min(4, x.list.length || 4) + '</b> 个租户的 <b>' + x.asst + '</b> 个助手，<b>' + x.run + '</b> 个运行中的 Run 将被中止。', ok: '下线节点', then: '已下线 ' + x.name }) })],
      empty: { ic: 'shield', t: '还没有节点', d: '节点由平台统一运维，可开放给全部租户或指定租户使用。', btns: btn('新建节点', 'snnew', null, { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
});
ACT.drawer_snode = a => { const x = snRows().find(r => r.id === a) || snRows()[0]; S.ui.vm = x.mode === 'all' ? 'deny' : x.mode; S.ui.vt = x.mode === 'all' ? [] : x.list.slice(); openDrawer('snode', a); };
ACT.drawer_snodevis = a => { ACT.drawer_snode(a); S.drawer.tab = 'vis'; };
ACT.snnew = () => { S.ui.auto = 1; S.drawer = { kind: 'nenroll', id: '', tab: '' }; };
ACT.vmode = a => { S.ui.vm = a; };
ACT.vtog = a => { const t = (S.ui.vt || []).slice(), i = t.indexOf(+a); if (i >= 0) t.splice(i, 1); else t.push(+a); S.ui.vt = t; };
ACT.vsave = () => {
  const x = snRows().find(r => r.id === S.drawer.id) || snRows()[0];
  const prev = x.mode === 'all' ? TEN.map((_, i) => i).filter(i => TEN[i][1] !== 'bad') : x.mode === 'deny' ? TEN.map((_, i) => i).filter(i => x.list.indexOf(i) < 0 && TEN[i][1] !== 'bad') : x.list;
  const cur = visibleSet();
  const lost = prev.filter(i => cur.indexOf(i) < 0);
  if (lost.length) { S.dialog = { tone: 'danger', ic: 'warn', title: '确认移出 ' + lost.length + ' 个租户？', desc: '<b>' + lost.map(i => TEN[i][0]).join('、') + '</b> 将不能再使用 ' + x.name + '。它们共绑定 <b>' + lost.length * 3 + '</b> 个助手、<b>' + lost.length * 2 + '</b> 个运行中的 Run；按所选过渡期，期间助手仍可用，期满后失效。', ok: '确认移出', then: '可见范围已更新，已通知相关租户管理员', after: () => { S.drawer = null; } }; return; }
  S.drawer = null; toast('ok', '可见范围已更新');
};
function visibleSet() {
  const t = S.ui.vt || [];
  return S.ui.vm === 'allow' ? t : TEN.map((_, i) => i).filter(i => t.indexOf(i) < 0 && TEN[i][1] !== 'bad');
}
DRAWERS.snode = (id, tab) => {
  const x = snRows().find(r => r.id === id) || snRows()[0];
  return { title: x.name, sub: x.where + ' · 共享节点', tabs: [['ov', '概览'], ['vis', '可见范围'], ['use', '租户使用情况', TEN.length - 1]], wide: true, body: t => {
    if (t === 'use') return dgrp('各租户使用情况', '<div class="trow2 th2"><span>租户</span><span>绑定助手</span><span>运行中 / 排队</span></div>' + TEN.slice(0, 4).map((n, i) => '<div class="trow2"><span><b>' + n[0] + '</b></span><span class="mono2">' + (i + 1) * 2 + '</span><span class="mono2">' + (i % 3) + ' / ' + (i % 2) + '</span></div>').join('') + '<p class="hint" style="margin-top:8px">平台只看到数量，看不到任何租户的对话内容或数据。</p>');
    if (t === 'vis') {
      const mode = S.ui.vm || 'allow', sel = S.ui.vt || [], cur = visibleSet();
      const prev = x.mode === 'all' ? TEN.map((_, i) => i).filter(i => TEN[i][1] !== 'bad') : x.mode === 'deny' ? TEN.map((_, i) => i).filter(i => x.list.indexOf(i) < 0 && TEN[i][1] !== 'bad') : x.list;
      const lost = prev.filter(i => cur.indexOf(i) < 0);
      return segs([['allow', '仅指定租户（白名单）'], ['deny', '全部租户，排除…（黑名单）']], mode, 'vmode') +
        '<p class="hint" style="margin:10px 0 6px">' + (mode === 'allow' ? '勾选的租户可以看到并使用此节点；未勾选的看不到。' : '勾选的租户不能使用此节点；其他租户都可以。') + '</p>' +
        '<div class="vlist">' + TEN.map((n, i) => '<button class="vrow' + (sel.indexOf(i) >= 0 ? ' on' : '') + (n[1] === 'bad' ? ' dis' : '') + '" data-act="vtog" data-a="' + i + '"><span class="cbx' + (sel.indexOf(i) >= 0 ? ' on' : '') + '">' + (sel.indexOf(i) >= 0 ? ic('check') : '') + '</span><span class="vt"><b>' + n[0] + '</b><small>' + TEN_NOTE[n[1]] + (n[1] === 'bad' ? ' · 不会生效' : '') + '</small></span>' + (cur.indexOf(i) >= 0 ? '<span class="pill ok">可见</span>' : '<span class="pill">不可见</span>') + '</button>').join('') + '</div>' +
        (mode === 'allow' && !sel.length ? banner('warn', 'warn', '<b>当前没有任何租户可见此节点</b>。保存后，所有租户都无法使用它。') : '') +
        (lost.length ? banner('warn', 'warn', '<b>将移出 ' + lost.length + ' 个租户</b>：' + lost.map(i => TEN[i][0]).join('、') + '。它们绑定了此节点的助手（约 ' + lost.length * 3 + ' 个）与运行中 Run（' + lost.length * 2 + ' 个）会受影响。<div style="margin-top:8px;max-width:260px">' + field('过渡期', slt([['0', '立即生效'], ['7', '7 天（默认）'], ['30', '30 天']], '7')) + '</div>') : '') +
        dgrp('每租户并发上限', '<div class="setrow"><div class="sl"><b>限制单个租户的最大并发 Run</b><small>防止一个租户占满节点；默认不限制</small></div>' + tgl(!!x.cap, 'toast', 'info|已切换') + '</div>' + (x.cap ? '<div style="max-width:200px">' + field('每租户并发上限', inp(String(x.cap), { mono: 1 })) + '</div>' : ''));
    }
    return (x.st !== 'online' ? banner('bad', 'wifioff', '<b>节点' + NST2[x.st][0] + '</b> · 最近心跳 ' + ago(x.hb) + '。正在使用它的租户助手将失败或排队。', btn('重启', 'toast', 'info|已下发重启指令', { c: 'sm' })) : '') + dgrp('状态', kv([['运行状态', stt(NST2[x.st][0], NST2[x.st][1])], ['可见范围', visText(x)], ['运行时版本', '<span class="mono">' + x.ver + '</span>'], ['运行中 / 排队', x.run + ' / ' + x.q], ['最近心跳', ago(x.hb)]])) + dgrp('近 1 小时负载', H.lineChart({ labels: Array.from({ length: 12 }, (_, i) => i * 5 + 'm'), series: [{ name: '运行中 Run', color: 'var(--c1)', data: Array.from({ length: 12 }, (_, i) => (i * 3 + x.run) % 9) }], h: 140, area: 1 }));
  }, foot: tab === 'vis' || (S.drawer && S.drawer.tab === 'vis') ? btn('保存', 'vsave', null, { k: 'btn-pri' }) + btn('取消', 'dclose') : btn('关闭', 'dclose') };
};

/* ═════ 平台 · 全局概览（只看统计）═════ */
page({
  id: 'p-overview', grp: '平台 · 全局概览', title: '全局概览', layout: 'admin', grp2: '',
  scn: [['alerts', '平台告警与待办'], ['quiet', '一切正常']],
  notes: ['**超管看统计，不看细节**：这里只有租户级、平台级的汇总——租户数、活跃度、提问量、模型用量、共享节点负载；看不到任何租户的助手详情、Run 状态或对话内容。', '**要处理具体租户的事 → 代管**：点租户进入“代管模式”，在租户里帮它配置；这里不放助手创建与 问答历史。', '**待办聚焦平台自己的事**：共享节点离线、通知发送失败、待激活租户长期未登录、官方内容待发布。', '**模型只看统计**：模型用量按模型与租户汇总，不展示逐条调用明细。'],
  render() {
    const none = S.scale === 'empty', sc = scn();
    const k = none ? ['0', '0', '0', '—', '0 / 0'] : [fmt(cnt({ few: 3, normal: 8, many: 126 })), fmt(cnt({ few: 842, normal: 1264, many: 48210 })), fmt(cnt({ few: 3800, normal: 21860, many: 1286000 })), '$' + fmt(cnt({ few: 120, normal: 3480, many: 86400 })), cnt({ few: 1, normal: 5, many: 22 }) + ' / ' + cnt({ few: 2, normal: 6, many: 24 })];
    const todos = none || sc === 'quiet' ? [] : [['bad', 'wifioff', '1 个共享节点离线', '影响 2 个租户的 ' + 6 + ' 个助手', 'shared-nodes'], ['warn', 'send', '通知发送失败 5 次', '飞书渠道返回 502，最近一次 11 分钟前', 'n-records'], ['info', 'clock', '北辰能源 待激活 9 天', '管理员尚未登录，可重发邀请', 'tenants']].concat(sc === 'alerts' ? [['warn', 'spark', '官方技能「SQL 生成」草稿待发布', '已草稿 2 天，尚未对租户可见', 'catalog-skill']] : []);
    const top = [['星河教育', 8420], ['Acme 科技', 3412], ['云帆医疗', 980], ['北辰能源', 0], ['远航物流', 0]].map(x => ({ name: x[0], v: S.scale === 'many' ? x[1] * 14 : S.scale === 'few' ? Math.round(x[1] / 40) : x[1] }));
    return phead('全局概览', '平台与各租户的汇总统计 · 不含任何租户的对话与成员明细', '') + H.dataNote('提问、Token、模型费用、节点在线等指标来自生产后端现有数据（Run / LLMUsage / LensNode），现在就能统计；<b>租户数、租户活跃度排名这类“按租户”的数字依赖多租户化</b>（后端目前没有租户字段）。完整口径见页面底部。') + gate(() =>
      '<div class="kpis c5">' + kpi('租户', k[0], { i: 'layers' }) + kpi('近 7 天提问', k[1], { i: 'msg', d: none ? '' : '+8.2%', dir: 'up' }) + kpi('近 7 天 Token', k[2], { i: 'bolt' }) + kpi('模型费用 (USD)', k[3], { i: 'chart' }) + kpi('共享节点在线', k[4], { i: 'server' }) + '</div>' +
      '<div class="grid2">' + H.chartPanel('近 30 天提问（全平台）', '按天汇总', none ? empty({ sm: true, ic: 'chart', t: '暂无数据', d: '租户产生提问后，这里会显示趋势。' }) : H.barChart({ labels: Array.from({ length: 14 }, (_, i) => String(i + 1)), series: [{ name: '提问', color: 'var(--c1)', data: Array.from({ length: 14 }, (_, i) => 300 + ((i * 97) % 220) + i * 12) }], h: 190 })) +
      '<div class="panel"><div class="ph"><div><h3>租户活跃度 Top 5</h3><div class="sub">近 7 天提问数</div></div><button class="btn btn-ln sm" data-act="navto" data-a="platform|tenants">全部租户</button></div><div style="padding:6px 16px 16px">' + (none ? empty({ sm: true, ic: 'layers', t: '还没有租户', d: '创建第一个租户后，这里会显示活跃度排名。', btns: btn('创建租户', 'tnew', null, { k: 'btn-pri', c: 'sm' }) }) : H.hbars(top, {})) + '</div></div></div>' +
      '<div class="grid2">' + (todos.length || none ? '' : '') + '<div class="panel"><div class="ph"><div><h3>平台待办</h3><div class="sub">只列平台自己要处理的事</div></div>' + (todos.length ? '<span class="pill bad">' + todos.length + ' 项</span>' : '') + '</div>' + (todos.length ? '<div class="todos">' + todos.map(t => '<button class="todo" data-act="navto" data-a="platform|' + t[4] + '"><span class="ti ' + t[0] + '">' + ic(t[1]) + '</span><span class="tx"><b>' + esc(t[2]) + '</b><small>' + esc(t[3]) + '</small></span>' + ic('right') + '</button>').join('') + '</div>' : empty({ sm: true, ic: 'okc', tone: 'ok', t: '一切正常', d: '没有需要平台处理的事项。' })) + '</div>' +
      H.chartPanel('模型用量分布', '按模型汇总 Token（不含明细）', none ? empty({ sm: true, ic: 'chart', t: '暂无用量', d: '' }) : H.donut([{ name: 'claude-sonnet-5-5', v: 8200, color: 'var(--c1)' }, { name: 'gpt-5', v: 5200, color: 'var(--c2)' }, { name: 'qwen3-max', v: 2400, color: 'var(--c3)' }, { name: '其他', v: 1100, color: 'var(--c6)' }], { label: '模型占比' })) + '</div>' + H.metricsPanel('platform'), 'cards');
  },
});

/* ═════ 平台 · 租户与代管 ═════ */
const TN = [['Acme 科技', 'ok', 128, 12, 16, 3412, 3, 3, 'zhang.wei@acme.com'], ['星河教育', 'ok', 342, 31, 40, 8420, 5, 2, 'admin@xinghe.edu'], ['云帆医疗', 'ok', 57, 6, 8, 980, 1, 3, 'it@yunfan.health'], ['北辰能源', 'pending', 0, 0, 0, 0, 0, 3, 'ops@beichen.energy'], ['远航物流', 'off', 41, 4, 5, 0, 0, 0, 'it@yuanhang.log']];
function tnRows() {
  const n = cnt({ few: 3, normal: 8, many: 120 }), r = rng(17), ex = ['天启传媒', '蓝海制造', '启明教育', '宏图地产', '数智金融', '绿洲能源', '云端科技'];
  return Array.from({ length: n }, (_, i) => { const b = TN[i]; if (b) return { id: 't' + i, idx: i + 1, name: b[0], st: b[1], members: b[2], asst: b[3], ds: b[4], q7: b[5], priv: b[6], shared: b[7], admin: b[8], active: b[1] === 'ok' ? int(r, 1, 600) : 9999 };
    const st = i % 11 === 0 ? 'pending' : i % 17 === 0 ? 'off' : 'ok'; return { id: 't' + i, idx: 1, name: ex[i % ex.length] + (i >= ex.length ? ' ' + i : ''), st, members: st === 'ok' ? int(r, 5, 900) : 0, asst: st === 'ok' ? int(r, 1, 40) : 0, ds: st === 'ok' ? int(r, 1, 60) : 0, q7: st === 'ok' ? int(r, 20, 9000) : 0, priv: int(r, 0, 6), shared: st === 'off' ? 0 : int(r, 1, 4), admin: 'admin@' + String(i) + '.example.com', active: st === 'ok' ? int(r, 1, 3000) : 9999 }; });
}
H.tnRows = tnRows;
const TST = { ok: ['正常', 'ok'], pending: ['待激活', 'warn'], off: ['已停用', ''] };
page({
  id: 'tenants', grp: '平台 · 租户管理', title: '租户与代管', layout: 'admin', grp2: '租户管理',
  scn: [['wizard', '创建租户 · 向导'], ['wizard-err', '创建 · 标识冲突'], ['suspend', '停用 · 影响面确认']],
  notes: ['**只看统计，不看内容**：列表里只有成员数、助手数、知识库数、提问量、节点数这类汇总；不显示任何租户的成员名单、权限、对话。', '**代管是核心动作**：每行“进入租户（代管）”，进入后顶部出现红色代管提示条，可帮租户配置模型、节点、知识库、助手；但**成员、用户组、角色与权限在代管模式下不可见**——由租户自己控制。', '**创建租户向导 4 步**：基本信息 → 可见的共享节点 → 初始配置方式（我来代管 / 交给租户管理员）→ 确认。不涉及额度（额度功能未上线）。', '**停用有影响面**：列出成员数、运行中的 Run、公开分享链接数，需输入租户名确认。', '**边界**：租户 0 / 少 / 上百；待激活长期未登录；标识冲突；停用后只读。'],
  render() {
    const rows = tnRows();
    if (scn() === 'wizard' && !S.ui.auto) { S.ui.auto = 1; S.ui.tw = 1; S.drawer = { kind: 'twiz', id: '', tab: '' }; }
    if (scn() === 'wizard-err' && !S.ui.auto) { S.ui.auto = 1; S.ui.tw = 1; S.drawer = { kind: 'twiz', id: '', tab: '' }; }
    if (scn() === 'suspend' && !S.ui.auto) { S.ui.auto = 1; const x = rows[1] || rows[0]; S.dialog = { tone: 'danger', ic: 'warn', title: '停用租户「' + x.name + '」？', desc: '<b>' + x.members + '</b> 位成员将无法登录，<b>3</b> 个运行中的 Run 会被中止，<b>12</b> 条公开分享链接将失效。数据保留，可随时重新启用。<div style="margin-top:10px">' + field('输入租户名确认', inp('', { ph: x.name })) + '</div>', ok: '确认停用', then: '租户已停用，已通知其管理员' }; }
    return phead('租户与代管', '各租户的汇总信息；点击「进入租户」可代管它', btn('创建租户', 'tnew', null, { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + H.dataNote('“租户”及每个租户的成员数、助手数、知识库数、提问量，是<b>多租户设计</b>里的统计；后端目前没有租户字段，这些数字要等多租户化后才能真实产生（全平台合计现在即可统计）。') + gate(() => listPage({
      id: 'tenants', rows, bulk: [{ i: 'play', t: '启用' }, { i: 'ban', t: '停用', bad: 1 }], ph: '搜索租户名称 / 管理员邮箱', searchKeys: ['name', 'admin'], segs: [['ok', '正常', rows.filter(x => x.st === 'ok').length], ['pending', '待激活', rows.filter(x => x.st === 'pending').length], ['off', '已停用', rows.filter(x => x.st === 'off').length]], segKey: 'st',
      cols: [{ t: '租户', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb acc" style="font:700 15px var(--f)">' + esc(x.name[0]) + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + esc(x.admin) + '</span></div></div>' }, { t: '状态', w: '100px', f: x => stt(TST[x.st][0], TST[x.st][1]) }, { t: '成员', w: '80px', f: x => '<span class="mono2">' + x.members + '</span>' }, { t: '助手 / 知识库', w: '110px', hm: 1, f: x => '<span class="mono2">' + x.asst + ' / ' + x.ds + '</span>' }, { t: '近 7 天提问', w: '110px', f: x => '<span class="mono2">' + fmt(x.q7) + '</span>' }, { t: '可见节点', w: '100px', hm: 1, f: x => '<span class="mono2">' + x.shared + '</span>' }, { t: '最近活跃', w: '100px', f: x => '<span class="muted">' + (x.active === 9999 ? '—' : ago(x.active)) + '</span>' }],
      onRow: 'drawer_tenant', menu: x => [mi('shield', '进入租户（代管）', { act: 'proxy', a: String(x.idx) }), mi('eye', '查看汇总', { act: 'drawer_tenant', a: x.id }), x.st === 'pending' ? mi('mail', '重发激活邀请', { act: 'toast', a: 'ok|已重发邀请' }) : '-', '-', mi('ban', x.st === 'off' ? '重新启用' : '停用', { bad: x.st !== 'off', act: x.st === 'off' ? 'toast' : 'confirm', a: x.st === 'off' ? 'ok|已重新启用' : CF({ tone: 'danger', ic: 'warn', title: '停用租户「' + x.name + '」？', desc: '<b>' + x.members + '</b> 位成员将无法登录，运行中的 Run 会被中止，公开分享链接失效。数据保留，可随时重新启用。', ok: '确认停用', then: '租户已停用' }) })],
      empty: { ic: 'layers', t: '还没有租户', d: '创建第一个租户，并可选择由你代管它的初始配置。', btns: btn('创建租户', 'tnew', null, { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
});
ACT.drawer_tenant = a => openDrawer('tenant', a);
ACT.tnew = () => { S.ui.tw = 1; S.ui.twm = 'proxy'; openDrawer('twiz', ''); };
DRAWERS.tenant = id => {
  const x = tnRows().find(r => r.id === id) || tnRows()[0];
  return { title: x.name, sub: TST[x.st][0] + ' · 管理员 ' + x.admin, wide: true, body: () =>
    banner('info', 'lock', '平台只能看到<b>统计</b>。成员名单、权限、对话内容、环境变量值都在租户内部，平台看不到。要帮它配置，请「进入租户（代管）」。') +
    dgrp('汇总', kv([['成员', String(x.members)], ['助手', String(x.asst)], ['知识库', String(x.ds)], ['近 7 天提问', fmt(x.q7)], ['可见的节点', String(x.shared)], ['最近活跃', x.active === 9999 ? '—' : ago(x.active)]])) +
    dgrp('可见的共享节点', x.shared ? Array.from({ length: x.shared }, (_, i) => '<div class="prow"><span class="thumb">' + ic('shield') + '</span><span class="nm" style="flex:1">shared-node-0' + (i + 1) + '</span>' + pill('可用', 'ok') + '</div>').join('') : '<div class="muted">没有共享节点对它可见。可在「共享节点」里设置可见范围。</div>'),
    foot: btn('进入租户（代管）', 'proxy', String(x.idx), { k: 'btn-pri', i: 'shield' }) + btn('关闭', 'dclose') };
};
DRAWERS.twiz = () => {
  const st = S.ui.tw || 1, err = scn() === 'wizard-err', m = S.ui.twm || 'proxy';
  const steps = '<div class="steps">' + ['基本信息', '共享节点', '初始配置', '确认'].map((n, i) => '<div class="step ' + (st === i + 1 ? 'on' : st > i + 1 ? 'done' : '') + '"><span class="sn">' + (st > i + 1 ? '✓' : i + 1) + '</span><span class="lb">' + n + '</span></div>' + (i < 3 ? '<span class="step"><span class="ln"></span></span>' : '')).join('') + '</div>';
  let b = '';
  if (st === 1) b = '<div class="fgrid">' + field('租户名称', inp('星海传媒'), { req: 1, full: 1 }) + field('标识（slug）', inp(err ? 'acme' : 'xinghai-media', { mono: 1, err }), { req: 1, err: err ? '标识已被租户「Acme 科技」占用' : '', hint: '用于登录与链接，创建后不可修改', full: 1 }) + field('初始管理员邮箱', inp('admin@xinghai.com'), { req: 1, hint: '将向此邮箱发送激活邮件', full: 1 }) + '</div>';
  if (st === 2) b = '<p class="hint" style="margin:0 0 8px">选择这个租户可以使用哪些共享节点（之后可在「共享节点」里调整）。也可以不选，让租户自己注册私有节点。</p><div class="vlist">' + ['shared-node-01', 'shared-node-02', 'shared-node-03'].map((n, i) => '<button class="vrow' + (i < 2 ? ' on' : '') + '" data-act="toast" data-a="info|已切换"><span class="cbx' + (i < 2 ? ' on' : '') + '">' + (i < 2 ? ic('check') : '') + '</span><span class="vt"><b>' + n + '</b><small>' + ['阿里云 cn-hangzhou', 'AWS ap-east-1', '总部机房 A1'][i] + '</small></span></button>').join('') + '</div>';
  if (st === 3) b = '<div class="opts">' + [['proxy', '由我代管配置', '创建后直接进入代管模式，帮租户配置模型、节点、知识库与助手；之后交还管理员。'], ['self', '交给租户管理员自己配置', '只发送激活邮件，租户管理员按引导自行配置。']].map(o => '<button class="optcard' + (m === o[0] ? ' on' : '') + '" data-act="twmode" data-a="' + o[0] + '"><span class="ck">' + (m === o[0] ? ic('check') : '') + '</span><div class="oc-t"><b>' + o[1] + '</b><small>' + o[2] + '</small></div></button>').join('') + '</div>';
  if (st === 4) b = dgrp('即将创建', kv([['租户', '星海传媒（xinghai-media）'], ['初始管理员', 'admin@xinghai.com'], ['可见共享节点', '2 个'], ['初始配置', m === 'proxy' ? '由平台代管（创建后进入代管模式）' : '交给租户管理员']])) + '<div class="callout">创建后会向管理员发送激活邮件。租户的<b>成员、用户组、角色</b>由租户自己管理，平台不参与。</div>';
  return { title: '创建租户', sub: '第 ' + st + ' / 4 步', wide: true, body: () => steps + b, foot: (st > 1 ? btn('上一步', 'twn', '-1') : btn('取消', 'dclose')) + '<span style="margin-left:auto"></span>' + (st < 4 ? btn('下一步', 'twn', '1', { k: 'btn-pri' }) : btn('创建租户', 'twdone', null, { k: 'btn-pri' })) };
};
ACT.twn = a => { if (S.ui.tw === 1 && scn() === 'wizard-err' && +a > 0) { toast('bad', '标识已被占用，请修改后继续'); return; } S.ui.tw = Math.max(1, Math.min(4, (S.ui.tw || 1) + +a)); };
ACT.twmode = a => { S.ui.twm = a; };
ACT.twdone = () => { S.drawer = null; if ((S.ui.twm || 'proxy') === 'proxy') { toast('ok', '租户已创建，已进入代管模式'); S.tenant = 4; S.ctx = 'tenant'; go('overview'); } else toast('ok', '租户已创建，激活邮件已发送'); };

/* ═════ 平台视角下的共用页面：加范围说明，模型只看统计 ═════ */
function platformBanner(id, html) {
  const def = PMAP[id], orig = def.render;
  def.render = function () { return (S.ctx === 'platform' && S.role === 'super' ? banner('info', 'shield', html) : '') + orig.apply(this, arguments); };
}
platformBanner('llm-config', '<b>平台模型配置</b>：这里的模型只供<b>平台自身功能</b>使用（如告警摘要、官方内容审核）。租户的模型由租户自己配置，或由你在<b>代管模式</b>下帮它配置。');
platformBanner('a-rules', '<b>平台自己的告警</b>：用于通知平台管理员（节点离线、通知失败等）。各租户的告警订阅在租户内独立配置。');
platformBanner('a-events', '<b>平台自己的通知记录</b>：只包含发给平台管理员的告警；租户的记录在各自租户内。');
platformBanner('n-channels', '<b>平台自己的通知渠道</b>：用于平台管理员接收告警。各租户可在自己的空间配置自己的渠道。');
(function () {
  const def = PMAP['llm-stats'], orig = def.render;
  def.render = function () {
    const plat = S.ctx === 'platform' && S.role === 'super';
    if (!plat) return orig.apply(this, arguments);
    const none = S.scale === 'empty', ten = [['星河教育', 4200000, 1280], ['Acme 科技', 1800000, 640], ['云帆医疗', 520000, 180]].map(t => [t[0], S.scale === 'many' ? t[1] * 9 : S.scale === 'few' ? Math.round(t[1] / 60) : t[1], t[2]]);
    return banner('info', 'chart', '<b>平台视角</b>：只显示汇总统计，不提供逐条调用明细。下方多了按租户的用量。') + orig.apply(this, arguments) + '<div class="panel clip"><div class="ph"><div><h3>按租户</h3><div class="sub">近 30 天 Token 与费用</div></div></div>' + (none ? empty({ sm: true, ic: 'layers', t: '暂无用量', d: '' }) : '<div class="tbl"><div class="tr thead" style="grid-template-columns:minmax(0,2fr) 140px 120px"><div class="th">租户</div><div class="th">Token</div><div class="th">费用 (USD)</div></div>' + ten.map(t => '<div class="tr trow" style="grid-template-columns:minmax(0,2fr) 140px 120px"><div class="td"><span class="nm">' + t[0] + '</span></div><div class="td mono2">' + fmt(t[1]) + '</div><div class="td mono2">$' + fmt(t[2]) + '</div></div>').join('') + '</div>') + '</div>';
  };
})();
})();

/* 租户管理 · 租户信息：租户管理员自己维护的基础信息 */
(function () {
'use strict';
const { ic, page, scn, gate, banner, phead, kv, slt, pill, stt } = H;
const row = (t, d, ctl) => '<div class="setrow"><div class="sl"><b>' + t + '</b><span>' + d + '</span></div><div class="sr">' + ctl + '</div></div>';
const inp = (v, o) => '<input class="inp' + (o && o.mono ? ' mono' : '') + '" style="width:' + ((o && o.w) || 260) + 'px' + (o && o.err ? ';border-color:var(--danger)' : '') + '" value="' + v + '"' + (o && o.ro ? ' readonly' : '') + '>';
page({
  id: 'tenantinfo', grp: '管理 · 租户管理', title: '租户信息', layout: 'admin', grp2: '租户管理',
  scn: [['dirty', '有未保存修改'], ['save-err', '保存失败 · 名称为空']],
  notes: ['**租户管理员自己管**：名称、简介、默认语言、时区、联系邮箱由本租户管理员维护，不需要找平台超管。', '**只读项说明归属**：租户标识（用于登录域名 / 链接）、创建时间由平台决定，这里只读展示；停用、删除租户是平台超管的权力，页面底部明确写出，避免管理员找不到入口。', '**修改后底部出现粘性保存栏**，并标出“未保存”；保存失败保留输入并在字段上标红。', '**后续可扩展**：登录与安全、审计日志、数据保留策略等租户级设置，都可以作为本分组下的新页面。'],
  render() {
    const sc = scn(), err = sc === 'save-err', dirty = sc === 'dirty' || err;
    const g = (h, s, rows) => '<div class="panel"><div class="ph"><h3>' + h + '</h3><span class="sub">' + s + '</span></div><div class="pad" style="padding-top:6px">' + rows + '</div></div>';
    return phead('租户信息', '本租户的基础信息，由租户管理员自己维护', '') + gate(() => (err ? banner('bad', 'warn', '<b>保存失败</b>：租户名称不能为空。已为你保留其他修改。') : '') +
      g('基本信息', '显示在对话入口、邮件和分享页', row('租户名称', '成员在页面顶部看到的名称', inp(err ? '' : 'Acme 科技', { err })) + (err ? '<div class="ferr" style="padding:0 0 8px">' + ic('warn') + '请填写租户名称</div>' : '') + row('简介', '一句话介绍团队或用途（选填）', inp('Acme 内部研发与客服知识助手', { w: 320 })) + row('Logo', '显示在侧栏左上角；建议正方形 PNG / SVG', '<button class="btn btn-ln sm" data-act="toast" data-a="info|选择文件（演示）">上传 Logo</button>')) +
      g('区域与联系', '影响时间显示、通知语言和联系渠道', row('默认语言', '新成员的界面语言，成员可自行修改', slt([['zh', '简体中文'], ['en', 'English']], 'zh')) + row('时区', '报表、通知与定时同步按该时区显示', slt([['sh', 'Asia/Shanghai（UTC+8）'], ['utc', 'UTC']], 'sh')) + row('联系邮箱', '平台有重要通知（如共享节点调整）时发送到这里', inp('admin@acme.com', { mono: 1 }))) +
      g('租户状态', '由平台维护，这里只读', '<div class="pad" style="padding-top:10px">' + kv([['租户标识', '<span class="mono">acme</span>'], ['状态', stt('正常', 'ok')], ['创建时间', '2026-08-12'], ['成员', '12 位 · 3 个用户组']]) + '<p class="hint" style="margin:10px 0 0">租户标识、停用与删除由平台超级管理员处理；需要调整请联系平台。</p></div>') +
      '<div class="panel pad" style="flex-direction:row;align-items:center;gap:10px;position:sticky;bottom:12px;box-shadow:var(--sh-pop)"><span class="dnote" style="flex:1">' + (dirty ? '<span class="dot warn"></span> 有未保存的修改' : '所有修改已保存') + '</span><button class="btn btn-gh">还原</button><button class="btn btn-pri" data-act="toast" data-a="ok|已保存">保存</button></div>', 'list');
  },
});
})();
