/* 能力市场：把 技能 / MCP 合并成一个“能力画廊”（连接器属于知识库，不在这里）。
   先展示“助手因此能做什么”，启用或配置才进入右侧抽屉；自建内容仍在技能 / MCP 页的「我的」里。 */
(function () {
'use strict';
const { ic, esc, page, scn, gate, pill, stt, btn, banner, phead, toast, openDrawer } = H;
const X = () => H.MKX;
const TYPE = { skill: ['技能', 'spark'], mcp: ['MCP', 'plug'], conn: ['连接器', 'key'] };
// Connector kinds come from the real plugin manifests in the repo (plugins dir): GitHub / GitLab / Jira / TypeSafe AI
const TC = [
  ['github', 'GitHub', '只读查看仓库：代码、提交、Issue、PR 与 CI（17 个工具）；也可同步仓库到知识库', 'Personal access token（可选）', 'branch', '', '知识库 + 助手工具'],
  ['gitlab', 'GitLab', '只读读取项目代码、汇总提交与合并请求；也可同步仓库到知识库', 'Personal access token（公开项目可匿名）', 'branch', '', '知识库 + 助手工具'],
  ['feishu', '飞书', '同步飞书云文档、表格、多维表格与知识库到知识库（无助手工具）', 'App ID + App Secret', 'file', '', '知识库'],
  ['jira', 'Jira', '只读搜索工单、查看详情与近期动态', '账号 + API Token', 'list', '', '助手工具'],
  ['typesafe', 'TypeSafe AI', '受限的类型化判断（Noul / Choice / Score）', 'API token', 'spark', '', '助手决策工具'],
];
const CAPS = { github: { kb: 1, tool: 1 }, gitlab: { kb: 1, tool: 1 }, feishu: { kb: 1 }, jira: { tool: 1 }, typesafe: { dec: 1 } };
S.tcNew = S.tcNew || [];
function tcRows() {
  const base = S.scale === 'empty' ? [] : tcBase0();
  return S.tcNew.concat(base);
}
function tcBase0() {
  const R = H.REAL.conns, n = H.cnt({ few: 3, normal: R.length, many: 30 });
  return Array.from({ length: n }, (_, i) => { const b = R[i % R.length], c = TC.find(t => t[0] === b.plugin); return { id: 'tc' + i, name: b.name + (i >= R.length ? ' ' + (i + 1) : ''), key: b.plugin, p: c[1], auth: c[3], st: scn() === 'tc-fail' && i === 0 ? 'bad' : 'ok', kbs: b.kbs, caps: CAPS[b.plugin], use: 0 }; });
}
function tcCard(x) {
  const c = x.caps || CAPS[x.key] || {}, tags = (c.kb ? pill('知识库' + (x.kbs && x.kbs.length ? ' · ' + x.kbs.length : ''), '') : '') + (c.tool ? ' ' + pill('助手工具', '') : '') + (c.dec ? ' ' + pill('决策工具', '') : '');
  return '<button class="mk-card inst" data-act="hubopen" data-a="conn|edit:' + x.id + '">' + X().tile(x.name) + '<span class="mk-tx"><b>' + esc(x.name) + (x.fresh ? ' ' + pill('刚连接', 'ok') : '') + '</b><small>' + esc(x.p) + ' · ' + esc(x.auth) + '</small></span><span class="mk-side">' + tags + ' ' + (x.st === 'ok' ? stt('有效', 'ok') : stt('校验失败', 'bad')) + '</span></button>';
}
const CATS = ['全部', '代码', '文档', '数据', '运维', '协作', '项目管理', '数据库', '监控', '文件'];
function connRow(t) {
  const rs = tcRows().filter(r => r.key === t[0]), bad = rs.some(r => r.st !== 'ok');
  return '<div class="mk-card" data-act="hubopen" data-a="conn|' + t[0] + '" role="button" tabindex="0">' + X().tile(t[1]) + '<span class="mk-tx"><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></span>' + (rs.length ? '<span class="mk-side" style="margin-right:6px">' + stt('已连接 ' + rs.length + ' 个', bad ? 'warn' : 'ok') + '</span>' : '') + '<button class="mk-add" data-act="hubopen" data-a="conn|' + t[0] + '" data-stop aria-label="连接">' + ic('plus') + '</button></div>';
}
page({
  id: 'hub', grp: '管理台 · 资源', title: '能力市场', layout: 'admin', grp2: '插件管理',
  scn: [['offline', '平台目录暂不可达'], ['breaking', '技能 · 重大变更待确认'], ['install-fail', '技能 · 启用失败（已下架）'], ['no-market', '平台无官方内容'], ['uploading', '技能 · 上传中'], ['pkg-bad', '技能 · 包格式错误'], ['mcp-form', 'MCP · 自建 Server 校验失败'], ['tc-form', '连接器 · 新建带指引']],
  notes: ['**一排标签 + 一个小开关**：标签按类型分（全部 / 技能 / MCP / 连接器），右侧的小开关切换「已启用 / 发现」。“全部”里是三个分区、每个只露 6 个并带「查看全部」；**暂时不做任何分类 / 来源筛选标签**（后端技能、MCP 也没有分类字段）。', '**首次进来看目录，配置之后看自己的**：还没有启用任何能力时默认打开「发现」（官方目录）；只要有已启用的，下次默认打开「已启用」。两个标签随时可切。', '**顶部只留一条窄栏**：一句话说明 + 三类数量；不放搜索与分类筛选（现阶段目录不大，没有必要）。', '**平台官方与自建**：官方内容启用即用、不复制；自建技能 / MCP 在「已启用」里与官方的混排，卡片标注来源，分区右上角有“上传 Skill / 新增 Server”。', '**已配置的连接不在市场里**：能力市场的「连接器」只是“可以连接哪些系统”的目录（点“＋ 连接”添加），已配置的连接统一在「插件管理 → 连接」里管理（知识库与助手共用同一份）。技能 / MCP 的「已启用 / 发现」不变。', '**连接器 ≠ 连接**：这里的连接器是给助手读外部系统用的（数据库、Jira、GitHub 等，只读）；知识库“从哪同步”的凭证在「知识库管理 → 连接」。', '**异常就地标出**：重大变更待确认、连接器校验失败；**环境变量是否绑定是助手自己的事，在助手列表 / 配置里提示，不在这里**都以提示条出现在对应分区上方。'],
  render() {
    const M = X(), sc = scn(), nE = k => M.enabledOfficial(k).length + M.ownRows(k).length, tcs = tcRows(), mineN = nE('skill') + nE('mcp') + tcs.length;
    const SVD = { breaking: 'mine', uploading: 'mine', 'pkg-bad': 'mine', 'mcp-form': 'mine', offline: 'discover', 'install-fail': 'discover', 'no-market': 'discover', 'tc-form': 'discover' };
    if (S.ui.hv === undefined) S.ui.hv = SVD[sc] || (mineN ? 'mine' : 'discover');
    const view = S.ui.hv, catN = M.TPL.skill.length + M.TPL.mcp.length + TC.length;
    if (sc === 'mcp-form' && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'mcpf', id: '', tab: '' }; }
    if (sc === 'tc-form' && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'tconn', id: 'new|jira', tab: '' }; }
    const chips = [['技能', nE('skill')], ['MCP', nE('mcp')]].map(t => '<span class="hub-bar-c"><b>' + t[1] + '</b>' + t[0] + '</span>').join('') + '<button class="hub-bar-c" data-act="nav2" data-a="connectors" style="cursor:pointer"><b>' + tcs.length + '</b>连接 ›</button>';
    const bar_ = '<div class="hub-bar"><span class="hub-bar-i">' + ic('spark') + '</span><div class="hub-bar-t"><b>让助手能做更多</b><span>挑一个，启用即用；需要凭证时再配置</span></div><div class="hub-bar-s">' + chips + '</div></div>';
    const ty = S.ui.ht || 'all', badc = tcs.filter(x => x.st !== 'ok').length;
    const cnts = view === 'mine' ? { skill: nE('skill'), mcp: nE('mcp'), conn: TC.length } : { skill: M.TPL.skill.length, mcp: M.TPL.mcp.length, conn: TC.length };
    const types = [['all', '全部', cnts.skill + cnts.mcp + cnts.conn], ['skill', '技能', cnts.skill], ['mcp', 'MCP Servers', cnts.mcp], ['conn', '连接器', cnts.conn]];
    const tabs = '<div class="hub-tabrow"><div class="cn-tabs" role="tablist">' + types.map(t => '<button class="' + (ty === t[0] ? 'on' : '') + '" role="tab" data-act="hubty" data-a="' + t[0] + '">' + t[1] + '<span class="n">' + t[2] + '</span></button>').join('') + '</div>' + (ty === 'conn' ? '' : '<div class="segs"><button class="seg' + (view === 'mine' ? ' on' : '') + '" data-act="hubv" data-a="mine">已启用</button><button class="seg' + (view === 'discover' ? ' on' : '') + '" data-act="hubv" data-a="discover">发现</button></div>') + '</div>';
    const off = sc === 'offline' ? banner('warn', 'wifioff', '<b>暂时无法访问平台官方目录</b>。已启用的能力不受影响，仍可正常使用；稍后重试即可浏览与启用新能力。', btn('重试', 'toast', 'info|正在重试…', { c: 'sm' })) : '';
    const connBlock = full => sc === 'offline' ? '' : '<section class="mk-sec"><div class="mk-h"><h3>连接器<span class="n">' + TC.length + '</span></h3><span class="muted" style="font:400 12.5px var(--f)">官方连接器目录；已配置的连接在「插件管理 → 连接」</span></div><div class="mk-grid">' + TC.map(connRow).join('') + '</div></section>';
    let body;
    if (ty === 'all') body = M.kindBlock('skill', view, {}) + M.kindBlock('mcp', view, {}) + connBlock(false);
    else if (ty === 'conn') body = connBlock(true);
    else body = M.kindBlock(ty, view, { full: true });
    return phead('能力市场 · Marketplace', '给助手装配能力：技能、MCP 与连接器；官方内容启用即用', '') + bar_ + tabs + gate(() => off + body, 'list');
  },
});
ACT.tcsave = a => {
  const parts = a.split('|'), res = parts.pop(), id = parts.join('|');
  if (res === 'bad') { toast('bad', '校验失败，未保存'); return; }
  S.drawer = null;
  if (id.startsWith('edit:')) { toast('ok', '凭证已替换并校验通过'); return; }
  const key = id.split('|')[1], t = TC.find(x => x[0] === key) || TC[2], name = key + '-acme' + (S.tcNew.length ? '-' + (S.tcNew.length + 1) : '');
  S.tcNew.unshift({ id: 'tcn' + (S.tcNew.length + 1), name, key, p: t[1], auth: t[3], st: 'ok', use: 0, kbs: [], caps: CAPS[key], fresh: true });
  window.go('connectors');
  toast('ok', '已连接「' + name + '」，可以在配置助手时使用');
};
let wantConn = false;
PMAP.hub.enter = () => { if (wantConn) { S.ui.ht = 'conn'; S.ui.hv = 'discover'; wantConn = false; } };
ACT.tcadd = () => { wantConn = true; window.go('hub'); };
page({
  id: 'connectors', grp: '管理 · 插件管理', title: '连接', layout: 'admin', grp2: '插件管理',
  scn: [['tc-fail', '校验失败 · 替换凭证'], ['kb-only', '只看知识库用']],
  notes: ['**一个连接只有一份**：到某个外部系统的授权（鉴权信息）。同一个连接可以同时用于**知识库同步**和**助手工具**（例如 GitHub / GitLab），所以只在这里管理，不再分成“连接”和“连接器”两处。', '**用途标签**：每个连接标明“知识库（被几个知识库使用）/ 助手工具 / 决策工具”，顶部可切换“全部 / 知识库用 / 助手用”。', '**在使用的地方只看相关的**：新建知识库时只列能做知识库的连接（飞书 / GitHub / GitLab），配助手时只列能当工具的连接。', '**删除有保护**：被知识库使用的连接不能直接删除，详情里列出使用它的知识库。', '**添加入口在能力市场的「连接器」目录**（可连接的系统：GitHub / GitLab / 飞书 / Jira / TypeSafe AI），本页顶部只放一个快捷跳转链接。', '**数据来自生产**：7 个连接（飞书 ×3、GitHub、GitLab、Jira、TypeSafe AI），以及每个连接被哪些知识库使用。助手侧的使用数量后端没有现成统计（需后端提供）。'],
  render() {
    const sc = scn(), all = tcRows(), badc = all.filter(x => x.st !== 'ok').length;
    if (sc === 'kb-only' && S.ui.cuse === undefined) S.ui.cuse = 'kb';
    if (sc === 'tc-fail' && !S.ui.auto && all.length) { S.ui.auto = 1; S.drawer = { kind: 'tconn', id: 'edit:' + (all.find(x => x.st !== 'ok') || all[0]).id, tab: '' }; }
    const use = S.ui.cuse || 'all', cap = x => x.caps || CAPS[x.key] || {};
    const tcs = all.filter(x => use === 'all' ? true : use === 'kb' ? cap(x).kb : (cap(x).tool || cap(x).dec));
    const segsH = '<div class="segs">' + [['all', '全部', all.length], ['kb', '知识库用', all.filter(x => cap(x).kb).length], ['tool', '助手用', all.filter(x => cap(x).tool || cap(x).dec).length]].map(o => '<button class="seg' + (use === o[0] ? ' on' : '') + '" data-act="cuse" data-a="' + o[0] + '">' + o[1] + '<span class="n" style="margin-left:6px;opacity:.7">' + o[2] + '</span></button>').join('') + '</div>';
    const rows = tcs.slice().sort((a, b) => (b.st !== 'ok') - (a.st !== 'ok'));
    const body = all.length ? (rows.length ? '<div class="mk-grid">' + rows.map(tcCard).join('') + '</div>' : H.empty({ sm: true, ic: 'search', t: '没有匹配的连接', d: '切换上面的用途看看。' })) : H.empty({ sm: true, ic: 'key', t: '还没有连接', d: '到能力市场的「连接器」里选一个外部系统，填写你的凭证。', btns: '<a class="lnk" data-act="tcadd" style="cursor:pointer;text-decoration:underline">去能力市场添加连接 ›</a>' });
    return phead('连接', '到外部系统的连接（鉴权信息）：同一个连接可同时用于知识库同步和助手工具；凭证加密保存、不回显', '', all.length || null) + gate(() => '<div class="hint" style="margin:0 0 10px">需要新的连接？<a class="lnk" data-act="tcadd" style="cursor:pointer;text-decoration:underline">去能力市场添加 ›</a></div>' + (badc ? banner('bad', 'warn', '<b>' + badc + ' 个连接校验失败</b>，依赖它的知识库会停止同步、使用它的助手在调用工具时会报错；校验失败的排在最前。') : '') + (all.length ? '<div style="display:flex;margin:0 0 12px">' + segsH + '</div>' : '') + '<section class="mk-sec">' + body + '</section>', 'list');
  },
});
ACT.cuse = a => { S.ui.cuse = a; };
['skills:skill', 'mcp:mcp'].forEach(x => { const [id, t] = x.split(':'); if (PMAP[id]) PMAP[id].enter = () => { S.page = 'hub'; S.ui.ht = t; location.hash = '#/hub'; }; });
if (typeof PAGES !== 'undefined' && PAGES.splice) for (let i = PAGES.length - 1; i >= 0; i--) if (['skills', 'mcp'].indexOf(PAGES[i].id) >= 0) PAGES.splice(i, 1);
INP.hq = v => { S.ui.hq = v; };
ACT.hubv = a => { S.ui.hv = a; S.ui.hc = '全部'; };
ACT.hubty = a => { S.ui.ht = a; S.ui.hc = '全部'; };
ACT.hubclr = () => { S.ui.hq = ''; S.ui.hc = '全部'; S.ui.ht = 'all'; };
ACT.hubmore = () => { S.ui.hall = !S.ui.hall; };
ACT.hubopen = a => { const [k, id] = a.split('|'); if (k === 'conn') openDrawer('tconn', id.startsWith('edit:') ? id : 'new|' + id); else openDrawer('mk', k + '|' + id); };
ACT.hubadd = a => { const [k, id] = a.split('|'); ACT.mkadd(k + '|' + id); };
DRAWERS.tconn = id => {
  const { field, inp, dgrp } = H, edit = id.startsWith('edit:'), row = edit ? tcRows().find(r => r.id === id.slice(5)) : null, key = edit ? (row ? row.key : 'jira') : id.split('|')[1], t = TC.find(x => x[0] === key) || TC[2], fail = scn() === 'tc-fail' || !!(row && row.st === 'bad');
  const pw = (label, hint) => field(label, '<div class="inwrap"><input class="inp mono' + (fail ? ' err' : '') + '" type="password" value="xxxxxxxxxxxxxxxx"><button class="qbtn eye">' + ic('eye') + '</button></div>', { full: 1, err: fail ? '校验失败：401 Unauthorized，凭证无效或已过期' : '', hint: fail ? '' : hint });
  const f = {
    github: field('Personal access token（可选）', '<div class="inwrap"><input class="inp mono' + (fail ? ' err' : '') + '" type="password" value="ghp_xxxxxxxxxxxx"><button class="qbtn eye">' + ic('eye') + '</button></div>', { full: 1, err: fail ? '校验失败：401 Bad credentials，Token 无效或已过期' : '', hint: fail ? '' : '留空则只能匿名访问公开仓库；填写后可访问授权的私有仓库。保存后不再显示明文' }) + field('允许访问的仓库', inp('acme/backend-api, acme/web', { mono: 1 }), { full: 1, hint: '填写 owner/repository，或允许该 Token 可读的全部仓库' }),
    gitlab: field('GitLab 地址', inp('https://gitlab.com', { mono: 1 }), { full: 1 }) + pw('Personal access token（公开项目可留空）', '需要 read_api 与 read_repository 权限。保存后不再显示明文') + field('允许访问的项目', inp('acme/backend', { mono: 1 }), { full: 1 }),
    jira: field('Jira 地址', inp('https://acme.atlassian.net', { mono: 1 }), { full: 1 }) + field('账号', inp('zhang.wei@acme.com')) + '<div></div>' + pw('API Token', '只读权限的 API Token。保存后不再显示明文') + field('允许访问的项目', inp('PROJ, SUP', { mono: 1 }), { full: 1 }),
    feishu: field('App ID', inp('cli_xxxxxxxxxxxx', { mono: 1 }), { full: 1 }) + pw('App Secret', '飞书自建应用的 App Secret，加密保存，保存后不再显示明文'),
    typesafe: field('TypeSafe API 地址', inp('https://api.typesafe.ai', { mono: 1 }), { full: 1 }) + pw('API token', '加密保存，不会写入运行快照') + field('Jev 模型', inp('固定的模型名', { mono: 1 }), { full: 1 }),
  }[key];
  const guide = { github: ['登录 GitHub → Settings → Developer settings → Personal access tokens', '公开仓库可不填 Token；私有仓库授予只读（contents: read）权限', '在“允许访问的仓库”里限定范围，保存时自动校验'], gitlab: ['登录 GitLab → 头像 → Preferences → Access Tokens', '勾选 read_api、read_repository，设置较长有效期', '填写地址与允许访问的项目，保存时自动校验'], jira: ['登录 Atlassian → 账号设置 → Security → API tokens 新建 Token', '用你的 Jira 账号 + 该 Token 填写上方', '限定允许访问的项目，保存时自动校验'], feishu: ['在飞书开放平台创建企业自建应用并发布', '为应用授予云文档 / 云盘 / 知识库的读取权限', '复制 App ID 与 App Secret 填写上方，保存时自动校验'], typesafe: ['在 TypeSafe 控制台创建 API token', '填写 API 地址与要固定使用的 Jev 模型', '保存时自动校验'] }[key];
  return { title: edit ? '替换凭证 · ' + (row ? row.name : t[1]) : '连接 ' + t[1], sub: t[1] + ' · ' + t[3] + (edit && row ? ' · 插件 v1.0.0' : ''), wide: true, body: () => H.banner('info', 'shield', '<b>助手只会拥有只读能力</b>：模型只看到工具说明和参数，不会接触连接信息或密钥。') + '<div class="fgrid">' + field('连接名称', inp(edit && row ? row.name : key + '-acme'), { full: 1 }) + f + '</div>' + (fail ? '' : H.banner('ok', 'okc', '校验通过，助手可以使用它。')) + (edit && row ? dgrp('被谁使用', '<div class="setrow"><div class="sl"><b>用途</b><small>' + (CAPS[key].kb ? '知识库同步' : '') + (CAPS[key].kb && (CAPS[key].tool || CAPS[key].dec) ? ' + ' : '') + (CAPS[key].tool ? '助手只读工具' : '') + (CAPS[key].dec ? '助手决策工具' : '') + '</small></div></div>' + (row.kbs && row.kbs.length ? '<div class="muted" style="margin:6px 0">正在被 ' + row.kbs.length + ' 个知识库使用：</div><div class="sp-chips">' + row.kbs.map(k => '<span class="sp-chip">' + esc(k) + '</span>').join('') + '</div>' : '<div class="muted">还没有知识库使用它。</div>') + ((CAPS[key].tool || CAPS[key].dec) ? '<p class="hint" style="margin:8px 0 0">使用它的助手数量：后端目前没有现成统计，需要后端提供。</p>' : '')) : '') + dgrp('如何获取凭证', '<ol style="margin:0;padding-left:20px;font:400 12.5px/1.9 var(--f);color:var(--fg2)">' + guide.map(x => '<li>' + x + '</li>').join('') + '</ol>'), foot: btn('校验并保存', 'tcsave', id + '|' + (fail ? 'bad' : 'ok'), { k: 'btn-pri' }) + (edit ? btn('删除', 'toast', row && row.kbs && row.kbs.length ? 'bad|不能删除：被 ' + row.kbs.length + ' 个知识库使用，请先解除' : 'info|删除前请先确认没有助手在使用', { c: 'btn-gh' }) : '') + btn('取消', 'dclose') };
};
})();
