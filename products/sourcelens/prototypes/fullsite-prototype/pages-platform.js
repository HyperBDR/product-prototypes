/* 平台控制台：租户统计（租户维度的统计与可观测）+ 审计日志（代管与强制操作留痕）。
   超级管理员只看统计与做平台运维，租户内的内容一律通过「租户与代管 → 进入租户」处理。 */
(function () {
'use strict';
const { ic, esc, rng, int, ago, dt, fmt, page, scn, cnt, gate, stt, btn, banner, kv, dgrp, phead, empty, listPage, openDrawer } = H;
const mi = (i, t, o) => Object.assign({ i, t }, o || {});
const TST = { ok: ['正常', 'ok'], pending: ['待激活', 'warn'], off: ['已停用', ''] };

/* ═════ 指标口径与数据来源（以仓库后端真实模型为准：Run / LLMUsage / LLMUsageSeries / DataSource / LensNode）═════
   ok = 现有数据可统计；mt = 依赖多租户化（后端目前没有租户字段）；todo = 需后端新增数据 */
const MST = { ok: ['可统计', 'ok'], mt: ['待多租户化', 'warn'], todo: ['需后端支持', 'bad'] };
const METRICS = [
  ['提问数', '用户发起的运行数（source = user）', 'Run（created_at）', 'ok', 'both'],
  ['完成 / 部分完成 / 被阻断', '运行的最终结果分布', 'Run.status、Run.outcome', 'ok', 'both'],
  ['失败率', '失败运行数 ÷ 运行总数', 'Run.status = failed', 'ok', 'both'],
  ['运行耗时（平均 / P95）', '结束时间 − 开始时间', 'Run.started_at / finished_at', 'ok', 'both'],
  ['好评率', '点赞 ÷（点赞 + 点踩）', 'Run.feedback', 'ok', 'both'],
  ['Token 用量', '输入 / 输出 / 缓存 / 推理 Token', 'LLMUsage（按用户、按模型）', 'ok', 'both'],
  ['模型费用', '按币种汇总，不同币种不相加', 'LLMUsage.cost + cost_currency', 'ok', 'both'],
  ['首字延迟 / 端到端延迟 / 输出速率', '模型调用的延迟与吞吐曲线', 'LLMUsageSeries', 'ok', 'platform'],
  ['模型调用成功率', '成功调用 ÷ 调用总数', 'LLMUsage.success', 'ok', 'platform'],
  ['活跃用户数', '统计周期内有提问的不同用户数', 'Run → Session → 用户', 'ok', 'both'],
  ['助手 / 知识库 / 成员总数（全平台）', '各表记录数合计', 'Assistant / DataSource / User', 'ok', 'platform'],
  ['节点在线数与心跳', '在线节点数、最近心跳时间', 'LensNode.status / last_heartbeat_at', 'ok', 'platform'],
  ['知识库同步状态', '最近同步时间、失败原因、转换状态', 'DataSource.last_synced_at / last_error', 'ok', 'both'],
  ['按租户拆分的任何统计', '每租户的成员、助手、知识库、提问、Token、费用、失败率、活跃度排名', '——后端目前没有租户字段，所有数据都是全平台合计', 'mt', 'both'],
  ['每租户 / 每知识库存储占用', '工作区实际占用的磁盘空间', '——未见采集；LensNode.last_metrics 的内容待确认', 'todo', 'both'],
  ['API Key 最近使用 / 调用次数', '每个 Key 最近何时被谁调用、调用多少次', '——AK/SK 方案（issue #38）尚未实现，没有 AccessKey 与调用记录', 'todo', 'both'],
  ['公开分享的访问量', '分享链接被打开的次数', '——分享模型里未见访问计数字段，需确认', 'todo', 'both'],
  ['答案证据覆盖率', '回答中有证据支持的比例', '——Run.citations 有数据，但“覆盖率”口径尚未定义', 'todo', 'both'],
  ['服务可用性（SLA）', '节点 / 接口的可用时长占比', '——只有最近心跳，没有历史可用性记录', 'todo', 'platform'],
];
H.metricsPanel = scope => {
  const rows = METRICS.filter(m => m[4] === 'both' || m[4] === scope);
  const n = rows.filter(m => m[3] !== 'ok').length;
  return '<div class="panel"><div class="ph"><div><h3>指标口径与数据来源</h3><div class="sub">统计只用生产后端现有的数据；暂时统计不到的指标已标注，需要后端补充后才能在页面上真实呈现（共 ' + n + ' 项）</div></div></div><div class="mtab"><div class="mrow mh"><span>指标</span><span>口径</span><span>数据来源</span><span>状态</span></div>' + rows.map(m => '<div class="mrow"><span><b>' + esc(m[0]) + '</b></span><span>' + esc(m[1]) + '</span><span class="muted">' + esc(m[2]) + '</span><span>' + stt(MST[m[3]][0], MST[m[3]][1]) + '</span></div>').join('') + '</div></div>';
};
H.dataNote = text => banner('warn', 'info', '<b>数据说明</b>：' + text);

/* ═════ 租户统计 ═════ */
function statRows() {
  const r = rng(551);
  return H.tnRows().map((t, i) => {
    const on = t.st === 'ok', q = t.q7, fail = on && q ? (i === 2 ? 9.4 : 1 + (i * 7) % 5 + (i % 3) / 10) : 0;
    return Object.assign({}, t, { act: on ? Math.min(t.members, int(r, 1, Math.max(2, t.members))) : 0, tok: q * 4200, cost: Math.round(q * 0.18 * 10) / 10, like: on && q ? 78 + (i * 5) % 18 : 0, fail: Math.round(fail * 10) / 10, p95: on && q ? int(r, 4, 28) : 0, run: on ? int(r, 0, 9) : 0 });
  });
}
page({
  id: 'p-tstats', grp: '平台 · 租户管理', title: '租户统计', layout: 'admin', grp2: '租户管理',
  scn: [['abnormal', '失败率偏高的租户']],
  // metrics below come from Run / LLMUsage; the per-tenant split itself needs multi-tenancy
  notes: ['**租户维度的统计与可观测**：每个租户一行——成员活跃、助手 / 知识库数量、提问、Token、模型费用、失败率、P95 耗时、运行中任务。用来发现“谁用得多、谁在出问题、谁没在用”。', '**只看汇总，不看内容**：不显示任何租户的成员名单、对话和助手详情；要处理具体问题，点“进入租户（代管）”。', '**可排序、可导出**：点列头排序（如按失败率降序找异常租户），支持导出 CSV。', '**失败率偏高会标红**（≥ 5%），并在顶部汇总提示。', '**数据口径以生产后端现有数据为准**：提问 / 失败率 / 耗时 / 好评率来自 Run，Token / 费用来自 LLMUsage。**“按租户拆分”本身依赖多租户化**——后端目前没有租户字段，上线前只能看到全平台合计；页面底部列出了每个指标的口径与“暂时统计不到、需要后端支持”的指标。'],
  render() {
    const rows = statRows(), hi = rows.filter(x => x.fail >= 5), none = S.scale === 'empty';
    const sum = rows.reduce((a, x) => ({ q: a.q + x.q7, t: a.t + x.tok, c: a.c + x.cost, a: a.a + (x.st === 'ok' ? 1 : 0) }), { q: 0, t: 0, c: 0, a: 0 });
    return phead('租户统计', '各租户近 7 天的使用与运行情况（仅统计，不含内容）', btn('导出 CSV', 'toast', 'info|已导出当前列表', { i: 'download' }), none ? null : rows.length) + H.dataNote('本页数字为设计稿示意。<b>按租户拆分依赖多租户化</b>（后端目前没有租户字段，上线前只能看到全平台合计）；提问、失败率、耗时、好评率来自 Run，Token、费用来自 LLMUsage——这些指标本身现在就能统计。下方列出了每个指标的口径，以及暂时统计不到、需要后端支持的指标。') + gate(() => (none ? '' : '<div class="kpis c4">' + H.kpi('活跃租户', sum.a + ' / ' + rows.length, { i: 'layers' }) + H.kpi('近 7 天提问', fmt(sum.q), { i: 'msg' }) + H.kpi('近 7 天 Token', fmt(sum.t), { i: 'bolt' }) + H.kpi('模型费用 (USD)', '$' + fmt(Math.round(sum.c)), { i: 'chart' }) + '</div>' + (hi.length ? banner('bad', 'warn', '<b>' + hi.length + ' 个租户失败率 ≥ 5%</b>：' + hi.slice(0, 3).map(x => esc(x.name)).join('、') + (hi.length > 3 ? ' 等' : '') + '。可进入租户（代管）排查，或到「任务管理 / 通知记录」看平台侧原因。') : '')) + listPage({
      id: 'tstats', rows: none ? [] : rows, sel: false, ph: '搜索租户', searchKeys: ['name'], segs: [['ok', '正常', rows.filter(x => x.st === 'ok').length], ['pending', '待激活', rows.filter(x => x.st === 'pending').length], ['off', '已停用', rows.filter(x => x.st === 'off').length]], segKey: 'st',
      cols: [
        { t: '租户', w: 'minmax(0,1.8fr)', f: x => '<div class="cmain"><span class="thumb acc" style="font:700 15px var(--f)">' + esc(x.name[0]) + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + stt(TST[x.st][0], TST[x.st][1]) + '</span></div></div>' },
        { t: '活跃 / 成员', w: '100px', hm: 1, f: x => '<span class="mono2">' + x.act + ' / ' + x.members + '</span>' },
        { t: '助手 / 知识库', w: '100px', hm: 1, f: x => '<span class="mono2">' + x.asst + ' / ' + x.ds + '</span>' },
        { t: '提问', w: '80px', r: 1, f: x => '<span class="mono2">' + fmt(x.q7) + '</span>', sk: 'q7' },
        { t: 'Token', w: '90px', r: 1, hm: 1, f: x => '<span class="mono2">' + fmt(x.tok) + '</span>', sk: 'tok' },
        { t: '费用 (USD)', w: '90px', r: 1, hm: 1, f: x => '<span class="mono2">$' + x.cost + '</span>', sk: 'cost' },
        { t: '失败率', w: '80px', r: 1, f: x => x.q7 ? '<span class="mono2" style="' + (x.fail >= 5 ? 'color:var(--danger);font-weight:600' : '') + '">' + x.fail + '%</span>' : '<span class="muted">—</span>', sk: 'fail' },
        { t: 'P95 耗时', w: '80px', r: 1, hm: 1, f: x => x.p95 ? '<span class="mono2">' + x.p95 + ' s</span>' : '<span class="muted">—</span>', sk: 'p95' },
        { t: '好评率', w: '80px', r: 1, hm: 1, f: x => x.q7 ? '<span class="mono2">' + x.like + '%</span>' : '<span class="muted">—</span>', sk: 'like' },
        { t: '运行中', w: '70px', r: 1, hm: 1, f: x => '<span class="mono2">' + x.run + '</span>', sk: 'run' },
      ],
      onRow: 'drawer_tenant', menu: x => [mi('shield', '进入租户（代管）', { act: 'proxy', a: String(x.idx) }), mi('eye', '查看汇总', { act: 'drawer_tenant', a: x.id })],
      empty: { ic: 'chart', t: '还没有租户数据', d: '创建租户并产生使用后，这里会显示各租户的统计。', btns: btn('创建租户', 'tnew', null, { k: 'btn-pri', i: 'plus' }) },
    }) + H.metricsPanel('platform'), 'list');
  },
});

/* ═════ 成员总览（全局成员归属搜索，只读）═════ */
const MST2 = { active: ['正常', 'ok'], invited: ['待激活', 'warn'], disabled: ['已停用', ''], locked: ['已锁定', 'bad'] };
function memRows() {
  const n = cnt({ few: 6, normal: 48, many: 1200 }), r = rng(881), P = H.PEOPLE || [], PY = H.PINY || [], T = H.tnRows().filter(x => x.st !== 'pending').map(x => x.name);
  return Array.from({ length: n }, (_, i) => { const nm = (P[i % P.length] || '成员') + (i >= P.length ? String(Math.floor(i / P.length)) : ''), ten = T[i % T.length], admin = i % 9 === 0; return { id: 'm' + i, name: nm, email: (PY[i % PY.length] || 'user') + (i >= P.length ? Math.floor(i / P.length) : '') + '@' + ten.replace(/\s/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') + '.example.com', tenant: ten, role: admin ? '租户管理员' : '普通用户', st: i === 5 ? 'locked' : i === 8 ? 'invited' : i === 11 ? 'disabled' : 'active', last: i === 8 ? 99999 : int(r, 5, 60 * 24 * 40), keys: admin ? int(r, 0, 3) : 0, idx: (H.tnRows().find(x => x.name === ten) || { idx: 1 }).idx }; });
}
page({
  id: 'p-members', grp: '平台 · 租户管理', title: '成员总览', layout: 'admin', grp2: '租户管理',
  scn: [['search', '按邮箱找归属']],
  notes: ['**全局成员归属搜索（只读）**：输入姓名或邮箱，立刻看到这个人属于哪个租户、什么角色、状态如何。用于排查“这个账号是谁的”“泄露的 Key 是谁建的”。', '**只做查找，不做管理**：成员的增删、角色、用户组由各租户自己管理；平台要处理就点“进入租户（代管）”——代管模式下成员与权限信息依然不可见，所以这里只给归属摘要。', '**与 API Key 总览互相印证**：租户管理员行显示他创建的 API Key 数，可直接去总览搜索。', '**数据说明**：成员列表本身来自用户表，现在就能统计；“归属租户”依赖多租户化（后端目前没有租户字段）。'],
  render() {
    const rows = memRows(), none = S.scale === 'empty';
    if (scn() === 'search' && !S.ui.auto) { S.ui.auto = 1; S.tbl.pmem = Object.assign(H.T('pmem'), { q: 'li.na' }); }
    return phead('成员总览', '所有租户的成员归属（只读；管理请进入对应租户代管）', '', none ? null : fmt(rows.length)) + H.dataNote('成员本身来自用户表；<b>“归属租户”依赖多租户化</b>（后端目前没有租户字段），本页为设计稿示意。') + gate(() => listPage({
      id: 'pmem', rows: none ? [] : rows, sel: false, ph: '搜索姓名 / 邮箱 / 租户', searchKeys: ['name', 'email', 'tenant'],
      segs: [['active', '正常', rows.filter(x => x.st === 'active').length], ['invited', '待激活', rows.filter(x => x.st === 'invited').length], ['locked', '锁定', rows.filter(x => x.st === 'locked').length], ['disabled', '停用', rows.filter(x => x.st === 'disabled').length]], segKey: 'st',
      filters: [{ k: 'tenant', label: '租户', opts: H.tnRows().map(x => [x.name, x.name]).filter((o, i, a) => a.findIndex(y => y[0] === o[0]) === i).slice(0, 12) }, { k: 'role', label: '角色', opts: [['租户管理员', '租户管理员'], ['普通用户', '普通用户']] }],
      cols: [
        { t: '成员', w: 'minmax(0,2fr)', f: x => '<div class="cmain">' + H.av(x.name) + '<div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + esc(x.email) + '</span></div></div>' },
        { t: '归属租户', w: '130px', f: x => '<span class="nm">' + esc(x.tenant) + '</span>' },
        { t: '角色', w: '100px', f: x => '<span class="pill ' + (x.role === '租户管理员' ? 'acc' : '') + '">' + x.role + '</span>' },
        { t: '状态', w: '90px', f: x => stt(MST2[x.st][0], MST2[x.st][1]) },
        { t: '创建的 API Key', w: '110px', hm: 1, f: x => x.role === '租户管理员' ? '<span class="mono2">' + x.keys + ' 个</span>' : '<span class="muted">—</span>' },
        { t: '最近登录', w: '100px', hm: 1, f: x => '<span class="muted">' + (x.last === 99999 ? '从未' : ago(x.last)) + '</span>' },
      ],
      onRow: 'drawer_pmem', menu: x => [mi('shield', '进入租户（代管）', { act: 'proxy', a: String(x.idx) }), mi('eye', '查看归属', { act: 'drawer_pmem', a: x.id })].concat(x.role === '租户管理员' ? [mi('key', '查看其创建的 API Key', { act: 'navto', a: 'platform|p-apikeys' })] : []),
      empty: { ic: 'users', t: '还没有成员', d: '租户有成员后，这里可以全局搜索他们的归属。' },
    }), 'list');
  },
});
ACT.drawer_pmem = a => openDrawer('pmem', a);
DRAWERS.pmem = id => {
  const x = memRows().find(r => r.id === id) || memRows()[0];
  return { title: esc(x.name), sub: esc(x.email), wide: true, body: () => banner('info', 'lock', '平台只看到<b>归属摘要</b>。成员的用户组、权限、对话与使用情况在租户内部，平台看不到；需要处理请「进入租户（代管）」。') + dgrp('归属', kv([['归属租户', '<b>' + esc(x.tenant) + '</b>'], ['角色', x.role], ['状态', stt(MST2[x.st][0], MST2[x.st][1])], ['最近登录', x.last === 99999 ? '从未' : ago(x.last)]].concat(x.role === '租户管理员' ? [['创建的 API Key', x.keys + ' 个']] : []))), foot: btn('进入租户（代管）', 'proxy', String(x.idx), { k: 'btn-pri', i: 'shield' }) + btn('关闭', 'dclose') };
};

/* ═════ 审计日志 ═════ */
const ACTS = { proxy: ['进入代管', 'info'], cfg: ['代管配置变更', 'acc'], force: ['强制操作', 'bad'], tenant: ['租户管理', 'warn'], catalog: ['官方目录', ''], node: ['节点', ''], global: ['全局配置', 'acc'] };
function auditRows() {
  const n = cnt({ few: 4, normal: 28, many: 600 }), r = rng(771), T = ['Acme 科技', '星河教育', '云帆医疗', '北辰能源', '—'], who = ['platform-admin', 'ops.lin', 'ops.zhou'];
  const tpl = [
    ['proxy', '进入租户（代管）', '租户「{t}」'], ['cfg', '代管：新增模型配置', '模型「生产主力」'], ['cfg', '代管：创建助手', '助手「合同审阅」'], ['cfg', '代管：创建知识库', '知识库「产品文档」'],
    ['force', '强制吊销 API Key', 'API Key「CI 流水线」sk_••••a3f1'], ['tenant', '停用租户', '租户「{t}」'], ['tenant', '创建租户', '租户「{t}」'], ['catalog', '发布官方技能新版本', '技能「SQL 生成」v2.1.0'],
    ['catalog', '下架官方 MCP', 'MCP「Sentry」'], ['node', '调整共享节点可见范围', 'shared-node-02'], ['node', '重启共享节点', 'shared-node-01'], ['global', '修改全局配置', '上传并发数 3 → 5'],
  ];
  return Array.from({ length: n }, (_, i) => { const t = tpl[i % tpl.length], ten = t[2].includes('{t}') || t[0] === 'cfg' || t[0] === 'force' ? T[i % 4] : '—'; return { id: 'au' + i, kind: t[0], act: t[1], obj: t[2].replace('{t}', ten === '—' ? 'Acme 科技' : ten), tenant: ten, who: who[i % 3], age: 5 + i * 37 + int(r, 0, 20), ok: i % 13 !== 7, ip: '10.0.' + (i % 9) + '.' + (10 + i % 80) }; });
}
page({
  id: 'p-audit', grp: '平台 · 审计与配置', title: '审计日志', layout: 'admin', grp2: '审计与配置',
  scn: [['filtered', '只看强制操作']],
  notes: ['**平台侧所有关键操作都留痕**：进入代管、代管期间的配置变更、强制吊销 / 停用、租户创建与停用、官方目录发布与下架、共享节点调整、全局配置修改。', '**谁、在哪个租户、做了什么、结果如何**一目了然；可按类型和租户筛选，支持导出。', '**只读**：审计日志不可修改、不可删除。租户内部的操作审计由租户侧另行提供。'],
  render() {
    const rows = auditRows(), none = S.scale === 'empty';
    if (scn() === 'filtered' && !S.ui.auto) { S.ui.auto = 1; S.tbl.audit = Object.assign(H.T('audit'), { f: { kind: 'force' } }); }
    return phead('审计日志', '平台管理员的代管、强制操作与配置变更记录（只读）', btn('导出', 'toast', 'info|已导出当前筛选结果', { i: 'download' }), none ? null : rows.length) + gate(() => listPage({
      id: 'audit', rows: none ? [] : rows, sel: false, ph: '搜索操作 / 对象 / 操作人', searchKeys: ['act', 'obj', 'who'],
      filters: [{ k: 'kind', label: '类型', opts: Object.keys(ACTS).map(k => [k, ACTS[k][0]]) }, { k: 'tenant', label: '租户', opts: ['Acme 科技', '星河教育', '云帆医疗', '北辰能源'].map(t => [t, t]) }],
      cols: [
        { t: '时间', w: '110px', f: x => '<span class="muted">' + dt(x.age) + '</span>' },
        { t: '类型', w: '110px', f: x => '<span class="pill ' + ACTS[x.kind][1] + '">' + ACTS[x.kind][0] + '</span>' },
        { t: '操作', w: 'minmax(0,1.6fr)', f: x => '<div class="cname"><span class="nm">' + esc(x.act) + '</span><span class="slug">' + esc(x.obj) + '</span></div>' },
        { t: '租户', w: '110px', hm: 1, f: x => '<span class="muted">' + esc(x.tenant) + '</span>' },
        { t: '操作人', w: '120px', hm: 1, f: x => '<span class="mono2">' + x.who + '</span>' },
        { t: '结果', w: '80px', f: x => stt(x.ok ? '成功' : '失败', x.ok ? 'ok' : 'bad') },
      ],
      onRow: 'drawer_audit', menu: x => [mi('eye', '查看详情', { act: 'drawer_audit', a: x.id })],
      empty: { ic: 'list', t: '还没有审计记录', d: '平台管理员进行代管或强制操作后，会在这里留下记录。' },
    }), 'list');
  },
});
ACT.drawer_audit = a => openDrawer('audit', a);
DRAWERS.audit = id => {
  const x = auditRows().find(r => r.id === id) || auditRows()[0];
  return { title: esc(x.act), sub: dt(x.age), wide: true, body: () => (x.ok ? '' : banner('bad', 'warn', '<b>操作失败</b>：目标资源被占用或权限校验未通过，未产生变更。')) + dgrp('记录', kv([['类型', ACTS[x.kind][0]], ['操作', esc(x.act)], ['对象', esc(x.obj)], ['租户', esc(x.tenant)], ['操作人', '<span class="mono">' + x.who + '</span>'], ['来源 IP', '<span class="mono">' + x.ip + '</span>'], ['结果', x.ok ? '成功' : '失败']])) + (x.kind === 'cfg' || x.kind === 'global' ? dgrp('变更内容', '<div class="muted">变更前后对比（演示）：<span class="mono">3</span> → <span class="mono">5</span></div>') : ''), foot: btn('关闭', 'dclose') };
};
})();
