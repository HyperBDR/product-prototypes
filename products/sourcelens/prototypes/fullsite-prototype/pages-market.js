/* 市场化：技能库 / MCP Servers（参考插件市场：已安装 + 热门 + 新品 + 搜索 + 一键添加）*/
(function () {
'use strict';
const { ic, esc, ago, fmt, page, scn, cnt, gate, pill, stt, btn, banner, kv, dgrp, empty, toast, openDrawer, bar } = H;
const CF = o => JSON.stringify(o);
S.mk = S.mk || { skill: {}, mcp: {} };

const TONES = [['#e8efff', '#4a68d8'], ['#e6f7ef', '#1fa56f'], ['#fff4de', '#c27a0a'], ['#fdeceb', '#d4503f'], ['#f1eafd', '#6a55c8'], ['#e3f4f7', '#1c8e9e']];
const tone = n => TONES[(n.charCodeAt(0) + n.length) % TONES.length];
const CATS = { skill: ['全部', '代码', '文档', '数据', '运维', '协作'], mcp: ['全部', '项目管理', '数据库', '监控', '协作', '文件'] };
const COPY = {
  skill: { title: '技能库', sub: '启用平台官方技能（环境变量在配置助手时绑定），或上传自己的技能包', tab: '技能', one: 'Skill', up: '上传 Skill', ph: '搜索技能', ic: 'spark', emptyT: '还没有启用官方技能', emptyD: '从下方的平台官方目录一键启用；自己的技能包请切换到「我的」上传。' },
  mcp: { title: 'MCP Servers', sub: '启用平台官方 MCP（环境变量在配置助手时绑定），或接入自己的 Server', tab: 'MCP Servers', one: 'Server', up: '新增 Server', ph: '搜索 MCP Server', ic: 'plug', emptyT: '还没有启用官方 MCP', emptyD: '从下方的平台官方目录一键启用；自己的 Server 请切换到「我的」接入。' },
};
const RD = H.REAL;
const TPL = {
  skill: RD.skills.map(x => [x.slug, x.name, x.desc, '', x.ver, x.upd, x.use]),
  mcp: RD.mcp.map(x => [x.slug, x.name, x.desc, '', x.ver, x.upd, x.use]),
};
const NEEDS = { skill: [], mcp: [] };
/* 租户已启用的平台官方项（引用平台版本，无需复制）；st: ok / env（待配置环境变量）/ bad（连接失败）；plat：变量由平台托管 */
function enabledOfficial(kind) {
  if (S.scale === 'empty' || scn() === 'no-market-new') return [];
  const t = TPL[kind], n = cnt({ few: 2, normal: 5, many: 12 });
  const rows = t.slice(0, Math.min(n, t.length)).map((x, i) => ({ slug: x[0], name: x[1], desc: x[2], src: '平台官方', ver: x[4], st: 'ok', plat: false, brk: scn() === 'breaking' && i === 1, use: x[6] || 0 }));
  Object.keys(S.mk[kind]).forEach(k => { if (S.mk[kind][k] && !rows.some(r => r.slug === k)) { const x = t.find(y => y[0] === k); if (x) rows.unshift({ slug: x[0], name: x[1], desc: x[2], src: '平台官方', ver: x[4], st: 'ok', plat: false, brk: false, use: 0, fresh: true }); } });
  return rows;
}
function ownRows(kind) {
  if (S.scale === 'empty') return [];
  const n = cnt({ few: 0, normal: 0, many: 4 });
  return Array.from({ length: n }, (_, i) => ({ slug: 'own-' + i, name: (kind === 'skill' ? '内部流程 ' : '内部服务 ') + (i + 1), desc: kind === 'skill' ? '团队自己上传的技能包，仅本租户可见' : '团队自己接入的 Server，仅本租户可见', src: kind === 'skill' ? '上传' : '自建', ver: '1.0.' + i, st: i === 1 ? 'env' : 'ok', plat: false, brk: false, use: i % 4, own: true }));
}
const STT = { ok: ['可用', 'ok'], env: ['有助手未绑定变量', 'warn'], bad: ['连接失败', 'bad'] };
const ASN = ['客服助手', '研发问答', '销售支持', '运维值班', '财务助手', '新员工引导'];
/* 使用该项的助手及其环境变量绑定情况：st=env 时第一个助手尚未绑定变量集 */
function usersOf(kind, item) { return Array.from({ length: item.use }, (_, i) => ({ name: ASN[i % ASN.length], set: item.st === 'env' && i === 0 ? '' : (i % 2 ? 'prod-' + kind + '-vars' : 'team-' + kind + '-vars') })); }
function tile(n) { const c = tone(n); return '<span class="mk-tile" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(n[0].toUpperCase()) + '</span>'; }
function instCard(kind, x) {
  return '<button class="mk-card inst" data-act="mkopen" data-a="' + kind + '|' + x.slug + '">' + tile(x.name) + '<span class="mk-tx"><b>' + esc(x.name) + (x.fresh ? ' ' + pill('刚启用', 'ok') : '') + '</b><small>' + esc(x.src) + ' · ' + H.vtxt(x.ver) + ' · ' + x.use + ' 个助手使用</small></span>' +
    '<span class="mk-side">' + (x.brk ? '<span class="pill warn">需确认升级</span>' : '') + (x.plat ? '<span class="pill">' + ic('shield') + '平台托管</span>' : '') + (x.st === 'bad' ? stt(STT[x.st][0], STT[x.st][1]) : '') + '</span></button>';
}
function mkCard(kind, x, enabled) {
  const has = enabled[x[0]];
  return '<div class="mk-card" data-act="mkopen" data-a="' + kind + '|' + x[0] + '" role="button" tabindex="0">' + tile(x[1]) + '<span class="mk-tx"><b>' + esc(x[1]) + '</b><small>' + esc(x[2]) + '</small></span>' +
    (has ? '<span class="mk-done" title="已启用">' + ic('check') + '</span>' : '<button class="mk-add" data-act="mkadd" data-a="' + kind + '|' + x[0] + '" data-stop aria-label="启用">' + ic('plus') + '</button>') + '</div>';
}
function market(kind, embed, view) {
  const C = COPY[kind], sc = scn(), q = (S.ui.mq || '').toLowerCase(), cat = S.ui.mc || '全部', scope = view === 'discover' ? 'official' : 'mine', src = S.ui.mksrc || 'all';
  const en = enabledOfficial(kind), own = ownRows(kind), enMap = {}; en.forEach(x => { enMap[x.slug] = x; });
  const tabs = embed ? '' : '<div class="mk-tabs"><button class="' + (kind === 'skill' ? 'on' : '') + '" data-nav="skills">技能</button><button class="' + (kind === 'mcp' ? 'on' : '') + '" data-nav="mcp">MCP Servers</button></div>';
  const srcTabs = '<div class="mk-cats">' + [['all', '全部'], ['official', '平台官方（' + en.length + '）'], ['mine', '自建 / 上传（' + own.length + '）']].map(t => '<button class="' + (src === t[0] ? 'on' : '') + '" data-act="mksrc" data-a="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
  const intro = scope === 'official' ? '<div class="callout"><b>平台官方目录</b>：由平台统一发布与维护。<b>启用即直接使用，无需复制</b>；已启用的会出现在「已启用」里。</div>' : '<div class="callout"><b>已启用</b>：这里是你租户里正在使用的内容——<b>平台官方</b>的（自动跟随平台更新，重大变更需你确认）和<b>自建 / 上传</b>的（仅本租户可见，由你维护）。环境变量在<b>配置助手时</b>按助手绑定。</div>';
  const search = '<label class="mk-search">' + ic('search') + '<input data-k="mq" data-in="mq" value="' + esc(S.ui.mq || '') + '" placeholder="' + C.ph + '" aria-label="搜索">' + (q ? '<button class="clr" data-act="mkclr" aria-label="清除">' + ic('x') + '</button>' : '') + '</label>';
  const cats = '<div class="mk-cats">' + CATS[kind].map(c => '<button class="' + (cat === c ? 'on' : '') + '" data-act="mkcat" data-a="' + c + '">' + c + '</button>').join('') + '</div>';
  let ban = '';
  const brk = en.filter(x => x.brk).length;
  if (scope === 'official') {
    if (sc === 'offline') ban += banner('warn', 'wifioff', '<b>暂时无法访问平台官方目录</b>。已启用的内容不受影响，仍可正常使用；稍后重试即可浏览与启用新内容。', btn('重试', 'toast', 'info|正在重试…', { c: 'sm' }));
  }
  if (scope === 'mine') {
    if (brk) ban += banner('warn', 'warn', '<b>平台发布了需要你确认的重大变更</b>：「文档摘要」v3.0.0 调整了输出格式。确认前继续使用 v2.0.1。', btn('查看变更', 'mkopen', kind + '|doc-summary', { c: 'sm' }));
  }
  if (scope === 'official' && sc === 'install-fail') ban += banner('bad', 'warn', '<b>启用失败：</b>该内容已被平台下架。请联系平台管理员，或改用其他替代项。');
  if (scope === 'mine' && kind === 'skill' && sc === 'uploading') ban += '<div class="panel pad" style="gap:10px"><div style="display:flex;justify-content:space-between;font:500 13px var(--f)"><span>' + ic('file') + ' code-search-1.4.0.zip</span><span class="mono">62%</span></div>' + bar(62) + '<span class="muted">正在校验 SKILL.md 与依赖…</span></div>';
  if (scope === 'mine' && kind === 'skill' && sc === 'pkg-bad') ban += banner('bad', 'warn', '<b>包校验未通过</b><ul style="margin:6px 0 0;padding-left:18px"><li>压缩包根目录缺少 <span class="mono">SKILL.md</span></li><li>manifest 中的 <span class="mono">entry</span> 指向不存在的文件</li></ul>', btn('重新选择', 'toast', 'info|选择文件', { c: 'sm' }));
  let body;
  if (scope === 'mine') {
    const instSec = '<section class="mk-sec"><div class="mk-h"><h3>平台官方<span class="n">' + en.length + '</span></h3>' + (en.length > 6 ? '<button class="btn btn-ln sm" data-act="mkall">' + (S.ui.mkall ? '收起' : '查看全部') + '</button>' : '') + '</div>' + (en.length ? '<div class="mk-grid">' + en.slice(0, S.ui.mkall ? 999 : 6).map(x => instCard(kind, x)).join('') + '</div>' : empty({ sm: true, ic: C.ic, t: C.emptyT, d: C.emptyD, btns: btn('去目录看看', 'hubv', 'discover', { c: 'sm' }) })) + '</section>';
    const ownBtn = kind === 'skill' ? btn(C.up, 'toast', 'info|选择 .zip 文件（≤ 50 MB，仅本租户可见）', { c: 'sm', i: 'upload' }) : btn(C.up, 'drawer', 'mcpf|', { c: 'sm', i: 'plus' });
    const ownSec = '<section class="mk-sec"><div class="mk-h"><h3>自建 / 上传<span class="n">' + own.length + '</span></h3>' + ownBtn + '</div>' + (own.length ? '<div class="mk-grid">' + own.map(x => instCard(kind, x)).join('') + '</div>' : empty({ sm: true, ic: C.ic, t: '还没有自建的内容', d: kind === 'skill' ? '上传你自己的技能包（含 SKILL.md），仅本租户可见。' : '接入你自己的 MCP Server，仅本租户可见。' })) + '</section>';
    body = (src !== 'mine' ? instSec : '') + (src !== 'official' ? ownSec : '');
  } else {
    const noMarket = sc === 'no-market', offline = sc === 'offline';
    let tpl = noMarket || offline ? [] : TPL[kind].slice(0, S.scale === 'empty' ? TPL[kind].length : cnt({ few: 6, normal: 12, many: TPL[kind].length }));
    if (q) tpl = tpl.filter(x => (x[1] + x[2] + x[0]).toLowerCase().includes(q));
    if (cat !== '全部') tpl = tpl.filter(x => x[3] === cat);
    const hotN = S.scale === 'few' ? 3 : 6, hot = tpl.slice(0, hotN), neo = q || cat !== '全部' ? [] : tpl.slice(hotN, hotN + 4), more = S.ui.mkmore ? tpl.slice(hotN + 4) : [], restN = tpl.length - hotN - 4;
    const sec = (title, list) => list.length ? '<section class="mk-sec"><div class="mk-h"><h3>' + title + '</h3></div><div class="mk-grid">' + list.map(x => mkCard(kind, x, enMap)).join('') + '</div></section>' : '';
    if (noMarket) body = '<section class="mk-sec">' + empty({ sm: true, ic: 'spark', t: '平台还没有发布官方内容', d: '平台发布后会出现在这里；你仍可在「已启用」里上传或接入自己的内容。' }) + '</section>';
    else if (offline) body = '';
    else if (!tpl.length) body = '<section class="mk-sec">' + empty({ sm: true, ic: 'search', t: '没有找到匹配的内容', d: '换个关键词，或清除分类筛选。', btns: btn('清除筛选', 'mkclr', null, { c: 'sm' }) }) + '</section>';
    else body = sec(q || cat !== '全部' ? '搜索结果' : '热门', hot) + sec('新品推荐', neo) + sec('更多', more) + (!S.ui.mkmore && restN > 0 && !q && cat === '全部' ? '<div style="text-align:center"><button class="btn btn-gh" data-act="mkmoreb">显示更多（' + restN + '）</button></div>' : '');
  }
  return (scope === 'mine' ? srcTabs : '') + intro + (scope === 'official' ? search + cats : '') + ban + gate(() => body, 'list');
}
/* 单层版：某一类能力的一个区块（已启用 / 目录），不含搜索、分类与标签 */
const catOf = (kind, x) => (x.slug || '').startsWith('own-') ? '自建' : '平台官方';
function catsOf(kind, view) {
  if (view !== 'mine') return [];
  const names = enabledOfficial(kind).concat(ownRows(kind)).map(x => catOf(kind, x)), c = {};
  names.forEach(n => { c[n] = (c[n] || 0) + 1; });
  return Object.keys(c).map(k => [k, c[k]]);
}
function kindBlock(kind, view, o) {
  o = o || {};
  const C = COPY[kind], sc = scn(), en = enabledOfficial(kind), own = ownRows(kind), enMap = {}, label = kind === 'skill' ? '技能' : 'MCP Servers';
  en.forEach(x => { enMap[x.slug] = x; });
  const sec = (n, extra, inner) => '<section class="mk-sec"><div class="mk-h"><h3>' + label + (n === null ? '' : '<span class="n">' + n + '</span>') + '</h3>' + (extra ? '<span style="margin-left:auto;display:flex;gap:8px;align-items:center">' + extra + '</span>' : '') + '</div>' + inner + '</section>';
  let ban = '';
  if (view === 'mine') {
    const brk = en.filter(x => x.brk).length;
    if (brk) ban += banner('warn', 'warn', '<b>平台发布了需要你确认的重大变更</b>：「文档摘要」v3.0.0 调整了输出格式。确认前继续使用 v2.0.1。', btn('查看变更', 'mkopen', kind + '|doc-summary', { c: 'sm' }));
    if (kind === 'skill' && sc === 'uploading') ban += '<div class="panel pad" style="gap:10px"><div style="display:flex;justify-content:space-between;font:500 13px var(--f)"><span>' + ic('file') + ' code-search-1.4.0.zip</span><span class="mono">62%</span></div>' + bar(62) + '<span class="muted">正在校验 SKILL.md 与依赖…</span></div>';
    if (kind === 'skill' && sc === 'pkg-bad') ban += banner('bad', 'warn', '<b>包校验未通过</b><ul style="margin:6px 0 0;padding-left:18px"><li>压缩包根目录缺少 <span class="mono">SKILL.md</span></li><li>manifest 中的 <span class="mono">entry</span> 指向不存在的文件</li></ul>', btn('重新选择', 'toast', 'info|选择文件', { c: 'sm' }));
    let all = en.concat(own);
    if (o.cat && o.cat !== '全部') all = all.filter(x => catOf(kind, x) === o.cat);
    const shown = o.full ? all : all.slice(0, 6);
    const add = kind === 'skill' ? btn(C.up, 'toast', 'info|选择 .zip 文件（≤ 50 MB，仅本租户可见）', { c: 'sm', i: 'upload' }) : btn(C.up, 'drawer', 'mcpf|', { c: 'sm', i: 'plus' });
    const more = !o.full && all.length > 6 ? '<button class="btn btn-ln sm" data-act="hubty" data-a="' + kind + '">查看全部</button>' : '';
    return ban + sec(all.length, more + add, all.length ? '<div class="mk-grid">' + shown.map(x => instCard(kind, x)).join('') + '</div>' : empty({ sm: true, ic: C.ic, t: C.emptyT, d: '到「发现」里挑一个官方' + label + '，或自己上传 / 接入。' }));
  }
  if (sc === 'install-fail' && kind === 'skill') ban += banner('bad', 'warn', '<b>启用失败：</b>该内容已被平台下架。请联系平台管理员，或改用其他替代项。');
  if (sc === 'offline') return '';
  if (sc === 'no-market') return ban + sec(null, '', empty({ sm: true, ic: 'spark', t: '平台还没有发布官方内容', d: '平台发布后会出现在这里；你仍可在「已启用」里上传或接入自己的内容。' }));
  let tpl = TPL[kind].slice(0, S.scale === 'empty' ? TPL[kind].length : cnt({ few: 6, normal: 12, many: TPL[kind].length }));
  const shown = o.full ? tpl : tpl.slice(0, 6);
  return ban + sec(tpl.length, !o.full && tpl.length > 6 ? '<button class="btn btn-ln sm" data-act="hubty" data-a="' + kind + '">查看全部</button>' : '', '<div class="mk-grid">' + shown.map(x => mkCard(kind, x, enMap)).join('') + '</div>');
}
ACT.mkallk = a => { S.ui[a] = !S.ui[a]; };
INP.mq = v => { S.ui.mq = v; };
ACT.mksrc = a => { S.ui.mksrc = a; };
ACT.mkcat = a => { S.ui.mc = a; };
ACT.mkclr = () => { S.ui.mq = ''; S.ui.mc = '全部'; };
ACT.mkall = () => { S.ui.mkall = !S.ui.mkall; };
ACT.mkmoreb = () => { S.ui.mkmore = true; };
ACT.mkopen = a => { const [k, id] = a.split('|'); openDrawer('mk', k + '|' + id); };
ACT.mkadd = a => { const [k, id] = a.split('|'); if (scn() === 'install-fail') { toast('bad', '启用失败：该内容已被平台下架'); return; } S.mk[k][id] = true; const x = TPL[k].find(y => y[0] === id); toast('ok', '已启用「' + (x ? x[1] : id) + '」，可在助手配置里添加并绑定环境变量'); };
ACT.mkconfirm = a => { toast('ok', '已确认升级到 v3.0.0'); };

DRAWERS.mk = id => {
  const [kind, slug] = id.split('|'), x = TPL[kind].find(y => y[0] === slug) || [slug, slug, '', '', '1.0.0'];
  const own = slug.startsWith('own-'), item = own ? ownRows(kind).find(r => r.slug === slug) : enabledOfficial(kind).find(r => r.slug === slug), has = !!item;
  const nm = own ? (item ? item.name : slug) : x[1], desc = own ? (item ? item.desc : '') : x[2];
  const vars = NEEDS[kind], us = has ? usersOf(kind, item) : [];
  const declared = vars.map(v => '<div class="envrow"><span class="mono2" style="flex:1"><b>' + v[0] + '</b><small class="muted"> ' + v[1] + '</small></span>' + (has && item.plat ? '<span class="pill">' + ic('shield') + '平台托管</span>' : '') + '</div>').join('');
  const envSec = dgrp('所需环境变量', declared + (has && item.plat ? '<div class="callout" style="margin-top:8px"><b>由平台托管</b>：凭证由平台统一提供，你无需配置，也无法查看其值。</div>' : '<p class="hint" style="margin:8px 0 0">这里只列出<b>需要哪些变量</b>，不填值。值在<b>配置助手 › 技能</b>时，为每个助手选一个环境变量集（来自「插件管理 › 环境变量」；也可以在配置助手时直接新建配置集）；同一个技能在不同助手里可以用不同的变量集。</p>'));
  const useSec = has ? dgrp('使用它的助手（' + us.length + '）', us.length ? us.map(u => '<div class="prow"><span style="flex:1">' + esc(u.name) + '</span>' + (item.plat ? stt('平台托管', 'ok') : u.set ? '<span class="mono2 muted">' + esc(u.set) + '</span>' + stt('已绑定', 'ok') : stt('未绑定变量集', 'warn')) + '</div>').join('') + (item.plat ? '' : '<div style="margin-top:10px;display:flex;gap:8px">' + '<button class="btn btn-ln sm" data-nav="assistants">去助手配置</button><button class="btn btn-ln sm" data-nav="envvars">管理环境变量集</button>' + '</div>') : '<div class="muted">还没有助手使用它。</div>') : '';
  return { title: nm, sub: (own ? '我的 · ' : '平台官方 · ') + H.vtxt(has ? item.ver : x[4]), wide: true, body: () =>
    (has && item.brk ? banner('warn', 'warn', '<b>重大变更待确认：v3.0.0</b>。输出格式有调整，可能影响已绑定助手。确认前继续使用 ' + H.vtxt(item.ver) + '。', btn('确认升级', 'mkconfirm', kind + '|' + slug, { c: 'sm', k: 'btn-pri' })) : '') +
    (has && item.st === 'bad' ? banner('bad', 'warn', '<b>连接失败</b>：connect ECONNREFUSED，请检查你配置的地址与凭证。') : '') +
    '<p style="margin:0 0 14px;font:400 14px/1.7 var(--f);color:var(--fg2)">' + esc(desc) + '</p>' +
    dgrp('信息', kv([['来源', own ? '本租户自建 / 上传（仅你可见）' : '平台官方（由平台维护）'], ['版本', '<span class="mono">v' + (has ? item.ver : x[4]) + '</span>' + (own ? '' : ' <span class="muted">· 跟随平台最新</span>')], ['分类', esc(x[3] || '—')], ['被使用', has ? item.use + ' 个助手' : '—']])) +
    (kind === 'skill' ? dgrp('SKILL.md', '<div class="code" style="white-space:pre-wrap">---\nname: ' + esc(nm) + '\ndescription: ' + esc(desc) + '\n---\n\n# 使用说明\n先定位相关内容，再读取片段并给出引用。</div>') : dgrp('暴露的工具', ['search', 'get', 'list', 'create'].map(t => '<div class="prow"><span class="mono2" style="flex:1">' + t + '_' + slug.split('-')[0] + '</span>' + (t === 'create' ? pill('写操作', 'warn') : pill('只读', '')) + '</div>').join(''))) +
    envSec + useSec + (has || own ? '' : '<div class="callout"><b>启用 = 直接使用平台官方版本</b>，不会复制到你的租户；环境变量在配置助手时再绑定。平台更新时自动跟随，重大变更会提前通知。</div>'),
    foot: has ? btn('关闭', 'dclose') + '<span style="margin-left:auto"></span>' + btn(own ? '删除' : '停用', 'confirm', CF({ tone: 'danger', ic: 'trash', title: (own ? '删除「' : '停用「') + nm + '」？', desc: item.use ? '<b>' + item.use + ' 个助手</b>正在使用它，' + (own ? '删除' : '停用') + '后这些助手将失去该能力。' : '没有助手使用它，可以安全' + (own ? '删除' : '停用') + '。', ok: own ? '删除' : '停用', then: own ? '已删除' : '已停用' }), { i: 'trash' }) : btn('启用到 ' + window.ZONES.tname(), 'mkadd', kind + '|' + slug, { k: 'btn-pri', i: 'plus' }) + btn('取消', 'dclose') };
};

const NOTES = {
  skill: ['**官方与自建严格分开**：顶部两个标签——「平台官方」（平台维护，启用即用）与「我的」（本租户自建 / 上传）。两边的内容、权限、更新方式都不同，不混在一起。', '**官方内容是引用，不是复制**：启用后直接使用平台版本、自动跟随更新；重大变更需要租户确认后才升级。环境变量不在这里填。', '**环境变量在配置助手时绑定**：技能库只显示“需要哪些变量”；值放在租户自己的「环境变量」变量集里（加密，平台看不到），在助手 › 技能处按助手绑定。平台托管的变量只显示“平台托管”。', '**状态直出**：有助手未绑定变量、连接失败直接标在卡片上，并在顶部汇总；停用 / 删除前列出受影响的助手。', '**边界**：空（未启用）、平台暂不可达、平台无官方内容、启用失败（已下架）、重大变更待确认、上传校验失败。'],
  mcp: ['**同技能库**：官方 MCP 启用即用，环境变量（Token / 站点地址等）在配置助手时绑定变量集；自建 Server 放在「我的」。', '**写操作标识**：详情里暴露的工具区分“只读 / 写操作”，管理员启用前能看清风险。'],
};
['skill', 'mcp'].forEach(kind => {
  const id = kind === 'skill' ? 'skills' : 'mcp', def = PMAP[id], C = COPY[kind];
  def.title = C.title;
  def.scn = kind === 'skill' ? [['breaking', '重大变更待确认'], ['install-fail', '启用失败 · 已下架'], ['offline', '平台目录暂不可达'], ['no-market', '平台无官方内容'], ['uploading', '上传中（我的）'], ['pkg-bad', '包格式错误（我的）']] : [['breaking', '重大变更待确认'], ['install-fail', '启用失败 · 已下架'], ['offline', '平台目录暂不可达'], ['no-market', '平台无官方内容'], ['form', '自建 Server · 校验失败']];
  def.notes = NOTES[kind];
  def.render = function () {
    if (kind === 'mcp' && scn() === 'form' && !S.ui.auto) { S.ui.auto = 1; S.ui.mkscope = 'mine'; S.drawer = { kind: 'mcpf', id: '', tab: '' }; }
    if ((scn() === 'uploading' || scn() === 'pkg-bad') && !S.ui.mkscope) S.ui.mkscope = 'mine';
    return H.phead(C.title, C.sub, S.ui.mkscope === 'mine' ? (kind === 'skill' ? btn(C.up, 'toast', 'info|选择 .zip 文件（≤ 50 MB，仅本租户可见）', { k: 'btn-pri', i: 'upload' }) : btn(C.up, 'drawer', 'mcpf|', { k: 'btn-pri', i: 'plus' })) : '', null) + market(kind);
  };
});

/* ═════ 连接管理：以“连接的知识库”为中心 ═════ */
const PROV = [['GitLab', 'HTTPS Token', 'branch'], ['GitHub', 'HTTPS Token', 'branch'], ['飞书', '飞书应用（App ID + Secret）', 'file']];
const DSN = ['backend-api', '产品文档', '运维手册', '合同库', '飞书知识库', '客服工单', 'frontend-web', '设计规范'];
const PLBL = { feishu: '飞书', github: 'GitHub', gitlab: 'GitLab' };
function connRows() {
  const real = RD.conns.filter(c => PLBL[c.plugin]), r = H.rng(51), n = cnt({ few: 3, normal: real.length, many: 40 });
  return Array.from({ length: n }, (_, i) => { const c = real[i % real.length], p = PROV.find(x => x[0] === PLBL[c.plugin]); return { id: 'c' + i, name: c.name + (i >= real.length ? ' ' + (i + 1) : ''), p: p[0], auth: p[1], url: '', st: scn() === 'verify-fail' && i === 0 ? 'bad' : 'ok', ds: c.kbs.map(k => ({ n: k, bad: false })), age: H.int(r, 5, 9000) }; });
}
const CST = { ok: ['有效', 'ok'], bad: ['校验失败', 'bad'], exp: ['已过期', 'bad'] };
function connCard(x) {
  return '<button class="mk-card inst" data-act="drawer_conn" data-a="' + x.id + '">' + tile(x.name) + '<span class="mk-tx"><b>' + esc(x.name) + '</b><small>' + esc(x.p) + ' · ' + esc(x.auth) + ' · ' + x.ds.length + ' 个知识库使用' + '</small></span>' +
    '<span class="mk-side">' + stt(CST[x.st][0], CST[x.st][1]) + '</span></button>';
}
const CDEF = PMAP.connections;
CDEF.notes = ['**菜单与知识库同级**：「连接」与「知识库」并列，在「知识库管理」下；知识库来源需要登录时（私有 GitHub / GitLab、飞书）先在这里配一条鉴权，再去建知识库。', '**鉴权只配一次、多个知识库共用**：每条鉴权直接展示依赖它的知识库（名称 + 同步状态点），失效时一眼看到会影响哪些知识库。', '**真实支持的类型**：GitHub / GitLab（HTTPS Token，公开仓库可免鉴权）、飞书（App ID + Secret）。', '**需处理置前**：校验失败或已过期的排在前面，并在顶部给出汇总提示。', '**凭证脱敏**：永不回显明文，更新凭证为“替换”。'];
CDEF.body = function (view) {
  const rows = connRows(), tab = S.ui.ctab || 'all', q = (S.ui.cq || '').toLowerCase();
  const bad = rows.filter(x => x.st !== 'ok');
  const cats = [['all', '全部'], ['bad', '需处理' + (bad.length ? '（' + bad.length + '）' : '')]].concat(PROV.map(p => [p[0], p[0]]));
  let list = rows.filter(x => tab === 'all' ? true : tab === 'bad' ? x.st !== 'ok' : x.p === tab);
  if (q) list = list.filter(x => (x.name + x.url + x.p).toLowerCase().includes(q));
  list = list.slice().sort((a, b) => (b.st !== 'ok') - (a.st !== 'ok'));
  const lim = S.ui.cmore ? 999 : 6, shown = list.slice(0, lim);
  const intro = '<div class="callout"><b>连接</b>（鉴权信息）：访问知识库来源所需的凭证，例如 GitLab Token、飞书 App Secret（与能力市场里给助手用的「连接器」不同）。凭证只配一次，新建知识库时可直接选用、多个知识库共用；失效时依赖它的知识库会停止同步。按服务商分类，需处理的排在前面。</div>';
  const search = '<label class="mk-search">' + ic('search') + '<input data-k="cq" data-in="cq" value="' + esc(S.ui.cq || '') + '" placeholder="搜索连接名称 / 地址 / 服务商" aria-label="搜索">' + (q ? '<button class="clr" data-act="cclr" aria-label="清除">' + ic('x') + '</button>' : '') + '</label>';
  const catsH = '<div class="mk-cats">' + cats.map(t => '<button class="' + (tab === t[0] ? 'on' : '') + '" data-act="ctab" data-a="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
  const ban = bad.length ? banner('bad', 'warn', '<b>' + bad.length + ' 条鉴权需要处理</b>，共影响 ' + bad.reduce((a, x) => a + x.ds.length, 0) + ' 个知识库的同步。', '<button class="btn btn-gh sm" data-act="ctab" data-a="bad">只看需处理</button>') : '';
  const inner = !rows.length ? empty({ sm: true, ic: 'link', t: '还没有鉴权', d: '点右上角「新建鉴权」，填写你的凭证即可。' })
    : !list.length ? empty({ sm: true, ic: 'search', t: '没有匹配的鉴权', d: '换个关键词，或切换分类。', btns: btn('清除筛选', 'cclr', null, { c: 'sm' }) })
    : '<div class="mk-grid">' + shown.map(connCard).join('') + '</div>';
  const inst = '<section class="mk-sec"><div class="mk-h"><h3>已配置<span class="n">' + rows.length + '</span></h3>' + (list.length > 6 ? '<button class="btn btn-ln sm" data-act="cmoreb">' + (S.ui.cmore ? '收起' : '查看全部') + '</button>' : '') + '</div>' + inner + '</section>';
  const gallery = '<section class="mk-sec"><div class="mk-h"><h3>官方连接器</h3></div><div class="mk-grid">' + PROV.map(p => '<div class="mk-card" data-act="cnew" data-a="' + p[0] + '" role="button" tabindex="0">' + tile(p[0]) + '<span class="mk-tx"><b>' + p[0] + '</b><small>' + p[1] + ' · 平台官方发布，填写你的凭证即可使用</small></span><button class="mk-add" data-act="cnew" data-a="' + p[0] + '" data-stop aria-label="添加">' + ic('plus') + '</button></div>').join('') + '</div></section>';
  const introD = '<div class="callout"><b>平台官方连接器</b>：由平台统一发布，租户不能自建。选一个连接器、填写你自己的凭证即可；凭证只保存为脱敏环境变量。已配置的连接在「已连接」里管理。</div>';
  return gate(() => view === 'discover' ? introD + gallery : intro + ban + inst, 'list');
};
CDEF.render = function () { if ((scn() === 'form' || scn() === 'verify-fail') && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'conn', id: '', tab: '' }; } return H.phead('连接', '访问知识库来源所需的鉴权信息（Token、App Secret 等）；配一次，多个知识库共用', btn('新建鉴权', 'cnew', 'GitLab', { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : connRows().length) + CDEF.body('mine'); };
ACT.cw = a => { S.ui.cw = a; };
INP.cq = v => { S.ui.cq = v; };
ACT.ctab = a => { S.ui.ctab = a; S.ui.cmore = false; };
ACT.cclr = () => { S.ui.cq = ''; S.ui.ctab = 'all'; };
ACT.cmoreb = () => { S.ui.cmore = !S.ui.cmore; };
ACT.cnew = a => { S.ui.cprov = a; openDrawer('conn', ''); };
const _conn = DRAWERS.conn;
DRAWERS.conn = (id, tab) => {
  const d = _conn(id, tab), pv = S.ui.cprov || 'GitLab';
  if (id || pv === 'GitLab') return d;
  const b = d.body; d.body = (t) => b(t).replace('<option value="GitLab" selected>', '<option value="GitLab">').replace('<option value="' + pv + '">', '<option value="' + pv + '" selected>');
  d.sub = pv + ' · ' + (PROV.find(p => p[0] === pv) || ['', 'API Token'])[1];
  return d;
};

/* ═════ 助手：卡片视图（默认）/ 表格视图 ═════ */
(function () {
  const def = PMAP.assistants, orig = def.render;
  function card(x) {
    const st = H.ASTAT[x.st], warn = x.st === 'modelgone' || x.st === 'incomplete', c = tone(x.name);
    return '<div class="as-card' + (warn ? ' warn' : '') + '" data-act="drawer_asst" data-a="' + x.id + '" role="button" tabindex="0">' +
      '<div class="as-top"><span class="mk-tile" style="background:' + c[0] + ';color:' + c[1] + '">' + ic('bot') + '</span><div class="cname" style="flex:1;min-width:0"><span class="nm">' + esc(x.name) + '</span><span class="slug">' + x.slug + '</span></div>' + stt(st[0], st[1]) + '</div>' +
      (x.why ? '<div class="as-why ' + (x.st === 'modelgone' ? 'bad' : '') + '">' + ic('warn') + esc(x.why) + '</div>' : '') +
      '<div class="as-meta"><span>' + ic('bolt') + esc(x.model) + '</span><span>' + ic('server') + esc(x.node) + '</span>' + pill(H.VIS[x.vis][0], H.VIS[x.vis][1]) + '</div>' +
      '<div class="as-stats"><span><b>' + x.ds + '</b>知识库</span><span><b>' + x.sk + '</b>技能</span><span><b>' + x.mcp + '</b>MCP</span><span><b>' + fmt(x.q) + '</b>近 30 天提问</span></div></div>';
  }
  def.render = function () {
    if ((S.ui.av || 'card') === 'table' || scn() === 'wizard' || scn() === 'wizard-err' || scn() === 'model-gone' || scn() === 'bulk-vis') {
      const base = orig.apply(this, arguments);
      return base.replace(/(<div class="phead">[\s\S]*?)(<div class="acts">)/, '$1$2' + viewToggle() );
    }
    const rows = H.assistantRows(), bad = rows.filter(x => x.st === 'modelgone' || x.st === 'incomplete'), q = (S.ui.aq2 || '').toLowerCase(), seg = S.ui.as || '';
    let list = rows.filter(x => !seg || (seg === 'incomplete' ? bad.includes(x) : x.st === seg)).filter(x => !q || (x.name + x.slug).toLowerCase().includes(q));
    const lim = S.ui.asmore ? 999 : 12, shown = list.slice(0, lim);
    const ban = bad.length && S.scale !== 'empty' ? banner('warn', 'warn', '<b>' + bad.length + ' 个助手需要处理</b>：' + rows.filter(x => x.st === 'modelgone').length + ' 个使用的模型已下线，' + rows.filter(x => x.st === 'incomplete').length + ' 个依赖的节点离线。', '<button class="btn btn-gh sm" data-act="repl">批量替换模型</button>') : '';
    const segs = '<div class="segs">' + [['', '全部', rows.length], ['active', '启用', rows.filter(x => x.st === 'active').length], ['disabled', '停用', rows.filter(x => x.st === 'disabled').length], ['incomplete', '需处理', bad.length]].map(o => '<button class="seg' + (seg === o[0] ? ' on' : '') + '" data-act="asseg" data-a="' + o[0] + '">' + o[1] + '<span class="n">' + o[2] + '</span></button>').join('') + '</div>';
    const bar = '<div class="as-bar">' + segs + '<label class="search">' + ic('search') + '<input data-k="aq2" data-in="aq2" value="' + esc(S.ui.aq2 || '') + '" placeholder="搜索助手名称 / slug" aria-label="搜索"></label>' + '<button class="btn btn-gh sm" data-act="asview" data-a="table">' + ic('list') + '批量操作（表格）</button>' + viewToggle(true) + '</div>';
    const body = !rows.length ? empty({ ic: 'bot', t: '还没有助手', d: '助手把知识库、模型和技能组合起来，对用户提供带引用的问答。先创建第一个。', btns: btn('新建助手', 'awiz', null, { k: 'btn-pri', i: 'plus' }) })
      : !list.length ? empty({ sm: true, ic: 'search', t: '没有匹配的助手', d: '换个关键词或切换状态。', btns: btn('清除筛选', 'asclr', null, { c: 'sm' }) })
      : '<div class="as-grid">' + shown.map(card).join('') + '</div>' + (list.length > lim ? '<div style="text-align:center"><button class="btn btn-gh" data-act="asmore">显示更多（' + (list.length - lim) + '）</button></div>' : '');
    return H.phead('助手', '管理对用户开放的 AI 助手：数据范围、模型、技能与可见性', btn('新建助手', 'awiz', null, { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + gate(() => ban + (rows.length ? bar : '') + body, 'cards');
  };
  function viewToggle(inBar) {
    const v = S.ui.av || 'card';
    return '<div class="vt-tgl' + (inBar ? '' : ' float') + '"><button class="' + (v === 'card' ? 'on' : '') + '" data-act="asview" data-a="card" aria-label="卡片视图" title="卡片视图">' + ic('layers') + '</button><button class="' + (v === 'table' ? 'on' : '') + '" data-act="asview" data-a="table" aria-label="表格视图" title="表格视图">' + ic('list') + '</button></div>';
  }
  INP.aq2 = v => { S.ui.aq2 = v; S.ui.asmore = false; };
  ACT.asview = a => { S.ui.av = a; };
  ACT.asseg = a => { S.ui.as = a; S.ui.asmore = false; };
  ACT.asclr = () => { S.ui.aq2 = ''; S.ui.as = ''; };
  ACT.asmore = () => { S.ui.asmore = true; };
  def.notes = ['**默认卡片视图**：助手是“产品”，卡片一眼看到状态、模型、节点和四个关键数字；需要批量操作时可切到表格视图。', '**风险前置**：模型失效 / 节点离线的助手卡片带黄色描边与原因，顶部汇总并可一键批量替换模型。'].concat(def.notes || []);
})();
H.MKX = { market, kindBlock, catsOf, instCard, connCard, connBody: v => CDEF.body(v), COPY, TPL, tone, tile, enabledOfficial, ownRows, PROV, connRows, usersOf, STT };
})();
if (typeof PAGES !== 'undefined' && PAGES.splice) for (let i = PAGES.length - 1; i >= 0; i--) if (PAGES[i].id === 'nodes') PAGES.splice(i, 1);
if (PMAP.connections) PMAP.connections.enter = () => { S.page = 'connectors'; location.hash = '#/connectors'; };
if (typeof PAGES !== 'undefined' && PAGES.splice) for (let i = PAGES.length - 1; i >= 0; i--) if (PAGES[i].id === 'connections') PAGES.splice(i, 1);
