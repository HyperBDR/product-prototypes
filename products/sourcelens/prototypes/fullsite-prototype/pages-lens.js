/* 管理台 · Lens 资源：助手 / 节点 / 知识库 / 连接 / Skill / MCP / 资源设置 / 全局配置 */
(function () {
'use strict';
const { ic, esc, md, rng, pick, int, ago, dt, bytes, av, fmt, page, scn, cnt, gate, pill, stt, btn, tgl, field, inp, slt, banner, bar, kv, dgrp, code, phead, empty, listPage, T, toast, openConfirm, openDrawer, kpi, segs, ptabs } = H;
const CF = o => JSON.stringify(o);
function mi(i, t, o) { return Object.assign({ i, t }, o || {}); }
const PEOPLE = ['张伟', '李娜', '王磊', '刘洋', '陈静', '杨帆', '赵敏', '黄涛', '周杰', '吴倩', '徐凯', '孙悦', '马超', '朱琳', '胡斌'];
const PINY = ['zhang.wei', 'li.na', 'wang.lei', 'liu.yang', 'chen.jing', 'yang.fan', 'zhao.min', 'huang.tao', 'zhou.jie', 'wu.qian', 'xu.kai', 'sun.yue', 'ma.chao', 'zhu.lin', 'hu.bin'];
H.PEOPLE = PEOPLE; H.PINY = PINY;
const MODELS = ['gpt-5', 'claude-sonnet-5-5', 'claude-opus-5-5', 'gemini-3-pro', 'qwen3-max', 'deepseek-v4'];
H.MODELS = MODELS;
const pageWrap = (inner) => inner;
const wrap = (title, sub, acts, body, count) => phead(title, sub, acts, count) + body;

/* ═════ 助手 ═════ */
function assistantRows() {
  const n = cnt({ few: 3, normal: H.REAL.assistants.length, many: 120 }), r = rng(21);
  const names = H.REAL.assistants;
  return Array.from({ length: n }, (_, i) => {
    const st = i === 2 ? 'incomplete' : i === 4 ? 'disabled' : i === 7 ? 'modelgone' : 'active';
    return { id: 'a' + i, name: i < names.length ? names[i] : pick(r, names) + ' #' + i, slug: 'asst-' + (i < names.length ? names[i].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('a' + i) : i), pub: r() > .55, vis: r() > .55 ? (i % 4 === 0 ? 'open' : 'tenant') : 'assigned', model: st === 'modelgone' ? 'gpt-4-legacy' : pick(r, MODELS), ds: int(r, 0, 9), sk: int(r, 0, 6), mcp: int(r, 0, 3), node: pick(r, ['lens-node-01', 'lens-node-02', 'lens-node-03']), st, why: st === 'incomplete' ? '节点 lens-node-03 离线' : st === 'modelgone' ? '模型 gpt-4-legacy 已下线' : '', age: int(r, 20, 30000), q: int(r, 0, 4800) };
  });
}
H.assistantRows = assistantRows;
const BV = { open: ['公开可见', '任何人都能直接使用（无需登录）'], tenant: ['租户内可见', '租户内登录的成员都能使用（默认）'], assigned: ['指定成员或组', '只有选中的成员或组能使用'] };
function bulkVisHTML() {
  const n = H.bsel('asst').length, v = S.ui.bvis || 'tenant';
  const cards = Object.keys(BV).map(k => '<button class="optcard' + (v === k ? ' on' : '') + '" data-act="bvissel" data-a="' + k + '"><span class="radio' + (v === k ? ' on' : '') + '"></span><span><b>' + BV[k][0] + '</b><span>' + BV[k][1] + '</span></span></button>').join('');
  const extra = v === 'open' ? banner('warn', 'warn', '<b>公开可见意味着任何人都能直接使用</b>。请确认所选助手的知识库不含内部资料。') : v === 'assigned' ? field('可见的成员或组', slt(['研发部', '运维组', '产品部', '法务'], '研发部'), { hint: '之后可以在每个助手里继续细调' }) : '';
  return H.bdlg('批量改可见性 · ' + n + ' 个助手', 'eye', '<div class="sp-lead">修改所选助手的<b>助手可见性</b>（谁能使用助手）。<b>分享可见性</b>不受影响。</div><div class="opts">' + cards + '</div>' + extra, bcancel + '<button class="btn btn-pri" data-act="bvisgo">应用到 ' + n + ' 个助手</button>');
}
ACT.bulkvis = () => { S.ui.bvis = 'tenant'; S.dialog = { html: bulkVisHTML(), side: true }; };
ACT.bvissel = a => { S.ui.bvis = a; S.dialog = { html: bulkVisHTML(), side: true }; };
ACT.bvisgo = () => {
  const v = S.ui.bvis || 'tenant', ids = H.bsel('asst'), rows = assistantRows(), diff = ids.filter(id => (rows.find(r => r.id === id) || {}).vis !== v).length, skip = ids.length - diff;
  H.bdone('asst', diff ? '已将 ' + diff + ' 个助手改为「' + BV[v][0] + '」' + (skip ? '；' + skip + ' 个本来就是该可见性，已跳过' : '') : '所选助手本来就是「' + BV[v][0] + '」，无需修改', diff ? 'ok' : 'info');
};
ACT.asstenable = () => {
  const ids = H.bsel('asst'), rows = assistantRows(), off = ids.filter(id => (rows.find(r => r.id === id) || {}).st === 'disabled').length, bad = ids.filter(id => ['incomplete', 'modelgone'].includes((rows.find(r => r.id === id) || {}).st)).length;
  H.bdone('asst', off ? '已启用 ' + off + ' 个助手' + (bad ? '；' + bad + ' 个配置不完整或模型已下线，需先处理' : '') : '所选助手没有处于停用状态的' + (bad ? '（其中 ' + bad + ' 个配置不完整或模型已下线，需先处理）' : ''), off ? 'ok' : 'info');
};
H.bdlg = (title, icn, body, foot) => '<div class="dlg-h"><h3>' + ic(icn) + ' ' + title + '</h3><button class="ibtn" style="margin-left:auto" data-act="dlg" data-a="cancel">' + ic('x') + '</button></div><div class="dlg-b" style="display:flex;flex-direction:column;gap:14px">' + body + '</div><div class="dlg-f">' + foot + '</div>';
H.bsel = id => (S.tbl[id] && S.tbl[id].sel) || [];
H.bdone = (id, msg, tone) => { if (S.tbl[id]) S.tbl[id].sel = []; S.dialog = null; toast(tone || 'ok', msg); };
ACT.bdone = a => { const [id, msg] = a.split('|'); H.bdone(id, msg); };
const bcancel = '<button class="btn btn-gh" data-act="dlg" data-a="cancel">取消</button>';
const VIS = { open: ['公开可见', 'warn'], tenant: ['租户内可见', 'ok'], assigned: ['指定成员或组', ''] };
H.VIS = VIS;
const ASTAT = { active: ['启用', 'ok'], disabled: ['已停用', ''], incomplete: ['配置不完整', 'warn'], modelgone: ['模型失效', 'bad'] };
H.ASTAT = ASTAT;
page({
  id: 'assistants', grp: '管理台 · Lens', title: '助手', layout: 'admin', grp2: 'Lens 运营',
  scn: [['bulk-vis', '批量改可见性'], ['model-gone', '模型下线 · 批量替换'], ['wizard', '新建助手 · 知识问答第 2 步'], ['wizard-err', '新建助手 · 校验错误']],
  enter() { },
  notes: ['**批量操作**（表格视图，卡片视图旁有“批量操作”入口）：改可见性（公开 / 租户内 / 指定成员或组，选公开时给出风险提示）/ 启用 / 停用 / 替换模型 / 删除；不适用的项会跳过并说明。', '**风险前置**：列表顶部汇总“N 个助手受影响”（模型已下线 / 节点离线），一键进入批量替换模型，而不是逐个点进去才发现。', '**状态分层**：启用 / 已停用 / 配置不完整 / 模型失效，并在行内给出原因，鼠标悬停才出现的操作改为常驻“…”菜单（移动端常驻）。', '**新建向导 4 步**：基本信息 → 数据范围 → 模型与技能 → 访问与发布，每步即时校验，右侧实时预览“预计可回答的数据范围”。', '**海量**时用搜索 + 可见性/状态/节点筛选，并支持批量停用；**空状态**直接给“创建第一个助手”。'],
  render() {
    const rows = assistantRows(), bad = rows.filter(x => x.st === 'modelgone' || x.st === 'incomplete');
    if ((scn() === 'wizard' || scn() === 'wizard-err') && !S.ui.auto) { S.ui.auto = 1; ACT.awizscn(scn()); }
    if (scn() === 'bulk-vis' && !S.ui.auto) { S.ui.auto = 1; S.ui.av = 'table'; S.tbl.asst = Object.assign(H.T('asst'), { sel: rows.filter(x => x.vis !== 'open').slice(0, 3).map(x => x.id) }); S.ui.bvis = 'tenant'; S.dialog = { html: bulkVisHTML(), side: true }; }
    if (scn() === 'model-gone' && !S.ui.shown) { S.ui.shown = 1; S.dialog = { html: replaceHTML(), side: true }; }
    const ban = bad.length && S.scale !== 'empty' ? banner('warn', 'warn', '<b>' + bad.length + ' 个助手需要处理</b>：' + rows.filter(x => x.st === 'modelgone').length + ' 个使用的模型已下线，' + rows.filter(x => x.st === 'incomplete').length + ' 个依赖的节点离线。', '<button class="btn btn-gh sm" data-act="repl">批量替换模型</button>') : '';
    return phead('助手', '管理对用户开放的 AI 助手：数据范围、模型、技能与可见性', btn('新建助手', 'awiz', null, { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + gate(() => listPage({
      id: 'asst', rows, banner: ban, ph: '搜索助手名称 / slug', searchKeys: ['name', 'slug'], segs: [['active', '启用', rows.filter(x => x.st === 'active').length], ['disabled', '停用'], ['incomplete', '需处理', bad.length]], segKey: 'st',
      filters: [{ k: 'pub', label: '可见性', opts: [['open', '公开可见'], ['tenant', '租户内可见'], ['assigned', '指定成员或组']], fn: (x, v) => x.vis === v }, { k: 'model', label: '模型', opts: MODELS.map(m => [m, m]) }, { k: 'node', label: '节点', opts: [['lens-node-01', 'lens-node-01'], ['lens-node-02', 'lens-node-02'], ['lens-node-03', 'lens-node-03']] }],
      cols: [{ t: '助手', w: 'minmax(0,2.4fr)', f: x => '<div class="cmain"><span class="thumb acc">' + ic('bot') + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + x.slug + '</span></div></div>' }, { t: '状态', w: '130px', f: x => { const s = ASTAT[x.st]; return '<div class="cname"><span>' + stt(s[0], s[1]) + '</span>' + (x.why ? '<span class="slug" style="color:var(--' + (x.st === 'modelgone' ? 'danger' : 'warn') + ')">' + esc(x.why) + '</span>' : '') + '</div>'; } }, { t: '可见性', w: '80px', hm: 1, f: x => pill(VIS[x.vis][0], VIS[x.vis][1]) }, { t: '模型', w: 'minmax(0,1.2fr)', f: x => '<span class="mono2 trunc">' + x.model + '</span>' }, { t: '数据 / 技能 / MCP', w: '130px', hm: 1, f: x => '<span class="mono2">' + x.ds + ' · ' + x.sk + ' · ' + x.mcp + '</span>' }, { t: '近 30 天提问', w: '100px', r: 1, f: x => '<span class="mono2">' + fmt(x.q) + '</span>', sk: 'q' }, { t: '更新', w: '90px', hm: 1, f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      onRow: 'drawer_asst', menu: x => [mi('edit', '编辑', { act: 'drawer', a: 'asst|' + x.id }), mi('copy', '复制助手'), mi('refresh', '替换模型', { act: 'repl' }), mi('msg', '打开对话', { act: 'nav2', a: 'chat' }), '-', mi(x.st === 'disabled' ? 'play' : 'pause', x.st === 'disabled' ? '启用' : '停用'), mi('trash', '删除', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'trash', title: '删除助手「' + x.name.slice(0, 20) + '」？', desc: '将同时删除其 <b>' + x.q + '</b> 次提问记录与已创建的分享链接，<b>此操作不可恢复</b>。知识库本身不会被删除。', confirmText: x.slug, ok: '永久删除', then: '助手已删除' }) })],
      bulk: [{ i: 'eye', t: '改可见性', act: 'bulkvis' }, { i: 'play', t: '启用', act: 'asstenable' }, { i: 'pause', t: '停用' }, { i: 'refresh', t: '替换模型' }, { i: 'trash', t: '删除', bad: 1 }], empty: { ic: 'bot', t: '还没有助手', d: '助手把知识库、模型和技能组合起来，对用户提供带引用的问答。先创建第一个。', btns: btn('新建助手', 'awiz', null, { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
});
ACT.drawer_asst = a => { openDrawer('asst', a); };
ACT.awiz = () => { S.ui.auto = 1; S.ui.wz = 1; S.drawer = { kind: 'awiz', id: '', tab: '' }; };
ACT.repl = () => { S.dialog = { html: replaceHTML(), side: true }; };
function replaceHTML() {
  const rows = assistantRows().filter(x => x.st === 'modelgone' || true).slice(0, 3);
  return '<div class="dlg-h"><h3>' + ic('refresh') + ' 批量替换模型</h3><button class="ibtn" style="margin-left:auto" data-act="dlg" data-a="cancel">' + ic('x') + '</button></div><div class="dlg-b" style="display:flex;flex-direction:column;gap:14px">' + banner('warn', 'warn', '<b>gpt-4-legacy</b> 已在 2026-11-01 被提供商下线，受影响的助手将无法回答。') + field('将模型替换为', slt([['claude-sonnet-5-5', 'claude-sonnet-5-5 · 推荐（能力兼容）'], ['gpt-5', 'gpt-5'], ['qwen3-max', 'qwen3-max · 不支持视觉']], 'claude-sonnet-5-5'), { hint: '已按能力过滤：被替换助手使用了「视觉输入」，不兼容的模型会标注。' }) + '<div class="dgrp-t">受影响助手</div><div style="display:flex;flex-direction:column">' + rows.map(x => '<div class="prow"><span class="cbx on">' + ic('check') + '</span><span style="min-width:0;flex:1"><span class="nm trunc">' + esc(x.name) + '</span><span class="slug">' + x.slug + '</span></span>' + pill('gpt-4-legacy', 'bad mono') + ic('right') + pill('claude-sonnet-5-5', 'ok mono') + '</div>').join('') + '</div></div><div class="dlg-f"><button class="btn btn-gh" data-act="dlg" data-a="cancel">取消</button><button class="btn btn-pri" data-act="dlg" data-a="ok">替换 ' + rows.length + ' 个助手</button></div>';
}
DRAWERS.asst = id => { const x = assistantRows().find(r => r.id === id) || assistantRows()[0]; const s = ASTAT[x.st];
  return { title: esc(x.name), sub: x.slug + ' · ' + s[0], tabs: [['ov', '概览'], ['data', '数据访问', x.ds], ['rt', '运行配置'], ['use', '使用情况']], wide: true,
    body: t => {
      if (t === 'data') return dgrp('数据访问范围', Array.from({ length: Math.max(x.ds, 0) }, (_, i) => '<div class="prow"><span class="thumb">' + ic('db') + '</span><span style="flex:1;min-width:0"><span class="nm">' + ['backend-api', '产品文档', '运维手册', '合同库', '飞书知识库'][i % 5] + '</span><span class="slug">/' + ['src', 'docs', 'runbooks'][i % 3] + '</span></span>' + stt(i === 1 && x.st === 'incomplete' ? '同步失败' : '已同步', i === 1 && x.st === 'incomplete' ? 'bad' : 'ok') + '</div>').join('') || empty({ sm: 1, ic: 'db', t: '尚未关联知识库', d: '没有知识库时，助手只能依靠模型自身知识回答。', btns: btn('关联知识库', 'toast', 'info|选择知识库', { k: 'btn-pri' }) }));
      if (t === 'rt') return dgrp('模型与预算', '<div class="fgrid">' + field('模型', slt(MODELS.concat(['gpt-4-legacy']), x.model), { err: x.st === 'modelgone' ? '该模型已下线，请替换' : '' }) + field('思考模式', slt([['fast', '快速'], ['std', '标准'], ['deep', '深度']], 'std')) + field('单次最大轮次', inp('24', { mono: 1 })) + field('Token 预算', inp('200000', { mono: 1 })) + '</div>') + dgrp('执行节点', '<div class="prow">' + ic('server') + '<span class="mono2">' + x.node + '</span>' + stt(x.st === 'incomplete' ? '离线' : '在线', x.st === 'incomplete' ? 'bad' : 'ok') + '</div>');
      if (t === 'use') return '<div class="kpis">' + kpi('近 30 天提问', fmt(x.q), { d: '+12%', dir: 'up' }) + kpi('平均耗时', '18.4', { unit: 's' }) + kpi('失败率', '2.1', { unit: '%', d: '-0.4pt', dir: 'up' }) + '</div>' + H.chartPanel('每日提问', '', H.barChart({ labels: Array.from({ length: 14 }, (_, i) => String(i + 1)), series: [{ name: '提问', color: 'var(--c1)', data: Array.from({ length: 14 }, (_, i) => 20 + (i * 37) % 60) }], h: 150 }));
      return (x.why ? banner(x.st === 'modelgone' ? 'bad' : 'warn', 'warn', '<b>' + esc(x.why) + '</b>，用户提问将失败或排队。', btn('去处理', 'repl', null, { c: 'sm' })) : '') + dgrp('基本信息', kv([['名称', esc(x.name)], ['Slug', '<span class="mono">' + x.slug + '</span>'], ['可见性', pill(VIS[x.vis][0], VIS[x.vis][1])], ['状态', stt(s[0], s[1])], ['创建者', '张伟'], ['更新', dt(x.age)]])) + dgrp('工作区背景', '<div class="callout">你是 SourceLens 的产品文档助手，回答前先检索文档，所有结论必须附带引用……</div>');
    },
    foot: btn('保存', 'dclose', null, { k: 'btn-pri' }) + btn('取消', 'dclose') + '<span style="margin-left:auto"></span>' + btn('停用', 'toast', 'warn|助手已停用', { i: 'pause' }) };
};
DRAWERS.awiz = () => {
  const st = S.ui.wz || 1, err = scn() === 'wizard-err';
  const stepsH = '<div class="steps">' + ['基本信息', '数据范围', '模型与技能', '访问与发布'].map((n, i) => '<div class="step ' + (st === i + 1 ? 'on' : st > i + 1 ? 'done' : '') + '"><span class="sn">' + (st > i + 1 ? '✓' : i + 1) + '</span><span class="lb">' + n + '</span></div>' + (i < 3 ? '<span class="step"><span class="ln"></span></span>' : '')).join('') + '</div>';
  let b = '';
  if (st === 1) b = '<div class="fgrid">' + field('助手名称', inp(err ? '' : 'HR 制度问答', { err }), { req: 1, err: err ? '请输入助手名称' : '', full: 1 }) + field('Slug', inp('hr-policy', { mono: 1 }), { hint: '用于链接，创建后不可修改' }) + field('可见性', slt([['pri', '私有（仅被授权用户）'], ['pub', '公开（租户内所有登录用户）']], 'pri')) + field('简介', '<textarea class="txa" placeholder="一句话说明这个助手能回答什么">解答公司人事制度、假期与报销相关问题</textarea>', { full: 1, opt: 1 }) + '</div>';
  if (st === 2) b = '<div class="toolbar" style="padding:0;border:none"><label class="search" style="max-width:none">' + ic('search') + '<input placeholder="搜索知识库"></label></div>' + ['backend-api', '产品文档', '运维手册', '合同库', '飞书知识库', '客服工单'].map((n, i) => '<button class="optcard' + (i < 2 ? ' on' : '') + '" data-act="toast" data-a="info|已切换选择"><span class="cbx ' + (i < 2 ? 'on' : '') + '" style="margin-top:2px">' + ic('check') + '</span><span style="flex:1;min-width:0"><b>' + n + '</b><span>' + ['GitLab', 'GitHub', '本地文件', '飞书', 'GitLab'][i] + ' · ' + (i + 1) * 128 + ' 个文件</span></span>' + (i === 3 ? pill('同步失败', 'bad') : pill('已同步', 'ok')) + '</button>').join('') + (err ? '<div class="ferr">' + ic('warn') + '「运维手册」所在节点离线，创建后将无法检索该知识库</div>' : '') + '<div class="callout">已选 <b>2</b> 个知识库 · 预计覆盖 <b>384</b> 个文件。未选择任何知识库时，助手只能依靠模型自身知识回答。</div>';
  if (st === 3) {
    const SK = [['code', '代码检索', '官方', 'GITLAB_TOKEN'], ['doc', '文档摘要', '官方', ''], ['tbl', '表格分析', '官方', ''], ['own1', '内部流程 1', '我的', 'INTERNAL_API_KEY']];
    const on = S.ui.wzs || { code: true, doc: true }, sets = S.ui.wzv || {};
    b = '<div class="fgrid">' + field('模型', slt(MODELS, 'claude-sonnet-5-5'), { req: 1 }) + field('思考模式', slt([['fast', '快速'], ['std', '标准'], ['deep', '深度']], 'std')) + '</div>' +
      dgrp('技能', '<p class="hint" style="margin:0 0 8px">来自「平台官方」（已启用）和「我的」。需要凭证的技能，选择你自己的环境变量集；没有就新建。</p>' + SK.map(k => '<div class="wzsk"><div class="wzsk-h"><span class="thumb">' + ic('spark') + '</span><div class="sl" style="flex:1"><b>' + k[1] + '</b><small>' + (k[2] === '官方' ? '平台官方' : '本租户自建') + (k[3] ? ' · 需要 <span class="mono">' + k[3] + '</span>' : ' · 无需配置') + '</small></div>' + tgl(!!on[k[0]], 'wzsk', k[0]) + '</div>' +
        (on[k[0]] && k[3] ? '<div class="wzsk-b">' + (sets[k[0]] ? '<span class="muted">环境变量集</span><b class="mono2">' + sets[k[0]] + '</b>' + stt('已绑定', 'ok') + '<button class="btn btn-ln sm" data-act="wzvar" data-a="' + k[0] + '|">更换</button>' : '<span class="muted">环境变量集</span><button class="btn btn-gh sm" data-act="wzvar" data-a="' + k[0] + '|gitlab-prod-token">选择 gitlab-prod-token</button><button class="btn btn-ln sm" data-nav="envvars">新建变量集</button>' + stt('未绑定 · 运行时会失败', 'warn')) + '</div>' : '') + '</div>').join(''));
  }
  if (st === 4) b = (err ? banner('bad', 'warn', '<b>还有 2 项需要处理才能发布</b><ul style="margin:6px 0 0;padding-left:18px"><li>基本信息：助手名称不能为空</li><li>数据范围：「运维手册」所在节点离线</li></ul>') : '') + '<div class="opts">' + [['全部登录用户', '所有已登录账号可使用'], ['指定用户组', '仅选定的用户组']].map((o, i) => '<button class="optcard' + (i === 1 ? ' on' : '') + '"><span class="radio' + (i === 1 ? ' on' : '') + '"></span><span><b>' + o[0] + '</b><span>' + o[1] + '</span></span></button>').join('') + '</div>' + field('用户组', '<div class="tagin"><span class="tag">研发部<button class="x">' + ic('x') + '</button></span><span class="tag">运维组<button class="x">' + ic('x') + '</button></span><input placeholder="添加用户组"></div>');
  return { title: '新建助手', sub: '第 ' + st + ' / 4 步', wide: true, body: () => stepsH + b,
    foot: (st > 1 ? btn('上一步', 'wzn', '-1') : btn('取消', 'dclose')) + '<span style="margin-left:auto"></span>' + (st < 4 ? btn('下一步', 'wzn', '1', { k: 'btn-pri' }) : btn('创建助手', 'wzdone', null, { k: 'btn-pri' })) };
};
ACT.wzsk = a => { const o = Object.assign({ code: true, doc: true }, S.ui.wzs || {}); o[a] = !o[a]; S.ui.wzs = o; };
ACT.wzvar = a => { const p = a.split('|'); const o = Object.assign({}, S.ui.wzv || {}); if (p[1]) o[p[0]] = p[1]; else delete o[p[0]]; S.ui.wzv = o; };
ACT.wzn = a => { S.ui.wz = Math.max(1, Math.min(4, (S.ui.wz || 1) + +a)); };
ACT.wzdone = () => { if (scn() === 'wizard-err') { toast('bad', '还有 2 项校验未通过，请先修正'); return; } S.drawer = null; toast('ok', '助手已创建，可以开始提问了'); };

/* ═════ 节点 ═════ */
function nodeRows() {
  const n = S.scn.nodes === 'no-node' ? 0 : cnt({ few: 3, normal: 12, many: 86 }), r = rng(31);
  return Array.from({ length: n }, (_, i) => { const shared = [1, 4, 9].includes(i); const st = i === 2 ? 'offline' : i === 5 ? 'enroll' : i === 7 ? 'error' : i % 9 === 8 ? 'offline' : 'online'; return { id: 'n' + i, name: (shared ? 'shared-node-' : 'lens-node-') + String(i + 1).padStart(2, '0'), shared, kind: shared ? 'shared' : 'private', rev: i === 9, where: pick(r, ['阿里云 cn-hangzhou', '办公室机房 B1', '本地开发机', 'AWS ap-east-1']), host: pick(r, ['10.0.4.', '10.2.1.', '172.16.8.']) + int(r, 2, 250), st, dirs: int(r, 1, 8), tasks: int(r, 0, 12), run: st === 'online' ? int(r, 0, 6) : 0, q: st === 'online' ? int(r, 0, 4) : 0, ver: i === 3 || i === 9 ? '0.62.1' : '0.63.8', hb: st === 'online' ? int(r, 0, 1) : st === 'enroll' ? 9999 : 30 + int(r, 10, 600) }; });
}
const NST = { online: ['在线', 'ok'], offline: ['离线', 'bad'], enroll: ['等待接入', 'warn'], error: ['异常', 'bad'] };
page({
  id: 'nodes', grp: '管理台 · Lens', title: '节点管理', layout: 'admin', grp2: '知识库管理',
  scn: [['no-node', '无任何节点（私有 / 共享均无）'], ['revoke', '共享节点即将移除'], ['enroll-wait', '新建节点 · 等待接入'], ['enroll-ok', '新建节点 · 接入成功'], ['enroll-fail', '新建节点 · 接入超时'], ['version', '版本落后提醒']],
  notes: ['**接入进度可见**：新建节点后用时间线展示 生成令牌 → 部署 compose → 首次心跳 → 注册完成，每一步状态实时更新，超时给出排查清单（防火墙 / 镜像拉取 / 令牌过期）。', '**离线影响面**：离线节点行内显示“影响 N 个助手 / 挂起 M 个 Run”，顶部汇总横幅，直接进入受影响助手。', '**版本落后**用角标标注，并提示“升级后才支持 xxx”，避免静默不兼容。', '**部署指令一键复制**，且令牌只显示一次，关闭前二次确认。'],
  render() {
    const rows = nodeRows(), off = rows.filter(x => x.st === 'offline' || x.st === 'error');
    if (scn().startsWith('enroll') && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'nenroll', id: '', tab: '' }; }
    const ban = off.length ? banner('bad', 'wifioff', '<b>' + off.length + ' 个节点离线或异常</b>，共影响 ' + (off.length * 2) + ' 个助手，' + (off.length * 2 + 1) + ' 个运行中的 Run 已被挂起。', '<button class="btn btn-gh sm" data-act="clearall" data-a="nodes">只看异常节点</button>') : (scn() === 'version' ? banner('info', 'tag', '<b>2 个节点运行时版本落后</b>（0.62.1 → 0.63.8），升级后才支持断点续传托管转换。') : '');
    return phead('节点管理', '运行 Agent 的 LensNode 集群', btn('新建节点', 'nnew', null, { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + gate(() => listPage({
      id: 'nodes', rows, banner: ban, ph: '搜索节点名称 / 主机', searchKeys: ['name', 'host', 'where'], segs: [['online', '在线', rows.filter(x => x.st === 'online').length], ['offline', '离线', rows.filter(x => x.st === 'offline').length], ['enroll', '待接入']], segKey: 'st', filters: [{ k: 'kind', label: '类型', opts: [['private', '私有节点'], ['shared', '共享节点']] }, { k: 'ver', label: '版本', opts: [['0.63.8', '0.63.8（最新）'], ['0.62.1', '0.62.1（落后）']] }],
      cols: [{ t: '节点', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('server') + '</span><div class="cname"><span class="nm">' + x.name + '</span><span class="slug">' + x.where + ' · ' + x.host + '</span></div></div>' }, { t: '类型', w: '110px', f: x => x.shared ? pill('共享', 'acc') + (x.rev ? ' ' + pill('即将移除', 'warn') : '') : pill('私有', '') }, { t: '运行状态', w: '120px', f: x => stt(NST[x.st][0], NST[x.st][1], x.st === 'enroll') }, { t: '能力', w: '150px', hm: 1, f: x => '<span class="mono2">' + x.dirs + ' 目录 · ' + x.tasks + ' 任务</span>' }, { t: '运行中 / 排队', w: '110px', hm: 1, f: x => '<span class="mono2">' + x.run + ' / ' + x.q + '</span>' }, { t: '版本', w: '110px', f: x => '<span class="mono2">' + x.ver + '</span>' + (x.ver !== '0.63.8' ? ' ' + pill('落后', 'warn') : '') }, { t: '最近心跳', w: '100px', f: x => '<span class="muted" style="' + (x.st !== 'online' ? 'color:var(--danger)' : '') + '">' + (x.hb === 9999 ? '—' : x.hb < 1 ? '刚刚' : ago(x.hb)) + '</span>' }],
      onRow: 'drawer_node', menu: x => x.shared ? [mi('eye', '查看详情', { act: 'drawer', a: 'node|' + x.id }), mi('bot', '绑定到助手')] : [mi('eye', '查看详情', { act: 'drawer', a: 'node|' + x.id }), mi('refresh', '重启节点'), mi('copy', '复制部署指令'), '-', mi('trash', '移除节点', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'trash', title: '移除节点 ' + x.name + '？', desc: '该节点上 <b>' + x.run + '</b> 个运行中的 Run 将被中止，关联的 <b>' + x.dirs + '</b> 个工作目录会失去执行位置。', ok: '移除', then: '节点已移除' }) })],
      empty: { ic: 'server', t: '还没有接入节点', d: '节点是真正执行 Agent 的环境。你可以注册自己的私有节点（生成令牌后用 compose 一条命令部署），也可以联系平台管理员，申请使用共享节点。', btns: btn('新建节点', 'nnew', null, { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
});
ACT.drawer_node = a => openDrawer('node', a);
ACT.nnew = () => { S.ui.auto = 1; S.drawer = { kind: 'nenroll', id: '', tab: '' }; };
DRAWERS.node = id => { const x = nodeRows().find(r => r.id === id) || nodeRows()[0]; return { title: x.name, sub: x.where + ' · ' + x.host, tabs: x.shared ? [['ov', '概览'], ['bind', '使用的助手', 2]] : [['ov', '概览'], ['dirs', '工作目录', x.dirs], ['dep', '部署']], wide: true, body: t => {
  if (t === 'bind') return dgrp('本租户绑定到此节点的助手', ['基础设施运维助手', '代码库问答 · backend-api'].map(n => '<div class="prow"><span class="thumb">' + ic('bot') + '</span><span style="flex:1;min-width:0"><span class="nm">' + n + '</span></span>' + btn('改绑节点', 'toast', 'info|选择要改绑的私有或共享节点', { c: 'sm' }) + '</div>').join(''));
  if (t === 'dirs') return dgrp('工作目录', Array.from({ length: x.dirs }, (_, i) => '<div class="prow">' + ic('folder') + '<span class="mono2" style="flex:1">/data/workspaces/' + ['docs', 'backend-api', 'ops', 'hr'][i % 4] + '-' + i + '</span>' + pill(bytes(1e8 * (i + 3)), '') + '</div>').join(''));
  if (t === 'dep') return dgrp('docker-compose 部署', code('services:\n  lensnode:\n    image: registry.cn-hangzhou.aliyuncs.com/sourcelens/lensnode:0.63.8\n    environment:\n      LENSNODE_SERVER_URL: https://lens.acme.com\n      LENSNODE_ENROLL_TOKEN: ln_****************\n    restart: unless-stopped', true));
  return (x.shared ? banner(x.rev ? 'warn' : 'info', x.rev ? 'clock' : 'shield', '<b>共享节点</b>，由平台管理员维护。你可以把助手绑定到此节点，但不能修改、重启或移除它。' + (x.rev ? '<br><b>平台将在 7 天后停止对本租户开放此节点</b>，请提前把相关助手迁移到其他节点。' : '')) : '') + (x.st !== 'online' ? banner('bad', 'wifioff', '<b>节点' + NST[x.st][0] + '</b> · 最近心跳 ' + ago(x.hb) + '。请检查主机网络与 lensnode 容器日志。<br><span class="muted">影响 2 个助手：基础设施运维助手、代码库问答</span>', btn('重启', 'toast', 'info|已下发重启指令', { c: 'sm' })) : '') + dgrp('状态', kv([['运行状态', stt(NST[x.st][0], NST[x.st][1])], ['运行时 / 协议', '<span class="mono">' + x.ver + ' / v3</span>'], ['运行中 / 排队', x.run + ' / ' + x.q], ['最近心跳', x.hb === 9999 ? '—' : ago(x.hb)]])) + dgrp('近 1 小时负载', H.lineChart({ labels: Array.from({ length: 12 }, (_, i) => i * 5 + 'm'), series: [{ name: '运行中 Run', color: 'var(--c1)', data: Array.from({ length: 12 }, (_, i) => (i * 3 + x.run) % 7) }], h: 140, area: 1 }));
}, foot: btn('关闭', 'dclose') }; };
DRAWERS.nenroll = () => { const sc = scn(), ok = sc === 'enroll-ok', fail = sc === 'enroll-fail'; return { title: '新建节点', sub: '生成令牌 → 部署 → 等待首次心跳', wide: true, body: () =>
  banner('info', 'key', '令牌只显示一次，<b>关闭此页面后将无法再次查看</b>。24 小时内未接入则自动失效。') + field('节点名称', inp('lens-node-13')) + dgrp('时间线', '<div class="tl">' + [['生成接入令牌', '已完成', 'ok', 'check'], ['部署 compose', ok || fail ? '已检测到容器拉取镜像' : '等待你在目标机器上执行下方命令', ok || fail ? 'ok' : 'acc', ok || fail ? 'check' : 'clock'], ['首次心跳', ok ? '2 秒前收到心跳' : fail ? '超过 10 分钟未收到心跳' : '尚未收到', ok ? 'ok' : fail ? 'bad' : '', ok ? 'check' : fail ? 'x' : 'clock'], ['注册完成', ok ? '节点在线，可被助手使用' : '—', ok ? 'ok' : '', ok ? 'check' : 'clock']].map(s => '<div class="tli"><span class="tdot ' + s[2] + '">' + ic(s[3]) + '</span><div><b>' + s[0] + '</b><span>' + s[1] + '</span></div></div>').join('') + '</div>') +
  (fail ? banner('bad', 'warn', '<b>接入超时</b>，常见原因：<ul style="margin:6px 0 0;padding-left:18px"><li>目标机器无法访问 <span class="mono">lens.acme.com:443</span>（防火墙 / 代理）</li><li>镜像拉取失败（私有仓库未登录）</li><li>令牌已过期，需重新生成</li></ul>', btn('重新生成令牌', 'toast', 'ok|已生成新令牌', { c: 'sm' })) : '') + dgrp('部署指令', code('docker compose up -d\n# LENSNODE_ENROLL_TOKEN=ln_9f31…c2a7', true)), foot: (ok ? btn('完成', 'dclose', null, { k: 'btn-pri' }) : btn('取消', 'dclose') + '<span class="dnote" style="margin-left:auto">' + (fail ? '' : '<span class="spin2"></span> 等待节点心跳…') + '</span>') }; };

/* ═════ 知识库 ═════ */
const DSTYPE = { github: ['GitHub', 'branch'], gitlab: ['GitLab', 'branch'], feishu: ['飞书', 'file'], upload: ['手动上传', 'upload'] };
function dsRows() {
  const R = H.REAL, kb = [];
  R.conns.forEach(c => c.kbs.forEach(k => kb.push({ name: k, type: c.plugin === 'feishu' ? 'feishu' : c.plugin, conn: c.name })));
  R.uploadKbs.forEach(k => kb.push({ name: k, type: 'upload', conn: '' }));
  const n = cnt({ few: 3, normal: kb.length, many: 240 }), r = rng(41);
  return Array.from({ length: n }, (_, i) => { const b = kb[i % kb.length], t = b.type; const st = scn() === 'quota' && false ? 'ok' : i === 1 ? 'fail' : i === 3 ? 'syncing' : i === 6 ? 'cred' : i === 8 ? 'never' : i === 10 ? 'paused' : 'ok';
    return { id: 'd' + i, name: b.name + (i >= kb.length ? ' ' + (i + 1) : ''), type: t, conn: b.conn, st, repo: t === 'gitlab' || t === 'github' ? '（仓库路径）' : t === 'upload' ? '手动上传' : '飞书空间 / 目录', branch: t === 'gitlab' || t === 'github' ? 'main' : '—', policy: pick(r, ['每小时', '每天 02:00', '手动', '每 6 小时']), files: int(r, 4, 9000), size: int(r, 1e6, 4e9), age: int(r, 5, 9000), pct: 38 }; });
}
const DST = { ok: ['已同步', 'ok'], fail: ['同步失败', 'bad'], syncing: ['同步中', 'acc'], cred: ['凭证过期', 'bad'], never: ['从未同步', ''], paused: ['已暂停', ''] };
page({
  id: 'datasources', grp: '管理台 · Lens', title: '知识库', layout: 'admin', grp2: 'Lens 运营',
  scn: [['syncing', '多个同步进行中'], ['quota', '存储空间超额'], ['bulk-pol', '批量改同步策略'], ['form', '新建向导 · 选择来源'], ['no-conn', '新建向导 · 该来源还没有连接'], ['conn-bad', '新建向导 · 现有连接已失效'], ['form-err', '新建向导 · 内容校验失败']],
  notes: ['**同步设置在每个知识库自己的详情里**（同步频率、失败重试、单文件上限、是否跳过未改动文件）；全站统一的上传并发数、存储配额由平台管理员在「全局配置 → 上传与存储」设置，租户没有“同步设置”菜单。', '**批量操作**（表格视图）：立即同步 / **重试失败项**（凭证过期的会被跳过并提示去更新凭证）/ **改同步策略**（手动上传类自动跳过）/ 暂停 / **恢复** / 删除。卡片视图旁有“批量操作（表格）”入口。', '**只有一层标签**：「我的知识库」/「知识库来源」/「连接」。列表里不再有类型标签和搜索，只保留“只看需处理”开关与卡片 / 表格切换。**首次进来（还没有知识库）默认打开「知识库来源」，配置之后默认打开「我的知识库」**。顶部只有一条窄栏（说明 + 数量 + 空间）。', '**先有连接，再有知识库**：新建向导 4 步——选来源 → 连接（选已有连接或新建；手动上传无需连接，自动跳过）→ 选内容 → 同步策略。该来源还没有连接时，直接引导新建；现有连接都失效时给出提示，选中失效连接不能继续。', '**连接放在知识库里**：「连接」视图集中管理凭证（按服务商分类、需处理置前），凭证只配一次、多个知识库共用；知识库来源上标明每种来源“已有 N 个可用连接 / 需先添加连接”。', '**目录与已配置分开**：「我的知识库」只放已接入的（卡片 / 表格、按类型与状态筛选）；「知识库来源」列出可接入的资料来源（GitHub / GitLab / 飞书 / 手动上传），点“接入”直接进入该类型的配置步骤。点菜单进入页面不会弹出任何新建窗口。', '**同步状态一眼可辨**：已同步 / 同步中（进度条）/ 失败 / 凭证过期 / 转换中断 / 暂停，失败原因直接出现在行内而不是藏在详情里。', '**凭证过期**直接跳转“更新凭证”。', '**存储用量**使用实测值，超额前 80% 预警，超额后阻止新增并指引清理。', '**文件清单**：单根目录自动展开；超大目录虚拟滚动 + 搜索，避免一次渲染上万行。', '**新建**为类型卡片优先：先选来源 → 再填连接（带校验与“如何获取 Token”指引）→ 范围 → 同步策略。'],
  render() {
    let rows = dsRows();
    if (scn() === 'syncing') rows = rows.map((x, i) => i % 3 === 0 ? Object.assign({}, x, { st: 'syncing', pct: 20 + i * 7 % 70 }) : x);
    if (['form', 'form-err', 'no-conn', 'conn-bad'].includes(scn()) && !S.ui.auto) { S.ui.auto = 1; S.ui.dsty = scn() === 'form' ? '' : 'gitlab'; S.ui.dsf = scn() === 'form' ? 1 : scn() === 'form-err' ? 3 : 2; S.ui.dsconn = ''; S.drawer = { kind: 'dsform', id: '', tab: '' }; }
    if (scn() === 'bulk-pol' && !S.ui.auto) { S.ui.auto = 1; S.ui.dsv = 'table'; S.tbl.ds = Object.assign(H.T('ds'), { sel: rows.slice(0, 4).map(x => x.id) }); S.ui.bpol = '每天 02:00'; S.dialog = { html: bulkPolHTML(), side: true }; }
    const used = scn() === 'quota' ? 52.4 : 31.2, cap = 50;
    const bad = rows.filter(x => ['fail', 'cred'].includes(x.st)).length, filesTotal = rows.reduce((n, x) => n + x.files, 0), dsv = S.ui.dsv || 'card';
    const store = '<div class="hub-bar"><span class="hub-bar-i">' + ic('db') + '</span><div class="hub-bar-t"><b>知识库：让助手读懂你的资料</b><span>一个知识库对应一份资料来源，同步后助手即可带引用回答</span></div><div class="hub-bar-s"><span class="hub-bar-c"><b>' + rows.length + '</b>知识库</span><span class="hub-bar-c"><b>' + fmt(filesTotal) + '</b>可检索文件</span><span class="hub-bar-c"><b' + (bad ? ' style="color:var(--danger)"' : '') + '>' + bad + '</b>同步异常</span><span class="hub-bar-c"><b class="mono" style="font-size:13px">' + used + ' / ' + cap + ' GB</b>空间<small style="color:var(--warn)"> · 待后端</small></span></div></div>';
    const SRC = { github: ['公开或私有仓库、组织 / 用户命名空间', '代码与文档'], gitlab: ['私有或公开仓库、Group / 项目命名空间', '代码与文档'], feishu: ['飞书文档或云盘（Drive）目录', '文档、表格'], upload: ['直接上传文件，最快上手', 'PDF / Office / Markdown / 图片'] };
    const catalog = '<div class="mk-h"><h3>知识库来源<span class="n">' + Object.keys(DSTYPE).length + '</span></h3><span class="muted" style="font:400 13px var(--f)">选一种知识库来源接入：需要登录的先选 / 建连接，再选内容</span></div><div class="hub-grid">' + Object.keys(DSTYPE).map(k => { const n = rows.filter(x => x.type === k).length, c = H.MKX ? H.MKX.tone(DSTYPE[k][0]) : ['#e8efff', '#4a68d8']; return '<div class="hub-card" data-act="dsnew" data-a="' + k + '" role="button" tabindex="0"><div class="hub-top"><span class="hub-tile" style="background:linear-gradient(135deg,' + c[0] + ',#fff);color:' + c[1] + '">' + ic(DSTYPE[k][1]) + '</span><span class="hub-tx"><b>' + DSTYPE[k][0] + '</b><span class="hub-tag">资料来源</span></span>' + (n ? '<span class="pill">已接入 ' + n + '</span>' : '') + '</div><p class="hub-d">' + SRC[k][0] + '</p><div class="hub-q">' + ic('file') + '<span>可检索：' + SRC[k][1] + '</span></div><div class="hub-f"><span class="muted">' + (!DSPROV[k] ? '无需连接' : (k === 'feishu' ? '' : '公开仓库免连接 · ') + (dsConns(k).filter(x => x.st === 'ok').length ? '已有 ' + dsConns(k).filter(x => x.st === 'ok').length + ' 个可用连接' : '私有需添加连接')) + '</span><button class="btn btn-pri sm" data-act="dsnew" data-a="' + k + '" data-stop>＋ 接入</button></div></div>'; }).join('') + '</div>';
    const dsw = S.ui.dsw || (rows.length ? 'mine' : 'catalog');
    const viewH = '<div class="cn-tabs" role="tablist"><button class="' + (dsw === 'mine' ? 'on' : '') + '" role="tab" data-act="dsw" data-a="mine">我的知识库<span class="n">' + rows.length + '</span></button><button class="' + (dsw === 'catalog' ? 'on' : '') + '" role="tab" data-act="dsw" data-a="catalog">知识库来源<span class="n">' + Object.keys(DSTYPE).length + '</span></button><a class="lnk" data-act="nav2" data-a="connectors" style="margin-left:auto;align-self:center;cursor:pointer;text-decoration:underline">管理连接 ›</a></div>';
    const vt = '<div class="mk-h" style="margin-top:6px"><span class="muted" style="font:400 13px var(--f)">已接入的资料来源，同步异常的排在前面</span><div style="margin-left:auto;display:flex;gap:10px;align-items:center">' + (dsv === 'card' ? '<button class="btn btn-gh sm" data-act="dsview" data-a="table">' + ic('list') + '批量操作（表格）</button>' : '') + '<button class="btn btn-ln sm' + (S.ui.dst === 'bad' ? ' on' : '') + '" data-act="dstab" data-a="' + (S.ui.dst === 'bad' ? 'all' : 'bad') + '">' + ic('warn') + '只看需处理（' + bad + '）</button><div class="segs"><button class="seg' + (dsv === 'card' ? ' on' : '') + '" data-act="dsview" data-a="card">卡片</button><button class="seg' + (dsv === 'table' ? ' on' : '') + '" data-act="dsview" data-a="table">表格</button></div></div></div>';
    const order = { fail: 0, cred: 0, syncing: 1, never: 2, paused: 3, ok: 4 }, lim = S.ui.dsmore ? 999 : 9, tab = S.ui.dst || 'all', dq = (S.ui.dsq || '').toLowerCase(), isBad = x => ['fail', 'cred'].includes(x.st);
    const tabsDef = [['all', '全部', rows.length], ['bad', '需处理', rows.filter(isBad).length]].concat(Object.keys(DSTYPE).map(k => [k, DSTYPE[k][0], rows.filter(x => x.type === k).length]));
    const tabsH = '';
    const shown = rows.filter(x => (tab === 'all' ? true : tab === 'bad' ? isBad(x) : x.type === tab) && (!dq || (x.name + x.repo).toLowerCase().includes(dq)));
    const cards = '<div class="hub-grid">' + shown.slice().sort((x, y) => order[x.st] - order[y.st]).slice(0, lim).map(x => { const bd = isBad(x); return '<div class="hub-card' + (bd ? ' bad' : '') + '" data-act="drawer_ds" data-a="' + x.id + '" role="button" tabindex="0"><div class="hub-top"><span class="hub-tile"' + ' style="background:var(--chip);color:var(--fg2)">' + ic(DSTYPE[x.type][1]) + '</span><span class="hub-tx"><b>' + esc(x.name) + '</b><small class="trunc">' + DSTYPE[x.type][0] + ' · ' + esc(x.repo) + '</small></span></div>' + (x.st === 'syncing' ? '<div><div style="display:flex;justify-content:space-between;font:500 12px var(--m);margin-bottom:5px"><span>同步中</span><span>' + (x.pct || 38) + '%</span></div>' + bar(x.pct || 38) + '</div>' : '<div>' + stt(DST[x.st][0], DST[x.st][1]) + '</div>') + '<div class="hub-q">' + ic('file') + '<span>' + fmt(x.files) + ' 个文件可被检索 · ' + bytes(x.size) + '</span></div><div class="hub-f"><span class="muted">' + (x.st === 'never' ? '尚未同步' : '最近同步 ' + ago(x.age)) + ' · ' + x.policy + '</span>' + (bd ? '<button class="btn btn-pri sm" data-act="toast" data-a="ok|已开始重试同步" data-stop>重试</button>' : '<button class="btn btn-ln sm" data-act="toast" data-a="ok|已开始同步" data-stop' + (x.st === 'syncing' ? ' disabled' : '') + '>立即同步</button>') + '</div></div>'; }).join('') + '</div>' + (shown.length > lim ? '<div style="text-align:center;margin-top:12px"><button class="btn btn-gh" data-act="dsmoreb">显示更多（' + (shown.length - lim) + '）</button></div>' : '');
    const cardsAll = tabsH + (shown.length ? cards : H.empty({ sm: true, ic: 'search', t: '没有匹配的知识库', d: '换个关键词，或切换标签。', btns: btn('清除筛选', 'dsclr', null, { c: 'sm' }) }));
    const ban = scn() === 'quota' ? banner('bad', 'archive', '<b>存储空间已超额（52.4 / 50 GB）</b>。新建知识库与同步已被暂停，请清理文件或联系管理员扩容。', btn('查看占用 Top 5', 'toast', 'info|已按占用排序', { c: 'sm' })) : rows.some(x => x.st === 'cred') ? banner('warn', 'key', '<b>1 个知识库凭证已过期</b>，同步已停止。', btn('更新凭证', 'nav2', 'connectors', { c: 'sm' })) : '';
    return phead('知识库', '助手回答问题时检索的资料，每个知识库对应一份资料来源', btn('新建知识库', 'dsnew', null, { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + gate(() => store + viewH + (dsw === 'catalog' ? '<section class="mk-sec">' + catalog + '</section>' : (S.scale === 'empty' ? '' : vt) + (S.scale !== 'empty' && dsv === 'card' ? (ban || '') + cardsAll : listPage({
      id: 'ds', rows, banner: ban, ph: '搜索知识库 / 仓库', searchKeys: ['name', 'repo'], segs: [['ok', '正常', rows.filter(x => x.st === 'ok').length], ['syncing', '同步中', rows.filter(x => x.st === 'syncing').length], ['fail', '失败', rows.filter(x => x.st === 'fail').length]], segKey: 'st', filters: [{ k: 'type', label: '类型', opts: Object.keys(DSTYPE).map(k => [k, DSTYPE[k][0]]) }, { k: 'policy', label: '策略', opts: [['每小时', '每小时'], ['每天 02:00', '每天 02:00'], ['手动', '手动']] }],
      cols: [{ t: '知识库', w: 'minmax(0,2.2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic(DSTYPE[x.type][1]) + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + DSTYPE[x.type][0] + ' · ' + x.repo + '</span></div></div>' }, { t: '同步', w: '150px', f: x => x.st === 'syncing' ? '<div style="width:110px"><div style="display:flex;justify-content:space-between;font:500 11px var(--m);margin-bottom:4px"><span>同步中</span><span>' + x.pct + '%</span></div>' + bar(x.pct) + '</div>' : stt(DST[x.st][0], DST[x.st][1]) }, { t: '策略', w: '100px', hm: 1, f: x => '<span class="muted">' + x.policy + '</span>' }, { t: '文件 / 占用', w: '130px', hm: 1, f: x => '<span class="mono2">' + fmt(x.files) + ' · ' + bytes(x.size) + '</span>' }, { t: '最近同步', w: '100px', f: x => '<span class="muted">' + (x.st === 'never' ? '—' : ago(x.age)) + '</span>', sk: 'age' }],
      onRow: 'drawer_ds', menu: x => [mi('eye', '详情', { act: 'drawer', a: 'ds|' + x.id }), mi('refresh', '立即同步', { dis: x.st === 'syncing' }), mi('pause', x.st === 'paused' ? '恢复' : '暂停'), mi('key', '更新凭证', { act: 'nav2', a: 'connectors' }), '-', mi('trash', '删除', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'trash', title: '删除知识库「' + x.name + '」？', desc: '将删除其 <b>' + fmt(x.files) + '</b> 个已索引文件（' + bytes(x.size) + '）。<b>3 个助手</b>正在使用它，删除后这些助手将无法再检索该数据。', ok: '删除', then: '知识库已删除' }) })],
      bulk: [{ i: 'refresh', t: '立即同步' }, { i: 'refresh', t: '重试失败项', act: 'dsretry' }, { i: 'sliders', t: '改同步策略', act: 'dspol' }, { i: 'pause', t: '暂停' }, { i: 'play', t: '恢复', act: 'dsresume' }, { i: 'trash', t: '删除', bad: 1 }], empty: { ic: 'db', t: '还没有知识库', d: '接入 GitHub、GitLab、飞书，或直接上传文件，助手才能基于你的资料回答。', btns: btn('浏览知识库来源', 'dsw', 'catalog', { k: 'btn-pri', i: 'search' }) },
    }))), 'list');
  },
});
ACT.drawer_ds = a => openDrawer('ds', a);
const dsSelected = () => { const rows = dsRows(); return H.bsel('ds').map(id => rows.find(r => r.id === id)).filter(Boolean); };
ACT.dsretry = () => {
  const sel = dsSelected(), f = sel.filter(x => x.st === 'fail').length, c = sel.filter(x => x.st === 'cred').length;
  if (f) H.bdone('ds', '已重新触发 ' + f + ' 个失败项的同步' + (c ? '；' + c + ' 个因凭证过期已跳过，请先到「连接」更新凭证' : '') + (sel.length - f - c ? '；其余 ' + (sel.length - f - c) + ' 个不是失败状态，已跳过' : ''));
  else H.bdone('ds', c ? '所选里只有凭证过期的 ' + c + ' 个，请先到「连接」更新凭证后再重试' : '所选知识库里没有失败项', c ? 'warn' : 'info');
};
ACT.dsresume = () => {
  const sel = dsSelected(), p = sel.filter(x => x.st === 'paused').length;
  H.bdone('ds', p ? '已恢复 ' + p + ' 个知识库的同步' + (sel.length - p ? '；' + (sel.length - p) + ' 个本来就没暂停，已跳过' : '') : '所选知识库里没有已暂停的', p ? 'ok' : 'info');
};
function bulkPolHTML() {
  const sel = dsSelected(), up = sel.filter(x => x.type === 'upload').length, n = sel.length - up, p = S.ui.bpol || '每天 02:00';
  const cards = ['每小时', '每 6 小时', '每天 02:00', '仅手动'].map(k => '<button class="optcard' + (p === k ? ' on' : '') + '" data-act="bpolsel" data-a="' + k + '"><span class="radio' + (p === k ? ' on' : '') + '"></span><span><b>' + k + '</b></span></button>').join('');
  return H.bdlg('批量改同步策略 · ' + sel.length + ' 个知识库', 'sliders', '<div class="sp-lead">把所选知识库的同步频率统一改成：</div><div class="opts">' + cards + '</div>' + (up ? banner('info', 'info', '<b>手动上传类知识库不适用</b>，其中 ' + up + ' 个会被自动跳过，实际修改 ' + n + ' 个。') : '') + (p === '每小时' ? '<div class="hint">同步越频繁，节点与外部服务的压力越大；仓库较大时建议用“每 6 小时”或“每天”。</div>' : ''), bcancel + '<button class="btn btn-pri" data-act="bpolgo">应用到 ' + n + ' 个知识库</button>');
}
ACT.dspol = () => { S.ui.bpol = '每天 02:00'; S.dialog = { html: bulkPolHTML(), side: true }; };
ACT.bpolsel = a => { S.ui.bpol = a; S.dialog = { html: bulkPolHTML(), side: true }; };
ACT.bpolgo = () => { const sel = dsSelected(), n = sel.filter(x => x.type !== 'upload').length; H.bdone('ds', '已将 ' + n + ' 个知识库的同步策略改为「' + (S.ui.bpol || '每天 02:00') + '」' + (sel.length - n ? '；' + (sel.length - n) + ' 个手动上传类已跳过' : '')); };
ACT.dsw = a => { S.ui.dsw = a; };
ACT.dsview = a => { S.ui.dsv = a; };
ACT.dstab = a => { S.ui.dst = a; S.ui.dsmore = false; };
ACT.dsclr = () => { S.ui.dsq = ''; S.ui.dst = 'all'; };
INP.dsq = v => { S.ui.dsq = v; };
ACT.dsmoreb = () => { S.ui.dsmore = true; };
ACT.dsnew = a => { S.ui.auto = 1; S.ui.dsf = !a ? 1 : DSPROV[a] ? 2 : 3; S.ui.dsty = a || ''; S.ui.dsconn = ''; S.drawer = { kind: 'dsform', id: '', tab: '' }; };
DRAWERS.ds = id => { const x = dsRows().find(r => r.id === id) || dsRows()[0]; const files = [['docs', 0, 1], ['README.md', 1, 0, 3400], ['getting-started.md', 1, 0, 8100], ['api', 1, 1], ['auth.md', 2, 0, 12300], ['deploy.md', 1, 0, 6200]]; return { title: esc(x.name), sub: DSTYPE[x.type][0] + ' · ' + x.repo, tabs: [['b', '基本信息'], ['s', '同步记录', 12], ['f', '文件清单', fmt(x.files)]], wide: true, body: t => {
  if (t === 's') return '<div class="tl">' + [['同步完成', '新增 12 · 更新 3 · 删除 0 · 耗时 42s', 'ok', 'check', 120], [x.st === 'cred' ? '同步失败：401 invalid_token' : '同步完成', x.st === 'cred' ? '凭证已于 2026-11-02 过期' : '无变更，跳过未改动文件（节省 98%）', x.st === 'cred' ? 'bad' : 'ok', x.st === 'cred' ? 'x' : 'check', 1560], ['同步完成', '新增 3 · 更新 1', 'ok', 'check', 3000], ['同步部分失败', '2 个文件超过 25 MB 已跳过', 'warn', 'warn', 4500]].map(s => '<div class="tli"><span class="tdot ' + s[2] + '">' + ic(s[3]) + '</span><div><b>' + s[0] + '</b><span>' + s[1] + '</span><br><time>' + dt(s[4]) + '</time></div></div>').join('') + '</div>';
  if (t === 'f') return '<label class="search" style="max-width:none">' + ic('search') + '<input placeholder="搜索 ' + fmt(x.files) + ' 个文件"></label><div class="tree">' + files.map(f => '<div class="tn" style="padding-left:' + (8 + f[1] * 18) + 'px">' + ic(f[2] ? 'folder' : 'file') + esc(f[0]) + (f[3] ? '<span class="sz">' + bytes(f[3]) + '</span>' : '') + '</div>').join('') + '</div>' + (x.files > 1000 ? '<div class="hint">仅渲染可见区域（虚拟滚动），共 ' + fmt(x.files) + ' 个文件。</div>' : '');
  return (x.st === 'cred' ? banner('bad', 'key', '<b>凭证已过期</b>，同步已停止。', btn('更新凭证', 'nav2', 'connectors', { c: 'sm' })) : '') + dgrp('空间占用', '<div style="display:flex;justify-content:space-between;font:500 12px var(--f)"><span>' + bytes(x.size) + '</span><span class="muted">' + fmt(x.files) + ' 个文件</span></div>' + bar(Math.min(95, x.size / 4e9 * 100))) + dgrp('配置', kv([['类型', DSTYPE[x.type][0]], ['仓库 / 文档', '<span class="mono">' + esc(x.repo) + '</span>'], ['分支', x.branch], ['同步策略', x.policy], ['目标路径', '<span class="mono">/data/' + x.name + '</span>'], ['使用它的助手', '3 个']])) + dgrp('同步设置（仅此知识库）', '<div class="fgrid">' + (x.type === 'upload' ? '' : field('同步频率', slt(['每小时', '每 6 小时', '每天 02:00', '仅手动'], x.policy === '手动' ? '仅手动' : x.policy)) + field('失败自动重试次数', inp('3', { mono: 1 }), { hint: '超过后标记为同步失败并通知' })) + field('单文件大小上限（MB）', inp('25', { mono: 1 }), { hint: '超过将被跳过并记录' }) + field('同步时跳过未改动文件', slt(['是（推荐）', '否'], '是（推荐）'), { hint: '基于内容哈希，显著缩短同步耗时' }) + '</div>');
}, foot: btn('立即同步', 'toast', 'ok|已开始同步', { k: 'btn-pri', i: 'refresh' }) + btn('保存设置', 'toast', 'ok|同步设置已保存') + btn('关闭', 'dclose') }; };
const DSPROV = { github: 'GitHub', gitlab: 'GitLab', feishu: '飞书' };
const DSSTEP = ['选择来源', '连接', '选择内容', '同步策略'];
function dsConns(k) {
  const p = DSPROV[k];
  if (!p || !H.MKX || S.scale === 'empty') return [];
  let r = H.MKX.connRows().filter(x => x.p === p);
  if (scn() === 'no-conn') r = [];
  if (scn() === 'conn-bad') r = r.map(x => Object.assign({}, x, { st: 'bad' }));
  return r;
}
function dsSel(k) { const cs = dsConns(k), ok = cs.find(x => x.st === 'ok'); return S.ui.dsconn || (ok ? ok.id : 'new'); }
const DSHINT = { github: '公开或私有仓库、组织', gitlab: '私有或公开仓库、Group', feishu: '云文档与云盘目录', upload: '直接上传文件，无需连接' };
DRAWERS.dsform = () => {
  const st = S.ui.dsf || 1, k = S.ui.dsty || '', err = scn() === 'form-err', prov = DSPROV[k], T3 = k ? DSTYPE[k][0] : '';
  const bar_ = '<div class="steps" style="margin-bottom:16px">' + DSSTEP.map((n, i) => { const skip = i === 1 && k && !prov; return '<div class="step ' + (st === i + 1 ? 'on' : st > i + 1 || skip ? 'done' : '') + '"><span class="sn">' + (st > i + 1 || skip ? '✓' : i + 1) + '</span><span class="lb">' + (skip ? '连接（无需）' : n) + '</span>' + (i < 3 ? '<span class="ln"></span>' : '') + '</div>'; }).join('') + '</div>';
  return { title: '新建知识库' + (k ? ' · ' + T3 : ''), sub: '第 ' + st + ' / 4 步 · ' + DSSTEP[st - 1], wide: true, body: () => {
    if (st === 1) {
      return bar_ + '<div class="sp-lead">知识库来自一份资料来源。<b>私有的 GitHub / GitLab 仓库和飞书需要先有一个连接</b>（鉴权信息只配一次，多个知识库共用）；公开仓库和手动上传不需要。</div><div class="opts">' + Object.keys(DSTYPE).map(t => { const n = dsConns(t).filter(x => x.st === 'ok').length, p = DSPROV[t]; return '<button class="optcard' + (t === k ? ' on' : '') + '" data-act="dsnew" data-a="' + t + '"><span class="thumb ' + (t === k ? 'acc' : '') + '">' + ic(DSTYPE[t][1]) + '</span><span><b>' + DSTYPE[t][0] + '</b><span>' + DSHINT[t] + ' · ' + (!p ? '无需连接' : n ? '已有 ' + n + ' 个可用连接' : '需先添加连接') + '</span></span></button>'; }).join('') + '</div>';
    }
    if (st === 2) {
      if (!prov) return bar_ + banner('ok', 'okc', '<b>' + T3 + '</b>无需连接，直接进入下一步。');
      const cs = dsConns(k), sel = dsSel(k), cur = cs.find(x => x.id === sel);
      const list = cs.map(x => '<button class="optcard' + (sel === x.id ? ' on' : '') + '" data-act="dsconn" data-a="' + x.id + '"><span class="thumb ' + (sel === x.id ? 'acc' : '') + '">' + ic('key') + '</span><span><b>' + esc(x.name) + '</b><span>' + esc(x.url) + ' · ' + esc(x.auth) + ' · 已用于 ' + x.ds.length + ' 个知识库</span></span>' + stt(x.st === 'ok' ? '有效' : x.st === 'bad' ? '校验失败' : '已过期', x.st === 'ok' ? 'ok' : 'bad') + '</button>').join('');
      const pub = k === 'feishu' ? '' : '<button class="optcard' + (sel === 'public' ? ' on' : '') + '" data-act="dsconn" data-a="public"><span class="thumb ' + (sel === 'public' ? 'acc' : '') + '">' + ic('eye') + '</span><span><b>公开访问（无需连接）</b><span>仅同步公开仓库，不需要任何鉴权信息</span></span></button>';
      const add = '<button class="optcard' + (sel === 'new' ? ' on' : '') + '" data-act="dsconn" data-a="new"><span class="thumb ' + (sel === 'new' ? 'acc' : '') + '">' + ic('plus') + '</span><span><b>新建 ' + prov + ' 连接</b><span>填写你自己的凭证，保存后可被多个知识库复用</span></span></button>';
      const head = !cs.length ? banner('warn', 'key', '<b>还没有 ' + prov + ' 连接</b>。' + (k === 'feishu' ? '先添加一个才能选择要接入的内容' : '同步私有仓库需要先添加一个；公开仓库可选“公开访问”') + '；之后再建其他 ' + prov + ' 知识库可直接复用。') : cs.every(x => x.st !== 'ok') ? banner('bad', 'warn', '<b>现有 ' + prov + ' 连接都已失效</b>。请新建一个，或到「连接」里替换凭证。') : '<div class="sp-lead">选择一个已有连接，或新建一个。</div>';
      const form = sel === 'new' ? '<div class="fgrid">' + field('连接名称', inp(prov.toLowerCase() + '-acme')) + field('Base URL', inp(k === 'gitlab' ? 'https://gitlab.acme.com' : k === 'github' ? 'https://api.github.com' : k === 'feishu' ? 'https://open.feishu.cn' : 'https://acme.atlassian.net', { mono: 1 })) + field('凭证（' + ((H.MKX.PROV.find(p => p[0] === prov) || ['', 'API Token'])[1]) + '）', '<div class="inwrap"><input class="inp mono" type="password" value="xxxxxxxxxxxxxxxx"><button class="qbtn eye">' + ic('eye') + '</button></div>', { full: 1, hint: '凭证加密存储，保存后不再显示明文' }) + '</div>' + dgrp('如何获取凭证', '<ol style="margin:0;padding-left:20px;font:400 12.5px/1.9 var(--f);color:var(--fg2)"><li>登录 ' + prov + '，进入个人设置 / 开发者页面</li><li>创建一个只读凭证，勾选读取内容所需的 scope</li><li>复制凭证粘贴到上方，点「下一步」时会自动校验</li></ol>') : '';
      const warn = cur && cur.st !== 'ok' ? banner('bad', 'warn', '<b>该连接校验失败</b>，不能用于创建知识库。请选其他连接、新建一个，或到「连接」里替换凭证。') : '';
      return bar_ + head + '<div class="opts">' + list + pub + add + '</div>' + warn + form;
    }
    if (st === 3) {
      const cs = dsConns(k), sel = dsSel(k), cur = cs.find(x => x.id === sel), via = prov ? '<div class="sp-lead">' + (sel === 'public' ? '以<b>公开访问</b>读取内容，无需鉴权信息。' : '通过连接「<b>' + (cur ? esc(cur.name) : prov.toLowerCase() + '-acme（新）') + '</b>」读取内容。') + '</div>' : '';
      const nm = field('知识库名称', inp({ gitlab: 'backend-api', github: 'web-console', feishu: '产品文档', upload: '合同库' }[k] || ''), { req: 1, full: 1 });
      let f;
      if (k === 'gitlab' || k === 'github') f = field('仓库', inp(err ? 'acme/not-exist' : 'acme/backend-api', { err, mono: 1 }), { req: 1, err: err ? '无法访问该仓库：404 或凭证缺少读取权限' : '', full: 1 }) + field('分支', inp('main')) + field('目标路径', inp('/data/backend-api', { mono: 1 }));
      else if (k === 'feishu') f = field('云文档空间 / 目录', slt(['产品文档空间', '研发知识库', '运维手册'], '产品文档空间'), { full: 1 }) + field('目标路径', inp('/data/feishu-docs', { mono: 1 }), { full: 1 });
      else if (k === 'upload') f = '<div class="uploadzone" style="grid-column:1/-1">' + ic('upload') + '<b>拖拽文件到此处，或点击选择</b><span class="muted">支持 PDF / Office / Markdown / 图片 / ZIP</span></div>';
      return bar_ + via + '<div class="fgrid">' + nm + f + '</div>' + (prov ? (err ? banner('bad', 'key', '<b>内容校验失败</b>。请检查仓库地址或连接权限。') : banner('ok', 'okc', (sel === 'public' ? '公开仓库可访问' : '连接可用') + '，可访问 184 个文件。')) : '');
    }
    return bar_ + '<div class="fgrid">' + field('同步策略', slt(k === 'upload' ? ['手动'] : ['每小时', '每天 02:00', '手动'], k === 'upload' ? '手动' : '每天 02:00')) + field('冲突处理', slt(['以远端为准', '保留本地']), '以远端为准') + '</div>' + field('忽略规则', '<textarea class="txa mono" style="font-family:var(--m);font-size:12px">node_modules/\n*.min.js\n*.psd</textarea>', { hint: '每行一条，支持 gitignore 语法。超过 25 MB 的文件默认跳过。' });
  }, foot: (st > 1 ? btn('上一步', 'dsfn', String(st === 3 && k && !prov ? 1 : st - 1)) : btn('取消', 'dclose')) + '<span style="margin-left:auto"></span>' + (st === 1 ? '' : st < 4 ? btn('下一步', 'dsfn', String(st === 2 && !prov ? 3 : st + 1), { k: 'btn-pri' }) : btn('创建并同步', 'toast', 'ok|知识库已创建，开始首次同步', { k: 'btn-pri' })) };
};
ACT.dsfn = a => {
  const to = +a, k = S.ui.dsty || '';
  if ((S.ui.dsf || 1) === 2 && to === 3 && DSPROV[k]) {
    const sel = dsSel(k), c = dsConns(k).find(x => x.id === sel);
    if (c && c.st !== 'ok') { toast('bad', '该连接校验失败，请选择其他连接或新建一个'); return; }
    if (sel === 'new') toast('ok', '连接已保存并校验通过');
  }
  S.ui.dsf = to;
};
ACT.dsconn = a => { S.ui.dsconn = a; };

/* ═════ 连接 / Skill / MCP ═════ */
function simpleList(o) { return phead(o.title, o.sub, o.acts, S.scale === 'empty' ? null : o.rows.length) + gate(() => listPage(o), 'list'); }
page({
  id: 'connections', grp: '管理台 · Lens', title: '连接', layout: 'admin', grp2: '知识库管理',
  scn: [['form', '新建鉴权 · 带指引'], ['verify-fail', '校验失败']],
  notes: ['**校验是一等公民**：每条连接显示校验状态与最近校验时间，过期/失败时给出“重新校验”与“该连接影响 N 个知识库”。', '**内嵌获取指引**：新建时右侧按服务商（GitHub/GitLab/飞书/Jira）展示 Token 获取步骤与所需 scope，减少来回查文档。', '**凭证脱敏**：永不回显明文，更新凭证为“替换”而非“编辑”。'],
  render() {
    const r = rng(51), n = cnt({ few: 3, normal: 10, many: 80 }), P = ['GitLab', 'GitHub', '飞书', 'Jira', 'Confluence'];
    const rows = Array.from({ length: n }, (_, i) => ({ id: 'c' + i, name: ['gitlab-acme', 'github-public', 'feishu-prod', 'jira-cloud', 'conf-wiki'][i % 5] + (i > 4 ? '-' + i : ''), p: P[i % 5], auth: pick(r, ['Personal Access Token', 'OAuth App', 'App ID + Secret', 'Basic']), url: ['https://gitlab.acme.com', 'https://api.github.com', 'https://open.feishu.cn', 'https://acme.atlassian.net', 'https://wiki.acme.com'][i % 5], st: i === 1 ? 'bad' : i === 4 ? 'exp' : 'ok', ds: int(r, 0, 8), age: int(r, 5, 9000) }));
    if (scn() && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'conn', id: '', tab: '' }; }
    return simpleList({ id: 'conn', title: '连接管理', sub: '知识库与 MCP 使用的外部服务凭证', acts: btn('新建连接', 'drawer', 'conn', { k: 'btn-pri', i: 'plus' }), rows, ph: '搜索连接', searchKeys: ['name', 'url', 'p'], segs: [['ok', '正常'], ['bad', '校验失败'], ['exp', '已过期']], segKey: 'st', filters: [{ k: 'p', label: '服务商', opts: P.map(x => [x, x]) }],
      cols: [{ t: '连接', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('link') + '</span><div class="cname"><span class="nm">' + x.name + '</span><span class="slug">' + x.p + ' · ' + x.url + '</span></div></div>' }, { t: '认证方式', w: '160px', hm: 1, f: x => '<span class="muted">' + x.auth + '</span>' }, { t: '校验', w: '110px', f: x => stt(x.st === 'ok' ? '有效' : x.st === 'bad' ? '校验失败' : '已过期', x.st === 'ok' ? 'ok' : 'bad') }, { t: '关联知识库', w: '90px', hm: 1, f: x => '<span class="mono2">' + x.ds + '</span>' }, { t: '最后使用', w: '100px', f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      onRow: 'drawer_conn', menu: x => [mi('refresh', '重新校验', { act: 'toast', a: 'ok|校验通过' }), mi('key', '替换凭证', { act: 'drawer', a: 'conn|' + x.id }), '-', mi('trash', '删除', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'trash', title: '删除连接「' + x.name + '」？', desc: '有 <b>' + x.ds + '</b> 个知识库依赖此连接，删除后它们将无法同步。', ok: '删除', then: '连接已删除' }) })], bulk: [{ i: 'refresh', t: '重新校验' }, { i: 'trash', t: '删除', bad: 1 }], empty: { ic: 'link', t: '还没有连接', d: '连接保存访问外部服务所需的凭证，知识库和 MCP 都会复用。', btns: btn('新建连接', 'drawer', 'conn', { k: 'btn-pri', i: 'plus' }) } });
  },
});
ACT.drawer_conn = a => openDrawer('conn', a);
DRAWERS.conn = id => { const f = scn() === 'verify-fail'; return { title: id ? '替换凭证' : '新建连接', sub: 'GitLab · Personal Access Token', wide: true, body: () => '<div class="fgrid">' + field('名称', inp('gitlab-acme')) + field('服务商', slt(['GitLab', 'GitHub', '飞书'], 'GitLab')) + field('Base URL', inp('https://gitlab.acme.com', { mono: 1 }), { full: 1 }) + field('Personal Access Token', '<div class="inwrap"><input class="inp mono' + (f ? ' err' : '') + '" type="password" value="glpat-xxxxxxxxxxxxxxxx"><button class="qbtn eye">' + ic('eye') + '</button></div>', { full: 1, err: f ? '校验失败：401 Unauthorized，Token 无效或已过期' : '', hint: f ? '' : '凭证加密存储，保存后不再显示明文' }) + '</div>' + (f ? '' : banner('ok', 'okc', '校验通过：已识别用户 <b>zhang.wei</b>，scope 含 read_repository。')) + dgrp('如何获取 Token', '<ol style="margin:0;padding-left:20px;font:400 12.5px/1.9 var(--f);color:var(--fg2)"><li>登录 GitLab → 头像 → <b>Preferences → Access Tokens</b></li><li>勾选 scope：<span class="mono">read_api</span>、<span class="mono">read_repository</span></li><li>设置较长的有效期，复制 Token 粘贴到上方</li></ol>'), foot: btn('校验并保存', 'toast', f ? 'bad|校验失败，未保存' : 'ok|连接已保存', { k: 'btn-pri' }) + btn('取消', 'dclose') }; };

function skillRows() { const r = rng(61), n = cnt({ few: 3, normal: 12, many: 90 }), N = ['代码检索', '文档摘要', '表格分析', 'SQL 生成', '合同审阅', '日志归类', '接口对比', '周报生成']; return Array.from({ length: n }, (_, i) => ({ id: 'sk' + i, name: N[i % 8] + (i > 7 ? ' ' + i : ''), slug: 'skill-' + (i % 8) + '-' + i, st: i === 2 ? 'bad' : i === 5 ? 'warn' : 'ok', use: int(r, 0, 8), v: '1.' + int(r, 0, 9) + '.' + int(r, 0, 9), age: int(r, 10, 20000), env: i % 3 === 0 })); }
page({
  id: 'skills', grp: '管理台 · Lens', title: 'Skill 资源库', layout: 'admin', grp2: '资源库',
  scn: [['uploading', '上传中'], ['pkg-bad', '包格式错误'], ['too-big', '超过 50 MB'], ['dup', 'Slug 重复']],
  notes: ['**上传校验前置**：拖入 .zip 后立即在前端校验大小（≤50 MB）、必须含 `SKILL.md`、slug 是否重复，并逐条列出问题；通过前不可提交。', '**使用面可见**：每个 Skill 显示被几个助手使用，删除前列出受影响助手。', '**环境变量缺失**以黄色角标提示，避免“装上才发现跑不了”。'],
  render() {
    const rows = skillRows(), sc = scn();
    const dz = sc === 'uploading' ? '<div class="panel pad" style="gap:10px"><div style="display:flex;justify-content:space-between;font:500 13px var(--f)"><span>' + ic('file') + ' code-search-1.4.0.zip</span><span class="mono">62%</span></div>' + bar(62) + '<span class="muted">正在校验 SKILL.md 与依赖…</span></div>' : sc === 'pkg-bad' ? banner('bad', 'warn', '<b>包校验未通过</b><ul style="margin:6px 0 0;padding-left:18px"><li>压缩包根目录缺少 <span class="mono">SKILL.md</span></li><li>manifest 中的 <span class="mono">entry</span> 指向不存在的文件</li></ul>', btn('重新选择', 'toast', 'info|选择文件', { c: 'sm' })) : sc === 'too-big' ? banner('bad', 'archive', '<b>文件过大：</b>report-skill.zip 为 78.2 MB，超过 50 MB 上限。请精简依赖后重试。') : sc === 'dup' ? banner('warn', 'warn', '<b>Slug 已存在：</b><span class="mono">skill-0-0</span>。可选择覆盖升级（1.2.3 → 1.3.0）或改名。', btn('覆盖升级', 'toast', 'ok|已覆盖升级', { c: 'sm', k: 'btn-pri' })) : '';
    return simpleList({ id: 'skills', title: 'Skill 资源库', sub: '可复用的 Agent 技能包（.zip，≤ 50 MB）', acts: btn('上传 Skill', 'toast', 'info|选择 .zip 文件', { k: 'btn-pri', i: 'upload' }), rows, banner: dz, ph: '搜索 Skill', searchKeys: ['name', 'slug'], segs: [['ok', '可用'], ['warn', '缺少环境变量'], ['bad', '校验失败']], segKey: 'st',
      cols: [{ t: 'Skill', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('spark') + '</span><div class="cname"><span class="nm">' + x.name + '</span><span class="slug">' + x.slug + '</span></div></div>' }, { t: '状态', w: '130px', f: x => stt(x.st === 'ok' ? '可用' : x.st === 'warn' ? '缺少环境变量' : '校验失败', x.st === 'ok' ? 'ok' : x.st === 'warn' ? 'warn' : 'bad') }, { t: '版本', w: '80px', hm: 1, f: x => '<span class="mono2">' + x.v + '</span>' }, { t: '被使用', w: '90px', hm: 1, f: x => '<span class="mono2">' + x.use + ' 个助手</span>' }, { t: '更新', w: '100px', f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      onRow: 'drawer_sk', menu: x => [mi('eye', '详情', { act: 'drawer', a: 'sk|' + x.id }), mi('upload', '上传新版本'), mi('download', '下载包'), '-', mi('trash', '删除', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'trash', title: '删除 Skill「' + x.name + '」？', desc: x.use ? '<b>' + x.use + ' 个助手</b>正在使用它（如：基础设施运维助手、代码库问答），删除后这些助手将失去该能力。' : '没有助手使用它，可以安全删除。', ok: '删除', then: 'Skill 已删除' }) })], bulk: [{ i: 'trash', t: '删除', bad: 1 }], empty: { ic: 'spark', t: '还没有 Skill', d: '把常用的分析流程打包成 Skill（含 SKILL.md），助手即可按需调用。', btns: btn('上传 Skill', 'toast', 'info|选择文件', { k: 'btn-pri', i: 'upload' }) } });
  },
});
ACT.drawer_sk = a => openDrawer('sk', a);
DRAWERS.sk = id => { const x = skillRows().find(r => r.id === id) || skillRows()[0]; return { title: x.name, sub: x.slug + ' · ' + x.v, wide: true, body: () => (x.st === 'warn' ? banner('warn', 'warn', '缺少环境变量 <span class="mono">GITLAB_TOKEN</span>，该 Skill 运行时会失败。') : '') + dgrp('SKILL.md', '<div class="code" style="white-space:pre-wrap">---\nname: ' + x.name + '\ndescription: 在代码仓库中检索并解释实现\n---\n\n# 使用说明\n先用关键词定位文件，再读取相关片段并给出引用。</div>') + dgrp('环境变量', '<div class="prow"><span class="mono2" style="flex:1">GITLAB_TOKEN</span>' + stt(x.st === 'warn' ? '未设置' : '已设置', x.st === 'warn' ? 'bad' : 'ok') + '</div>') + dgrp('被使用', '<div class="muted">' + x.use + ' 个助手使用此 Skill</div>'), foot: btn('关闭', 'dclose') }; };

function mcpRows() { const r = rng(71), n = cnt({ few: 3, normal: 8, many: 60 }), N = ['jira-mcp', 'github-mcp', 'postgres-readonly', 'filesystem', 'feishu-docs', 'sentry', 'grafana', 'slack']; return Array.from({ length: n }, (_, i) => ({ id: 'm' + i, name: N[i % 8] + (i > 7 ? '-' + i : ''), tr: i % 3 === 0 ? 'stdio' : 'http', ep: i % 3 === 0 ? 'npx -y @acme/' + N[i % 8] : 'https://mcp.acme.com/' + N[i % 8], st: i === 1 ? 'bad' : i === 3 ? 'warn' : 'ok', err: i === 1 ? 'connect ECONNREFUSED 10.0.8.14:8931' : i === 3 ? '握手成功但仅暴露 0 个工具' : '', tools: int(r, 2, 24), age: int(r, 3, 4000) })); }
page({
  id: 'mcp', grp: '管理台 · Lens', title: 'MCP Server 资源库', layout: 'admin', grp2: '资源库',
  scn: [['form', '新增 · 校验失败']],
  notes: ['**错误信息放进列表**：校验失败的原因（拒绝连接 / 无工具）直接展示在行内，不必点进去。', '**一键校验并列出工具**：保存前先“测试连接”，成功后展示发现的工具列表供勾选暴露范围。', '**传输方式**（stdio / http）切换表单字段，stdio 命令加风险提示。'],
  render() {
    const rows = mcpRows(); if (scn() === 'form' && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'mcpf', id: '', tab: '' }; }
    return simpleList({ id: 'mcp', title: 'MCP Server 资源库', sub: '为助手扩展外部工具能力', acts: btn('新增 Server', 'drawer', 'mcpf|', { k: 'btn-pri', i: 'plus' }), rows, ph: '搜索 Server', searchKeys: ['name', 'ep'], segs: [['ok', '正常'], ['warn', '需注意'], ['bad', '异常']], segKey: 'st', filters: [{ k: 'tr', label: 'Transport', opts: [['stdio', 'stdio'], ['http', 'http']] }],
      cols: [{ t: 'MCP Server', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('plug') + '</span><div class="cname"><span class="nm">' + x.name + '</span><span class="slug">' + esc(x.ep) + '</span></div></div>' }, { t: '状态', w: 'minmax(0,1.6fr)', f: x => '<div class="cname">' + stt(x.st === 'ok' ? '正常' : x.st === 'warn' ? '需注意' : '连接失败', x.st) + (x.err ? '<span class="slug" style="color:var(--' + (x.st === 'bad' ? 'danger' : 'warn') + ')">' + esc(x.err) + '</span>' : '') + '</div>' }, { t: 'Transport', w: '80px', hm: 1, f: x => pill(x.tr, 'mono') }, { t: '工具', w: '60px', hm: 1, f: x => '<span class="mono2">' + x.tools + '</span>' }, { t: '上次运行', w: '100px', f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      onRow: 'drawer_mcp', menu: x => [mi('refresh', '重新校验', { act: 'toast', a: x.st === 'bad' ? 'bad|校验失败：ECONNREFUSED' : 'ok|校验通过，发现 ' + x.tools + ' 个工具' }), mi('edit', '编辑', { act: 'drawer', a: 'mcpf|' + x.id }), '-', mi('trash', '删除', { bad: 1 })], bulk: [{ i: 'refresh', t: '重新校验' }, { i: 'trash', t: '删除', bad: 1 }], empty: { ic: 'plug', t: '还没有 MCP Server', d: 'MCP 让助手调用 Jira、数据库、监控等外部工具。', btns: btn('新增 Server', 'drawer', 'mcpf|', { k: 'btn-pri', i: 'plus' }) } });
  },
});
ACT.drawer_mcp = a => openDrawer('mcpf', a);
DRAWERS.mcpf = id => { const f = scn() === 'form'; return { title: id ? '编辑 MCP Server' : '新增 MCP Server', sub: 'http · Streamable', wide: true, body: () => '<div class="fgrid">' + field('名称', inp('jira-mcp')) + field('Transport', slt(['http', 'stdio'], 'http')) + field('Endpoint', inp('https://mcp.acme.com/jira', { mono: 1, err: f }), { full: 1, err: f ? '无法连接：ECONNREFUSED 10.0.8.14:8931' : '' }) + field('认证连接', slt([['', '无'], ['c3', 'jira-cloud']], 'c3'), { full: 1 }) + '</div>' + (f ? banner('bad', 'warn', '<b>连接测试失败</b>，请确认服务已启动并对 LensNode 可达。') : banner('ok', 'okc', '连接成功 · 发现 <b>12</b> 个工具')) + (f ? '' : dgrp('暴露的工具', ['search_issues', 'get_issue', 'create_issue', 'add_comment'].map((t, i) => '<div class="setrow" style="padding:7px 0"><span class="mono2" style="flex:1">' + t + '</span>' + tgl(i < 2, 'toast', 'info|已切换') + '</div>').join(''))), foot: btn('保存', 'toast', f ? 'bad|请先通过连接测试' : 'ok|已保存', { k: 'btn-pri' }) + btn('测试连接', 'toast', 'info|测试中…', { i: 'refresh' }) }; };

/* ═════ 资源设置 / 全局配置 ═════ */
function settingsPage(id, title, sub, groups, notes) {
  page({ id, grp: '管理台 · Lens', title, layout: 'admin', grp2: id === 'nodeset' ? '节点管理' : '资源库', scn: [['dirty', '有未保存修改'], ['save-err', '保存失败']], notes,
    render() { const sc = scn(); return phead(title, sub, '') + gate(() => (sc === 'save-err' ? banner('bad', 'warn', '<b>保存失败</b>：“Token 预算”必须是正整数。已为你保留修改。') : '') + groups.map(g => '<div class="panel"><div class="ph"><h3>' + g[0] + '</h3><span class="sub">' + g[1] + '</span></div><div class="pad" style="padding-top:6px">' + g[2].map(r => r[0] === 'inp' ? '<div class="setrow"><div class="sl"><b>' + r[1] + '</b><span>' + r[2] + '</span></div><div class="sr"><input class="inp mono" style="width:' + (String(r[3]).length > 14 ? 'min(420px, 46vw)' : '180px') + (sc === 'save-err' && r[1] === 'Token 预算' ? ';border-color:var(--danger)' : '') + '" value="' + r[3] + '"></div></div>' : r[0] === 'sel' ? '<div class="setrow"><div class="sl"><b>' + r[1] + '</b><span>' + r[2] + '</span></div><div class="sr">' + slt(r[3], r[4]) + '</div></div>' : '<div class="setrow"><div class="sl"><b>' + r[1] + '</b><span>' + r[2] + '</span></div><div class="sr">' + tgl(r[3], 'toast', 'info|已切换（尚未保存）') + '</div></div>').join('') + '</div></div>').join('') + '<div class="panel pad" style="flex-direction:row;align-items:center;gap:10px;position:sticky;bottom:12px;box-shadow:var(--sh-pop)"><span class="dnote" style="flex:1">' + (sc === 'dirty' || sc === 'save-err' ? '<span class="dot warn"></span> 有未保存的修改' : '所有修改已保存') + '</span><button class="btn btn-gh">还原</button><button class="btn btn-pri' + (sc ? '' : ' dis') + '" data-act="toast" data-a="ok|设置已保存并即时生效">保存修改</button></div>', 'form'); } });
}
settingsPage('nodeset', '节点设置', '节点的部署、运行与健康检查设置（平台统一，作用于所有节点；默认值取自后端，标“示例”的为占位）', [
  ['部署', '节点如何被访问与启动', [['inp', '对外访问地址（public_base_url）', '节点回连 SourceLens、生成分享链接与节点启动配置时使用的对外地址；未设置时无法生成节点启动配置', 'https://sourcelens.example.com'], ['inp', '节点镜像（lensnode.image）', '注册节点时生成 compose 使用的镜像（示例）', 'registry.example.com/sourcelens-lensnode:latest']]],
  ['运行', '节点执行运行（Run）时的超时', [['inp', '默认超时（秒）（lensnode.defaults.timeout）', '单个节点任务的默认超时，节点可单独覆盖（示例）', '240'], ['inp', '空闲超时（秒）（lensnode.defaults.idle_timeout）', '运行长时间没有任何活动就判为空闲并回收，默认 300', '300'], ['inp', '运行绝对超时（秒）（lensnode_cleanup.run_absolute_timeout_s）', '一次运行无论是否活跃的最长时长，超过会被清理，默认 14400', '14400']]],
  ['健康检查', '判断节点是否在线、多久检查一次', [['inp', '离线阈值（秒）（lensnode.health.offline_threshold_s）', '超过该时间没有心跳就判为离线，默认 60', '60'], ['inp', '探测超时（秒）（lensnode.health.probe_timeout_s）', '单次健康探测的超时时间，默认 5', '5'], ['inp', '健康检查间隔（秒）（lensnode_health.interval_seconds）', '定时健康检查任务的执行间隔（示例）', '60'], ['inp', '清理间隔（秒）（lensnode_cleanup.interval_seconds）', '定时清理任务的执行间隔（示例）', '3600']]],
], ['**节点的设置归节点管理**：对外访问节点的链接（public_base_url）、节点镜像、超时与健康检查阈值 / 间隔，原来放在后端“Lens 全局设置”里，现在统一在「节点管理 → 节点设置」。设置项键名与默认值来自后端真实的全局设置。', '**修改前后有提示**：改“对外访问地址”会影响新生成的节点启动配置与分享链接，已部署的节点需要按新配置重启。']);
settingsPage('lenset', '全局配置', '平台统一的运行记录、对话历史、默认模型、分享策略与知识库处理设置（节点相关的在「节点设置」；默认值取自后端，标“示例”的为占位）', [
  ['运行记录', '运行（Run）记录的保留与清理', [['inp', '运行记录保留天数（retention.run_days）', '超过天数的已结束运行会被清理，默认 30', '30'], ['inp', '清理间隔（秒）（run_retention.interval_seconds）', '定时清理任务的执行间隔（示例）', '3600']]],
  ['对话历史', '多轮对话回放给模型的预算（lens.history_budget）；任一项过大都会增加每次调用的上下文', [['inp', '回放轮数上限（pairs）', '最多回放多少组问答，范围 1–20，默认 20', '20'], ['inp', '单条消息字符上限（message_chars）', '范围 200–20000，默认 2000', '2000'], ['inp', '总字符上限（total_chars）', '范围 500–100000，默认 32000', '32000']]],
  ['默认模型', '助手 / 功能未单独指定时使用的模型', [['sel', '智能协作默认模型（lens.smart_collaboration.model_ref）', '“智能协作”类助手的协调器默认模型', [['', '未指定'], ['m1', 'claude-sonnet-5-5'], ['m2', 'gpt-5']], ''], ['sel', '技能生成模型（lens.skills.generator_model_ref）', '用于生成技能的模型', [['', '未指定'], ['m1', 'claude-sonnet-5-5'], ['m2', 'gpt-5']], '']]],
  ['分享策略', '成员分享的问答链接，默认谁能打开（lens.public_share.policy）', [['sel', '分享问答的可见范围（全局默认）', '租户内可见 = 跟随助手的租户权限；助手可单独覆盖', [['public', '公开可见'], ['login', '租户内可见']], 'login']]],
  ['知识库上传', '手动上传的限制（lens.datasource_upload.*）', [['inp', '单文件大小上限（字节）', 'max_bytes，默认 52428800（50 MB）', '52428800'], ['inp', '压缩包解压后总大小上限（字节）', 'max_extracted_bytes，默认 104857600（100 MB）', '104857600'], ['inp', '压缩包解压后文件数上限', 'max_extracted_files，默认 300', '300']]],
  ['知识库同步', '知识库同步的超时与并发（lens.datasource_sync.*）', [['inp', '同步超时（秒）', 'timeout_s，默认 21600（6 小时）', '21600'], ['inp', '同步工作线程数', 'workers，默认 4', '4'], ['inp', '每个节点的并发数上限（平台统一）', 'max_concurrent：每个节点同时进行的知识库操作数，默认 3', '3']]],
  ['知识库内容转换', '导入文档 / 图片时用哪个模型做转换（lens.datasource_conversion.*）', [['sel', '视觉模型', 'vision_model_ref：识别图片内容', [['', '未指定'], ['m1', 'claude-sonnet-5-5'], ['m2', 'gpt-5']], ''], ['sel', '文档模型', 'document_model_ref：解析 Office / PDF 文档', [['', '未指定'], ['m1', 'claude-sonnet-5-5'], ['m2', 'gpt-5']], '']]],
], ['**全局默认 vs 助手覆盖**：每组标题说明“助手未单独设置时的默认值”，避免管理员不清楚优先级。', '**设置项键名与默认值来自后端真实的全局设置**（GlobalSetting）。原型里曾有的“运行预算（轮次 / Token / 思考模式）”“默认启用答案审核”“存储配额”在后端没有对应的全局设置（预算在助手上），已移除。', '**上传 / 同步的“并发数”属于平台整体**：每个节点同时进行的知识库操作数由平台统一设定，不是每个知识库单独的设置。']);
})();
