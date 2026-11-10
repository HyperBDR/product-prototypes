/* 环境变量（租户）· 官方目录（平台：技能 / MCP / 连接器）*/
(function () {
'use strict';
const { ic, esc, rng, pick, int, ago, page, scn, cnt, gate, pill, stt, btn, tgl, field, inp, slt, banner, kv, dgrp, phead, empty, listPage, toast, openDrawer } = H;
const CF = o => JSON.stringify(o);
function mi(i, t, o) { return Object.assign({ i, t }, o || {}); }
const tone = n => [['#e8efff', '#4a68d8'], ['#e6f7ef', '#1fa56f'], ['#fff4de', '#c27a0a'], ['#fdeceb', '#d4503f'], ['#f1eafd', '#6a55c8'], ['#e3f4f7', '#1c8e9e']][(n.charCodeAt(0) + n.length) % 6];

/* ═════ 租户 · 环境变量 ═════ */
const EV_NAMES = [['gitlab-prod-token', ['GITLAB_TOKEN']], ['jira-cloud', ['JIRA_BASE_URL', 'JIRA_API_TOKEN']], ['postgres-readonly', ['PGHOST', 'PGUSER', 'PGPASSWORD']], ['feishu-app', ['FEISHU_APP_ID', 'FEISHU_APP_SECRET']], ['search-api', ['SEARCH_API_KEY']], ['grafana-ro', ['GRAFANA_URL', 'GRAFANA_TOKEN']], ['sentry-org', ['SENTRY_AUTH_TOKEN']]];
function evRows() {
  const E = H.REAL.envsets, n = cnt({ few: 2, normal: E.length, many: 60 }), r = rng(33);
  return Array.from({ length: n }, (_, i) => { const b = E[i % E.length], use = int(r, 1, 3); return { id: 'e' + i, name: b[0] + (i >= E.length ? ' ' + (i + 1) : ''), keys: b[1], use, st: 'on', age: int(r, 20, 9000) }; });
}
const EVST = { on: ['已启用', 'ok'], off: ['已停用', ''], unused: ['未使用', 'warn'] };
page({
  id: 'envvars', grp: '管理 · 助手管理', title: '环境变量', layout: 'admin', grp2: '助手(Assistant)管理',
  scn: [['reveal', '显示明文 · 审计提示'], ['in-use', '删除被占用的变量集'], ['new', '新建 · 变量名重复']],
  notes: ['**⚠ 设计备注（有争议）**：这个页面是否保留还没定——绑定发生在「配置助手」里（选变量集、也能直接新建），这里只是变量集清单，感觉意义不大；另外“连接”这部分（连接器 / 连接的凭证与环境变量的关系）有点问题，待梳理。暂时放在「助手(Assistant)管理」下。', '**属于租户自己**：环境变量值加密保存在本租户空间，由租户管理员维护；平台超管看不到、也不能“显示明文”。', '**平台托管的变量单独说明**：官方能力若由平台统一提供凭证（如搜索服务），只在页面顶部提示“平台托管”，不出现在列表里，也无法查看。', '**键名可见、值永不回显**：列表只展示变量名；明文只能在编辑抽屉里点“显示明文”，并提示会记录审计。', '**被占用不可删**：仍被助手绑定的变量集禁止删除，并列出绑定它的助手（对应后端 409 ENVIRONMENT_VARIABLE_SET_IN_USE）。', '**复用**：同一变量集可被多个助手的技能 / MCP 绑定复用；在助手里配置技能时也可直接选择这里的变量集。'],
  render() {
    const rows = evRows();
    if (scn() === 'reveal' && !S.ui.auto) { S.ui.auto = 1; S.ui.envrev = true; S.drawer = { kind: 'envset', id: 'e0', tab: '' }; }
    if (scn() === 'new' && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'envset', id: '', tab: '' }; }
    if (scn() === 'in-use' && !S.ui.auto) { S.ui.auto = 1; S.dialog = { tone: 'warn', ic: 'lock', title: '无法删除「' + rows[0].name + '」', desc: '它仍被 <b>' + rows[0].use + ' 个助手</b>的技能 / MCP 绑定（如：基础设施运维助手、代码库问答）。请先在这些助手里解除绑定，再删除。', ok: '知道了' }; }
    const plat = '<div class="callout"><b>' + ic('shield') + ' 平台托管的变量</b>：部分官方能力（如 Web 搜索）的凭证由平台统一提供，你<b>无需配置，也无法查看</b>。它们不会出现在下面的列表里。</div>';
    return phead('环境变量', '你自己的凭证与配置，供技能 / MCP 使用；在配置助手时按助手选用，值加密保存，仅本租户可见', btn('新建变量集', 'drawer', 'envset|', { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + banner('warn', 'info', '<b>设计备注 · 有争议，待评审</b>：这个页面要不要保留还没定。环境变量是在<b>配置助手</b>时按助手绑定的（也能当场新建变量集），这里只是变量集的清单，意义有限；另外“连接”这部分有点问题，待梳理。') + plat + gate(() => listPage({
      id: 'envvars', rows, ph: '搜索变量集 / 变量名', searchKeys: ['name'], segs: [['on', '已启用', rows.filter(x => x.st === 'on').length], ['unused', '未使用', rows.filter(x => x.st === 'unused').length], ['off', '已停用', rows.filter(x => x.st === 'off').length]], segKey: 'st',
      cols: [{ t: '变量集', w: 'minmax(0,1.6fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('key') + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + x.keys.length + ' 个变量</span></div></div>' }, { t: '变量名（值不显示）', w: 'minmax(0,2fr)', hm: 1, f: x => '<div class="cn-chips">' + x.keys.map(k => '<span class="cn-ds"><span class="mono2">' + k + '</span></span>').join('') + '</div>' }, { t: '被助手使用', w: '110px', f: x => '<span class="mono2">' + x.use + ' 个</span>' }, { t: '状态', w: '100px', f: x => stt(EVST[x.st][0], EVST[x.st][1]) }, { t: '更新', w: '100px', f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      onRow: 'drawer_env', menu: x => [mi('edit', '编辑', { act: 'drawer_env', a: x.id }), mi('eye', '显示明文（记审计）', { act: 'drawer_envrev', a: x.id }), '-', mi('trash', '删除', { bad: 1, act: 'confirm', a: CF(x.use ? { tone: 'warn', ic: 'lock', title: '无法删除「' + x.name + '」', desc: '它仍被 <b>' + x.use + ' 个助手</b>绑定。请先解除绑定。', ok: '知道了' } : { tone: 'danger', ic: 'trash', title: '删除「' + x.name + '」？', desc: '没有助手使用它，可以安全删除。变量值将被永久清除。', ok: '删除', then: '已删除' }) })],
      empty: { ic: 'key', t: '还没有环境变量', d: '在这里保存你自己的 Token、地址等；之后在配置助手 › 技能时选用。', btns: btn('新建变量集', 'drawer', 'envset|', { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
});
ACT.drawer_env = a => { S.ui.envrev = false; openDrawer('envset', a); };
ACT.drawer_envrev = a => { S.ui.envrev = true; openDrawer('envset', a); };
ACT.envrev = () => { S.ui.envrev = !S.ui.envrev; if (S.ui.envrev) toast('info', '已显示明文，本次查看会记录审计'); };
DRAWERS.envset = id => {
  const x = evRows().find(r => r.id === id) || null, dup = scn() === 'new' && !id, rev = !!S.ui.envrev;
  const keys = x ? x.keys : ['GITLAB_TOKEN'];
  return { title: x ? x.name : '新建变量集', sub: x ? '被 ' + x.use + ' 个助手使用' : '保存你自己的凭证与配置', wide: true, body: () =>
    banner('info', 'lock', '值使用租户密钥加密保存，<b>平台管理员无法查看</b>。只有本租户管理员可以在此显示明文，每次查看都会记录审计。') +
    '<div class="fgrid">' + field('名称', inp(x ? x.name : 'gitlab-prod-token', { err: dup }), { req: 1, err: dup ? '名称已存在：gitlab-prod-token' : '', full: 1 }) + field('说明', inp(x ? '用于代码检索技能' : ''), { opt: 1, full: 1 }) + '</div>' +
    dgrp('变量', keys.map((k, i) => '<div class="envrow"><span class="mono2" style="width:170px"><b>' + k + '</b></span><input class="inp mono" style="flex:1" ' + (rev ? 'value="glpat-9f31a7c2e4b8d0"' : 'type="password" value="••••••••••••"') + ' readonly><button class="btn btn-gh sm" data-act="toast" data-a="info|输入新值以替换">替换</button><button class="qbtn" data-act="toast" data-a="info|已移除变量" aria-label="移除">' + ic('trash') + '</button></div>').join('') + '<div style="display:flex;gap:8px;margin-top:10px">' + btn('添加变量', 'toast', 'info|添加一行变量', { c: 'sm', i: 'plus' }) + (x ? btn(rev ? '隐藏明文' : '显示明文（记审计）', 'envrev', null, { c: 'sm', i: 'eye' }) : '') + '</div>') +
    (x ? dgrp('被以下助手使用', Array.from({ length: Math.min(x.use, 4) }, (_, i) => '<div class="prow"><span class="thumb">' + ic('bot') + '</span><span style="flex:1"><span class="nm">' + ['基础设施运维助手', '代码库问答', '客服知识库', '合同条款审阅'][i] + '</span></span>' + pill(['代码检索', 'Jira', 'PostgreSQL', '文档摘要'][i], '') + '</div>').join('') || '<div class="muted">还没有助手使用</div>') : ''),
    foot: btn('保存', 'dclose', null, { k: 'btn-pri' }) + btn('取消', 'dclose') + (x ? '<span style="margin-left:auto"></span>' + btn('删除', 'confirm', CF(x.use ? { tone: 'warn', ic: 'lock', title: '无法删除', desc: '仍被 <b>' + x.use + ' 个助手</b>绑定，请先解除绑定。', ok: '知道了' } : { tone: 'danger', ic: 'trash', title: '删除「' + x.name + '」？', desc: '变量值将被永久清除。', ok: '删除', then: '已删除' }), { i: 'trash' }) : '') };
};

/* ═════ 平台 · 官方目录 ═════ */
const CAT = { skill: ['技能', 'spark', '当前版本（包哈希）'], mcp: ['MCP Server', 'plug', '当前版本（手填）'], conn: ['连接器', 'link', '当前版本（plugin.json）'] };
const CUSE = { github: '连接 + 助手只读工具（17 个）', gitlab: '连接 + 助手只读工具（3 个）', feishu: '连接（无助手工具）', jira: '助手只读工具（3 个，不用于知识库）', typesafe: '助手决策工具（Noul / Choice / Score，3 个）' };
const CNAMES = {
  skill: [['code-search', '代码检索', ['GITLAB_TOKEN']], ['doc-summary', '文档摘要', []], ['table-analysis', '表格分析', []], ['sql-gen', 'SQL 生成', ['PGHOST', 'PGPASSWORD']], ['log-triage', '日志归类', []], ['web-search', 'Web 搜索', ['SEARCH_API_KEY']]],
  mcp: [['jira-mcp', 'Jira', ['JIRA_BASE_URL', 'JIRA_API_TOKEN']], ['github-mcp', 'GitHub', ['GITHUB_TOKEN']], ['postgres-ro', 'PostgreSQL（只读）', ['PGHOST', 'PGPASSWORD']], ['feishu-docs', '飞书文档', ['FEISHU_APP_ID', 'FEISHU_APP_SECRET']], ['sentry', 'Sentry', ['SENTRY_AUTH_TOKEN']]],
  conn: [['github', 'GitHub', ['Personal access token', '允许的仓库']], ['gitlab', 'GitLab', ['GitLab endpoint', 'Personal access token', '允许的项目']], ['feishu', '飞书', ['App ID', 'App Secret']], ['jira', 'Jira', ['Jira endpoint', 'Account', 'API Token', '允许的项目']], ['typesafe', 'TypeSafe AI', ['API endpoint', 'API token', 'Jev model']]],
};
function versionRows(x) {
  if (x.kind !== 'conn') return '<div class="trow2 th2" style="grid-template-columns:110px minmax(0,1.6fr) 90px"><span>版本</span><span>说明</span><span>更新</span></div><div class="trow2" style="grid-template-columns:110px minmax(0,1.6fr) 90px"><span class="mono2"><b>' + H.vtxt(x.ver) + '</b></span><span>当前版本（' + (x.kind === 'skill' ? '上传包的内容哈希' : 'MCP 手填的版本号') + '） <span class="pill ok">当前</span></span><span class="muted">' + ago(x.age) + '</span></div>';
  const r = { v: x.ver, note: '随平台发布（来自插件清单 plugin.json 的 version）', age: x.age };
  return '<div class="trow2 th2" style="grid-template-columns:90px minmax(0,1.6fr) 90px 110px"><span>版本</span><span>更新说明</span><span>发布</span><span>在用租户（示意）</span></div><div class="trow2" style="grid-template-columns:90px minmax(0,1.6fr) 90px 110px"><span class="mono2"><b>' + H.vtxt(r.v) + '</b></span><span>' + esc(r.note) + ' <span class="pill ok">当前</span></span><span class="muted">' + ago(r.age) + '</span><span class="mono2">' + x.tenants + ' 个</span></div><p class="hint" style="margin-top:8px">连接器的版本来自仓库 plugins 目录里每个插件的 plugin.json（目前均为 1.0.0）；发布新版本即发布新的插件包。</p>';
}
function catRows(kind) {
  if (kind !== 'conn') { const T = H.MKX.TPL[kind], n = cnt({ few: Math.min(3, T.length), normal: T.length, many: T.length }); return T.slice(0, n).map((x, i) => ({ id: kind + i, kind, slug: x[0], name: x[1], ver: x[4], env: [], use: '', plat: false, st: 'pub', tenants: (i * 3) % 7 + 1, asst: x[6], age: H.REAL.daysAgo(x[5]) * 1440 })); }
  const n = cnt({ few: 3, normal: CNAMES[kind].length, many: 40 }), r = rng(61 + kind.length), b = CNAMES[kind];
  return Array.from({ length: n }, (_, i) => { const x = b[i % b.length]; return { id: kind + i, kind, slug: x[0] + (i >= b.length ? '-' + i : ''), name: x[1] + (i >= b.length ? ' ' + i : ''), ver: kind === 'conn' ? '1.0.0' : '2.' + (i % 5) + '.' + (i % 3), env: x[2], use: CUSE[x[0]] || '', plat: x[0] === 'web-search', st: i === 3 ? 'draft' : i === 4 ? 'off' : 'pub', tenants: i === 3 ? 0 : int(r, 2, 120), asst: int(r, 5, 900), age: int(r, 30, 40000) }; });
}
const CST2 = { pub: ['已发布', 'ok'], draft: ['草稿', ''], off: ['已下架', 'bad'] };
const KT = { skill: '技能', mcp: 'MCP Servers', conn: '连接器' };
['skill', 'mcp', 'conn'].forEach(KIND => page({
  id: 'catalog-' + KIND, grp: '平台 · 官方目录', title: KT[KIND], layout: 'admin', grp2: '官方目录',
  scn: [['deprecate', '下架 · 影响面确认'], ['breaking', '发布重大变更']],
  notes: ['**平台维护的官方目录**：技能、MCP Server、连接器由超管统一发布与维护；租户只能启用并配置自己的环境变量，**不能上传官方内容**（租户自己的技能 / MCP 在租户侧「我的」，与这里互不混合）。', '**连接器全部官方发布**：租户不能自建连接器，只能选择官方连接器并填写自己的凭证。', '**环境变量的三层**：①“声明”——这个能力需要哪些变量，由发布者（平台）定义；②“平台托管值”——可选，平台统一提供并保密（租户只看到“平台托管”）；③租户自己的值——租户在自己空间配置，平台看不到。', '**版本与重大变更**：发布新版本时可标记“重大变更，需租户确认后升级”；普通更新租户自动跟随。', '**下架有影响面**：下架前列出已启用的租户数与绑定的助手数；已启用的租户在过渡期内可继续使用。'],
  render() {
    const kind = KIND, rows = catRows(kind), C = CAT[kind];
    if (scn() === 'deprecate' && !S.ui.auto) { S.ui.auto = 1; S.dialog = { tone: 'danger', ic: 'warn', title: '下架「' + rows[0].name + '」？', desc: '<b>' + rows[0].tenants + ' 个租户</b>已启用，共绑定 <b>' + rows[0].asst + ' 个助手</b>。下架后新租户不能再启用；已启用的租户可继续使用 <b>30 天过渡期</b>，期满后失效，并提前通知各租户管理员。', ok: '确认下架', then: '已下架，已通知受影响租户' }; }
    if (scn() === 'breaking' && !S.ui.auto) { S.ui.auto = 1; S.ui.cattab = kind; S.drawer = { kind: 'catitem', id: rows[0].id, tab: 'ver' }; }
    const tabs = '';
    return phead('官方目录 · ' + KT[kind], kind === 'conn' ? '平台统一发布的连接器（来自插件清单）；租户只填写自己的凭证，用于连接或给助手读取外部系统' : '平台统一发布与维护；租户启用后，在配置助手时绑定自己的环境变量', btn('发布' + C[0], 'toast', 'info|新建官方' + C[0] + '（草稿）', { k: 'btn-pri', i: 'plus' }), null) + tabs + gate(() => listPage({
      id: 'cat-' + kind, rows, ph: '搜索' + C[0], searchKeys: ['name', 'slug'], segs: [['pub', '已发布', rows.filter(x => x.st === 'pub').length], ['draft', '草稿', rows.filter(x => x.st === 'draft').length], ['off', '已下架', rows.filter(x => x.st === 'off').length]], segKey: 'st',
      cols: [{ t: C[0], w: 'minmax(0,1.6fr)', f: x => '<div class="cmain"><span class="thumb" style="background:' + tone(x.name)[0] + ';color:' + tone(x.name)[1] + '">' + esc(x.name[0].toUpperCase()) + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + x.slug + '</span></div></div>' }, { t: C[2] || '当前版本', w: '110px', f: x => '<span class="mono2">' + H.vtxt(x.ver) + '</span>' }, { t: '状态', w: '100px', f: x => stt(CST2[x.st][0], CST2[x.st][1]) }, { t: '声明的环境变量', w: 'minmax(0,2fr)', hm: 1, f: x => x.env.length ? '<div class="cn-chips">' + x.env.map(k => '<span class="cn-ds"><span class="mono2">' + k + '</span></span>').join('') + (x.plat ? '<span class="pill">' + ic('shield') + '平台托管</span>' : '') + '</div>' : '<span class="muted">无需配置</span>' }, { t: '启用租户（示意）', w: '110px', f: x => '<span class="mono2">' + x.tenants + '</span>' }, { t: '绑定助手', w: '90px', hm: 1, f: x => '<span class="mono2">' + x.asst + '</span>' }, { t: '更新', w: '100px', f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      onRow: 'drawer_cat', menu: x => [mi('eye', '查看详情', { act: 'drawer_cat', a: x.id }), mi('upload', '发布新版本', { act: 'drawer_catver', a: x.id }), '-', mi('trash', '下架', { bad: 1, act: 'confirm', a: CF({ tone: 'danger', ic: 'warn', title: '下架「' + x.name + '」？', desc: '<b>' + x.tenants + ' 个租户</b>已启用，共绑定 <b>' + x.asst + ' 个助手</b>。已启用的租户可继续使用 30 天过渡期。', ok: '确认下架', then: '已下架' }) })],
      bulk: [{ i: 'play', t: '发布' }, { i: 'trash', t: '下架', bad: 1 }],
      empty: { ic: C[1], t: '还没有官方' + C[0], d: '发布后，租户即可在自己的「能力市场」里启用。', btns: btn('发布' + C[0], 'toast', 'info|新建草稿', { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
}));
ACT.cattab = a => { S.ui.cattab = a; };
ACT.drawer_cat = a => openDrawer('catitem', a);
ACT.drawer_catver = a => openDrawer('catitem', a, 'ver');
DRAWERS.catitem = (id, tab) => {
  const kind = id.replace(/\d+$/, ''), x = catRows(kind).find(r => r.id === id) || catRows('skill')[0], C = CAT[x.kind];
  return { title: x.name, sub: '平台官方' + C[0] + ' · ' + H.vtxt(x.ver) + ' · ' + CST2[x.st][0], tabs: [['ov', '概览'], ['env', '环境变量', x.env.length], ['ver', '版本'], ['use', '启用情况', x.tenants]], wide: true, body: t => {
    if (t === 'env') return banner('info', 'lock', '<b>声明</b>决定租户需要配置哪些变量；<b>平台托管值</b>是可选的——开启后由平台统一提供并保密，租户只看到“平台托管”，不能查看或覆盖。未开启的变量由租户在自己的空间配置，平台看不到。') + (x.env.length ? x.env.map((k, i) => '<div class="setrow"><div class="sl"><b class="mono">' + k + '</b><small>' + (x.plat && i === 0 ? '平台托管 · 租户不可见' : '由租户自行配置') + '</small></div>' + (x.plat && i === 0 ? '<input class="inp mono" style="width:200px" type="password" value="••••••••••••" readonly>' : '') + tgl(x.plat && i === 0, 'toast', 'info|已切换平台托管') + '</div>').join('') : '<div class="muted">此项不需要环境变量。</div>') + '<div style="margin-top:10px">' + btn('添加声明变量', 'toast', 'info|添加一行', { c: 'sm', i: 'plus' }) + '</div>';
    if (t === 'ver') return (x.kind !== 'conn' ? banner('warn', 'info', '<b>版本管理需要后端支持</b>：' + (x.kind === 'skill' ? '技能目前没有语义化版本号，版本就是上传包的内容哈希（' + H.vtxt(x.ver) + '）' : 'MCP 目前的版本是手填值（现为 ' + x.ver + '）') + '，后端不保存历史版本。想要<b>版本号、版本历史与回滚</b>，需要后端提供数据支持；下面只显示真实存在的当前版本。') : '') + (scn() === 'breaking' ? banner('warn', 'warn', '<b>重大变更</b>：将要求 ' + x.tenants + ' 个租户确认后才升级；确认前它们继续使用 ' + H.vtxt(x.ver) + '。') : '') + dgrp(x.kind === 'conn' ? '发布新版本' : '上传新版本', '<div class="fgrid">' + field('版本号', inp(x.kind === 'conn' ? '1.1.0' : '（自动生成）', { mono: 1 }), { hint: x.kind === 'conn' ? '当前 ' + H.vtxt(x.ver) + '；建议按语义化版本：重大变更升主版本、新功能升次版本、修复升补丁' : '现在版本号由上传包的内容哈希自动生成；语义化版本号需要后端支持' }) + field('更新说明', '<textarea class="txa" placeholder="例如：输出改为结构化 JSON">输出格式调整为结构化 JSON，旧提示词需同步修改。</textarea>', { full: 1 }) + '</div><div class="setrow"><div class="sl"><b>重大变更，需租户确认后升级</b><small>开启后租户不会被自动升级，会收到通知并手动确认</small></div>' + tgl(scn() === 'breaking', 'toast', 'info|已切换') + '</div>') + dgrp('版本历史', versionRows(x));
    if (t === 'use') return dgrp('启用情况', '<div class="trow2 th2"><span>租户</span><span>启用助手数</span><span>状态</span></div>' + ['Acme 科技', '星河教育', '云帆医疗', '北辰能源'].slice(0, Math.max(1, Math.min(4, x.tenants))).map((n, i) => '<div class="trow2"><span><b>' + n + '</b></span><span class="mono2">' + (i + 1) * 2 + '</span><span>' + (i === 1 ? stt('待配置环境变量', 'warn') : stt('正常', 'ok')) + '</span></div>').join('') + '<p class="hint" style="margin-top:8px">平台只看到数量与状态，看不到任何租户的环境变量值与对话内容。</p>');
    return kv([['类型', C[0]], ['标识', '<span class="mono">' + x.slug + '</span>'], ['状态', stt(CST2[x.st][0], CST2[x.st][1])], ['当前版本', '<span class="mono">' + H.vtxt(x.ver) + '</span>'], ['启用租户 / 绑定助手', x.tenants + ' / ' + x.asst]].concat(x.kind === 'conn' ? [['plugin_key', '<span class="mono">' + x.slug + '</span>'], ['用途', x.use], ['租户需填写', x.env.map(k => '<span class="mono">' + k + '</span>').join('、')]] : []));
  }, foot: btn('关闭', 'dclose') + '<span style="margin-left:auto"></span>' + (tab === 'ver' || (S.drawer && S.drawer.tab === 'ver') ? btn('发布', 'dclose', null, { k: 'btn-pri' }) : btn('下架', 'confirm', CF({ tone: 'danger', ic: 'warn', title: '下架「' + x.name + '」？', desc: '<b>' + x.tenants + ' 个租户</b>已启用。已启用的租户可继续使用 30 天过渡期。', ok: '确认下架', then: '已下架' }), { i: 'trash' })) };
};
})();
