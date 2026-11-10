/* API Key 管理：外部应用 / 技能通过 API Key 调用助手。API Key 只有一个 Secret（SK），没有 AK。
   API Key 由租户管理员在这里创建（平台管理员和普通成员都不需要自己建）；租户管理员管本租户的 Key（创建 / 轮换 / 停用 / 吊销）；平台管理员跨租户总览，只能停用 / 吊销，不能创建或查看 Secret。 */
(function () {
'use strict';
const { ic, esc, rng, pick, int, ago, av, fmt, page, scn, cnt, gate, stt, btn, field, inp, slt, banner, kv, dgrp, phead, empty, listPage, toast, openDrawer, PEOPLE } = H;
const CF = o => JSON.stringify(o);
const mi = (i, t, o) => Object.assign({ i, t }, o || {});
S.akNew = S.akNew || [];

const APPS = ['飞书机器人', 'Claude 技能 · 工程周报', 'CI 流水线', '客服系统集成', '数据看板', 'Cursor 插件', '内部门户', '周报自动化'];
const TENANTS = ['Acme 科技', 'Beta 金融', 'Gamma 制造', 'Delta 教育'];
const AST = { ok: ['有效', 'ok'], off: ['已停用', ''], expired: ['已过期', 'warn'], revoked: ['已吊销', 'bad'] };
const ASSISTANTS = ['产品文档助手', '运维助手', '合同审阅', '客服知识库', '研发周报'];

function akRows(allTenants) {
  const n = cnt({ few: 3, normal: 9, many: 120 }), r = rng(allTenants ? 331 : 321), sc = scn();
  const rows = Array.from({ length: n }, (_, i) => {
    const st = i === 3 ? 'off' : i === 5 ? 'expired' : 'ok', never = i === 4, stale = i === 6 || sc === 'expiring' && i % 3 === 1;
    return {
      id: 'ak' + i, name: APPS[i % 8] + (i > 7 ? ' ' + (i - 7) : ''), tail: (4096 + int(r, 0, 60000)).toString(16).slice(0, 4), by: PEOPLE[i % 2 ? 6 : 0], tenant: allTenants ? TENANTS[i % 4] : 'Acme 科技',
      as: i % 4 === 0 ? 0 : int(r, 1, 4), exp: i === 5 ? -3 : i === 2 || sc === 'expiring' && i % 3 === 0 ? int(r, 2, 6) : i % 3 === 1 ? null : int(r, 30, 300),
      last: never ? null : stale ? 60 * 24 * int(r, 35, 90) : i === 0 ? 3 : int(r, 10, 60 * 24 * 5), calls: never ? 0 : int(r, 4, 5200), age: int(r, 60 * 24 * 3, 60 * 24 * 200), st,
    };
  });
  return S.akNew.filter(x => !allTenants || true).concat(rows);
}
const expTxt = x => x.exp === null ? '永不过期' : x.exp < 0 ? '已于 ' + (-x.exp) + ' 天前过期' : '还有 ' + x.exp + ' 天';
const lastTxt = x => x.last === null ? '<span class="pill warn">从未使用</span>' : x.last > 60 * 24 * 30 ? '<span class="muted">' + ago(x.last) + '</span> <span class="pill warn">长期未用</span>' : '<span class="muted">' + ago(x.last) + '</span>';
const scopeTxt = x => x.as === 0 ? '全部助手' : x.as + ' 个助手';
const hint = rows => {
  const soon = rows.filter(x => x.st === 'ok' && x.exp !== null && x.exp >= 0 && x.exp <= 7).length, stale = rows.filter(x => x.st === 'ok' && (x.last === null || x.last > 60 * 24 * 30)).length;
  return soon || stale ? banner('warn', 'clock', '<b>' + (soon ? soon + ' 个 Key 将在 7 天内过期' : '') + (soon && stale ? '，' : '') + (stale ? stale + ' 个 Key 从未使用或超过 30 天未使用' : '') + '</b>。外部应用依赖的 Key 过期会导致调用失败；不再使用的建议停用或吊销。') : '';
};

/* ═════ 租户：API Key 管理 ═════ */
page({
  id: 'apikeys', grp: '管理 · 租户管理', title: 'API Key', layout: 'admin', grp2: '租户管理',
  scn: [['created', '新建成功 · 一次性展示 Key'], ['expiring', '即将过期 / 长期未使用'], ['rotate', '轮换密钥 · 展示新 Key'], ['revoke', '吊销确认 · 影响面'], ['bulk-ext', '批量延长有效期']],
  notes: ['**批量操作**：启用 / 停用 / **延长有效期**（永不过期、已过期的自动跳过，延期不改变 Key）/ 吊销。成员被停用时会联动提示其创建的 Key（见成员管理）。**不提供批量轮换**：Key 只显示一次，批量轮换会让一批外部应用同时失效。', '**为什么要有这一页**：外部应用、技能（Skills）通过 API Key 访问 SourceLens，Key 一多就没人说得清“谁建的、给谁用、还在不在用”。这里集中管理，租户管理员和平台管理员都能看。', '**API Key 只有一个 Secret（SK），没有 AK**：创建（或轮换）后只展示一次完整的 Key，平台只保存哈希，丢了只能轮换；列表里只显示尾号用于识别。', '**可见范围可收窄**：每个 Key 可限定只能调用哪些助手（默认全部），按应用最小授权。', '**生命周期**：有效期（可选永不过期）、停用 / 启用、轮换、吊销；即将过期、从未使用、长期未用都会提示，避免“僵尸 Key”。', '**可追溯**：谁建的、最近何时被谁调用、近 7 天调用次数、最近调用明细都能看到；所有管理操作记入审计。', '**创建只在租户管理员这里**：API Key 由租户管理员新建，平台管理员和普通成员都不需要也不能自己建；平台管理员在「平台控制台 → API Key 总览」里跨租户查看，只能停用 / 吊销，不能创建或查看 Key。'],
  render() {
    const rows = akRows(false), sc = scn();
    if (sc === 'created' && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'akdone', id: 'new|CI 流水线', tab: '' }; }
    if (sc === 'rotate' && !S.ui.auto) { S.ui.auto = 1; S.drawer = { kind: 'akdone', id: 'rot|飞书机器人', tab: '' }; }
    if (sc === 'revoke' && !S.ui.auto) { S.ui.auto = 1; S.dialog = JSON.parse(revokeDlg(rows[0])); }
    if (sc === 'bulk-ext' && !S.ui.auto) { S.ui.auto = 1; S.tbl.apikeys = Object.assign(H.T('apikeys'), { sel: rows.slice(0, 5).map(x => x.id) }); S.ui.bext = '90 天'; S.dialog = { html: bulkExtHTML(), side: true }; }
    return phead('API Key', '外部应用 / 技能通过 API Key 调用你租户里的助手；在这里统一创建、查看和吊销', btn('新建 API Key', 'drawer', 'aknew|', { k: 'btn-pri', i: 'plus' }), S.scale === 'empty' ? null : rows.length) + H.dataNote('API Key 的创建、“最近使用”和“近 7 天调用次数”需要<b>后端新增 AccessKey 与调用记录</b>（issue #38 的方案尚未实现），目前没有这些数据；本页为设计稿示意。') + gate(() => (S.scale === 'empty' ? '' : hint(rows)) + listPage({
      id: 'apikeys', rows: S.scale === 'empty' ? [] : rows, ph: '搜索名称 / 创建人', searchKeys: ['name', 'by'],
      segs: [['ok', '有效', rows.filter(x => x.st === 'ok').length], ['off', '已停用', rows.filter(x => x.st === 'off').length], ['expired', '已过期', rows.filter(x => x.st === 'expired').length]], segKey: 'st',
      cols: [
        { t: 'API Key', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('key') + '</span><div class="cname"><span class="nm">' + esc(x.name) + (x.fresh ? ' <span class="pill ok">刚创建</span>' : '') + '</span><span class="slug mono">sk_••••' + esc(x.tail) + '</span></div></div>' },
        { t: '创建人', w: '110px', hm: 1, f: x => '<span class="muted">' + esc(x.by) + '</span>' },
        { t: '可访问助手', w: '110px', hm: 1, f: x => '<span class="mono2">' + scopeTxt(x) + '</span>' },
        { t: '有效期', w: '130px', f: x => x.exp !== null && x.exp >= 0 && x.exp <= 7 && x.st === 'ok' ? '<span class="pill warn">' + expTxt(x) + '</span>' : '<span class="muted">' + expTxt(x) + '</span>' },
        { t: '最近使用', w: '150px', f: x => lastTxt(x) },
        { t: '状态', w: '90px', f: x => stt(AST[x.st][0], AST[x.st][1]) },
      ],
      onRow: 'drawer_akd', menu: x => [mi('eye', '查看详情', { act: 'drawer', a: 'akd|' + x.id }), mi('refresh', '轮换密钥', { act: 'akrot', a: x.name }), x.st === 'off' ? mi('play', '启用', { act: 'toast', a: 'ok|已启用' }) : mi('pause', '停用', { act: 'toast', a: 'ok|已停用，使用该 Key 的调用会立即失败' }), '-', mi('trash', '吊销', { bad: 1, act: 'confirm', a: revokeDlg(x) })],
      bulk: [{ i: 'play', t: '启用', act: 'akbenable' }, { i: 'pause', t: '停用' }, { i: 'clock', t: '延长有效期', act: 'akbext' }, { i: 'trash', t: '吊销', bad: 1 }],
      empty: { ic: 'key', t: '还没有 API Key', d: '创建一个 Key，让外部应用或技能调用你租户里的助手。', btns: btn('新建 API Key', 'drawer', 'aknew|', { k: 'btn-pri', i: 'plus' }) },
    }), 'list');
  },
});
function revokeDlg(x) {
  return CF({ tone: 'danger', ic: 'trash', title: '吊销「' + (x ? x.name : 'API Key') + '」？', desc: '吊销后<b>立即失效且无法恢复</b>：使用它的外部应用（近 7 天共 <b>' + (x ? fmt(x.calls) : 0) + '</b> 次调用）将收到 401。如只是暂时不用，请选择“停用”。', ok: '吊销', then: 'API Key 已吊销' });
}
const akSel = () => H.bsel('apikeys').map(id => akRows(false).find(r => r.id === id)).filter(Boolean);
const EXT = { '30 天': 30, '90 天': 90, '1 年': 365 };
function bulkExtHTML() {
  const sel = akSel(), p = S.ui.bext || '90 天', ok = sel.filter(x => x.st !== 'expired' && x.st !== 'revoked' && x.exp !== null), never = sel.filter(x => x.exp === null).length, exp = sel.filter(x => x.st === 'expired').length;
  const cards = Object.keys(EXT).map(k => '<button class="optcard' + (p === k ? ' on' : '') + '" data-act="bextsel" data-a="' + k + '"><span class="radio' + (p === k ? ' on' : '') + '"></span><span><b>延长 ' + k + '</b><span>从各自当前的到期日起算</span></span></button>').join('');
  return H.bdlg('批量延长有效期 · ' + sel.length + ' 个 Key', 'clock', '<div class="sp-lead">把所选 API Key 的到期日统一往后延：</div><div class="opts">' + cards + '</div>' + (never || exp ? banner('info', 'info', (never ? '<b>' + never + ' 个永不过期</b>的无需延长；' : '') + (exp ? '<b>' + exp + ' 个已过期</b>的不能延长，请新建或轮换。' : '') + '它们会被跳过，实际延长 ' + ok.length + ' 个。') : '') + '<div class="hint">延长有效期不会改变 Key，外部应用无需更新。长期不用的 Key 建议停用而不是延期。</div>', '<button class="btn btn-gh" data-act="dlg" data-a="cancel">取消</button><button class="btn btn-pri" data-act="bextgo">延长 ' + ok.length + ' 个 Key</button>');
}
ACT.akbext = () => { S.ui.bext = '90 天'; S.dialog = { html: bulkExtHTML(), side: true }; };
ACT.bextsel = a => { S.ui.bext = a; S.dialog = { html: bulkExtHTML(), side: true }; };
ACT.bextgo = () => { const sel = akSel(), n = sel.filter(x => x.st !== 'expired' && x.st !== 'revoked' && x.exp !== null).length; H.bdone('apikeys', n ? '已将 ' + n + ' 个 API Key 的有效期延长 ' + (S.ui.bext || '90 天') + (sel.length - n ? '；' + (sel.length - n) + ' 个永不过期或已过期，已跳过' : '') : '所选 Key 都无需延长（永不过期或已过期）', n ? 'ok' : 'info'); };
ACT.akbenable = () => { const sel = akSel(), off = sel.filter(x => x.st === 'off').length; H.bdone('apikeys', off ? '已启用 ' + off + ' 个 API Key' + (sel.length - off ? '；' + (sel.length - off) + ' 个本来就是有效状态或已过期，已跳过' : '') : '所选 Key 里没有已停用的', off ? 'ok' : 'info'); };
ACT.drawer_akd = a => openDrawer('akd', a);
ACT.akrot = a => { openDrawer('akdone', 'rot|' + a); };
ACT.aksave = () => {
  S.akNew.unshift({ id: 'akn' + (S.akNew.length + 1), name: 'CI 流水线', tail: (S.akNew.length + 2000).toString(16).slice(0, 4), by: '张伟', tenant: 'Acme 科技', as: 0, exp: 90, last: null, calls: 0, age: 1, st: 'ok', fresh: true });
  S.drawer = { kind: 'akdone', id: 'new|CI 流水线', tab: '' };
};

DRAWERS.aknew = () => ({
  title: '新建 API Key', sub: '创建后只显示一次完整的 Key', wide: true,
  body: () => '<div class="fgrid">' + field('名称', inp('CI 流水线'), { req: 1, full: 1, hint: '建议写成使用方，例如“飞书机器人”“Claude 技能 · 工程周报”' }) + field('用途说明（可选）', inp('用于 CI 里自动生成变更摘要'), { full: 1 }) + '</div>' +
    dgrp('可访问的助手', '<div class="opts"><button class="optcard on"><span class="radio on"></span><span><b>全部助手</b><span>包括之后新建的助手</span></span></button><button class="optcard"><span class="radio"></span><span><b>指定助手</b><span>只能调用选中的助手（推荐，最小授权）</span></span></button></div><div class="sp-chips" style="margin-top:8px">' + ASSISTANTS.map((a, i) => '<span class="sp-chip' + (i < 2 ? '' : '') + '">' + a + '</span>').join('') + '</div>') +
    '<div class="fgrid" style="margin-top:12px">' + field('有效期', slt(['30 天', '90 天', '1 年', '永不过期'], '90 天'), { hint: '到期自动失效；永不过期的 Key 建议定期轮换' }) + '</div>',
  foot: btn('创建', 'aksave', null, { k: 'btn-pri' }) + btn('取消', 'dclose'),
});
DRAWERS.akdone = id => {
  const [mode, name] = id.split('|'), rot = mode === 'rot';
  return {
    title: rot ? '密钥已轮换' : 'API Key 已创建', sub: name, wide: true,
    body: () => banner('warn', 'warn', '<b>请立即复制并妥善保存这个 API Key</b>。关闭后将无法再次查看（平台只保存哈希），丢失只能轮换。' + (rot ? '旧 Key 已立即失效，使用它的应用需要更新。' : '')) +
      '<div class="fgrid">' + field('API Key（SK，仅此一次）', '<div class="inwrap"><input class="inp mono" readonly value="sk_9d2c4e18a07b53f6c1e8a42d90b7f315"><button class="qbtn" data-act="toast" data-a="ok|已复制 API Key">' + ic('copy') + '</button></div>', { full: 1 }) + '</div>' +
      dgrp('怎么用', '<p class="hint" style="margin:0">在调用接口时以 Bearer 方式携带该 Key（具体请求格式以接口文档为准）。不要把 Key 写进代码仓库或聊天记录；怀疑泄露请立即轮换或吊销。</p>'),
    foot: btn('我已保存，关闭', 'dclose', null, { k: 'btn-pri' }),
  };
};
DRAWERS.akd = id => {
  const x = akRows(false).find(r => r.id === id) || akRows(false)[0], calls = ['产品文档助手', '运维助手', '合同审阅', '产品文档助手', '运维助手', '客服知识库'];
  return {
    title: esc(x.name), sub: 'sk_••••' + x.tail, wide: true, tabs: [['b', '基本信息'], ['c', '最近调用', calls.length]],
    body: t => t === 'c'
      ? calls.map((c, i) => '<div class="prow"><span style="flex:1"><span class="nm">' + c + '</span><span class="slug">POST /api/v1/invocations · ' + (i + 1) * 3 + ' 分钟前</span></span>' + stt(i === 3 ? '失败' : '成功', i === 3 ? 'bad' : 'ok') + '<span class="mono2 muted">' + (4 + i * 3) + ' s</span></div>').join('') + '<div class="hint">仅显示最近 6 次，完整记录请到「问答历史」按来源筛选。</div>'
      : (x.st === 'ok' && x.exp !== null && x.exp >= 0 && x.exp <= 7 ? banner('warn', 'clock', '<b>将在 ' + x.exp + ' 天后过期</b>，使用它的外部应用届时会调用失败。请提前轮换或更换新 Key。') : '') +
        kv([['状态', stt(AST[x.st][0], AST[x.st][1])], ['Key 标识', '<span class="mono">sk_••••' + esc(x.tail) + '</span>（只显示尾号）'], ['创建人', esc(x.by)], ['创建时间', ago(x.age)], ['有效期', expTxt(x)], ['可访问助手', scopeTxt(x)], ['最近使用', x.last === null ? '从未使用' : ago(x.last)], ['近 7 天调用', fmt(x.calls) + ' 次']]) +
        dgrp('可访问的助手', x.as === 0 ? '<span class="muted">全部助手（含之后新建的）</span>' : '<div class="sp-chips">' + ASSISTANTS.slice(0, x.as).map(a => '<span class="sp-chip">' + a + '</span>').join('') + '</div>'),
    foot: btn('轮换密钥', 'akrot', x.name) + btn(x.st === 'off' ? '启用' : '停用', 'toast', 'ok|' + (x.st === 'off' ? '已启用' : '已停用')) + '<span style="margin-left:auto"></span>' + btn('吊销', 'confirm', revokeDlg(x), { k: 'btn-dn' }),
  };
};

/* ═════ 平台：API Key 总览 ═════ */
page({
  id: 'p-apikeys', grp: '平台 · 租户管理', title: 'API Key 总览', layout: 'admin', grp2: '租户管理',
  scn: [['expiring', '即将过期 / 长期未使用'], ['revoke', '强制吊销确认']],
  notes: ['**为什么放在「租户管理」里**：API Key 一旦泄露，平台要能从全局直接搜到它属于哪个租户、谁建的（支持按 Key 尾号搜索），再停用或强制吊销。同理，「成员总览」提供全局的成员归属搜索。', '**跨租户总览**：平台管理员能看到所有租户的 API Key——哪个租户、谁建的、最近是否在用、近 7 天调用多少。用来发现僵尸 Key、异常调用和泄露风险。', '**只能管控，不能创建或查看 Key**：API Key 由各租户管理员自己创建；平台管理员只能“停用 / 吊销”（例如发现泄露或违规），也永远看不到 Key（只存哈希）。', '**强制操作要留痕**：停用 / 吊销记入审计并通知该租户管理员。', '**创建在租户侧**：创建 / 轮换 / 范围调整由各租户管理员在「租户管理 → API Key」完成。'],
  render() {
    const rows = akRows(true), sc = scn();
    if (sc === 'revoke' && !S.ui.auto) { S.ui.auto = 1; S.dialog = JSON.parse(forceDlg(rows[0])); }
    return phead('API Key 总览', '所有租户的 API Key（只读总览；可停用 / 吊销，不能创建或查看 Key）', '', S.scale === 'empty' ? null : rows.length) + H.dataNote('Key 列表、“最近使用”和“近 7 天调用”依赖<b>后端新增 AccessKey 与调用记录</b>（issue #38 尚未实现），按租户拆分还依赖多租户化；本页为设计稿示意。') + gate(() => (S.scale === 'empty' ? '' : hint(rows)) + listPage({
      id: 'p-apikeys', rows: S.scale === 'empty' ? [] : rows, bulk: [{ i: 'pause', t: '停用' }, { i: 'trash', t: '强制吊销', bad: 1 }], ph: '搜索名称 / 租户 / 创建人 / Key 尾号', searchKeys: ['name', 'tenant', 'by', 'tail'],
      segs: [['ok', '有效', rows.filter(x => x.st === 'ok').length], ['off', '已停用', rows.filter(x => x.st === 'off').length], ['expired', '已过期', rows.filter(x => x.st === 'expired').length]], segKey: 'st',
      filters: [{ k: 'tenant', label: '租户', opts: TENANTS.map(t => [t, t]) }],
      cols: [
        { t: 'API Key', w: 'minmax(0,2fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('key') + '</span><div class="cname"><span class="nm">' + esc(x.name) + '</span><span class="slug mono">sk_••••' + esc(x.tail) + '</span></div></div>' },
        { t: '租户', w: '120px', f: x => '<span class="muted">' + esc(x.tenant) + '</span>' },
        { t: '创建人', w: '100px', hm: 1, f: x => '<span class="muted">' + esc(x.by) + '</span>' },
        { t: '有效期', w: '120px', hm: 1, f: x => '<span class="muted">' + expTxt(x) + '</span>' },
        { t: '最近使用', w: '150px', f: x => lastTxt(x) },
        { t: '近 7 天调用', w: '100px', hm: 1, f: x => '<span class="mono2">' + fmt(x.calls) + '</span>', sk: 'calls' },
        { t: '状态', w: '90px', f: x => stt(AST[x.st][0], AST[x.st][1]) },
      ],
      onRow: 'drawer_akd', menu: x => [mi('eye', '查看详情', { act: 'drawer', a: 'akd|' + x.id }), mi('pause', '停用', { act: 'toast', a: 'ok|已停用，并已通知租户管理员（记入审计）' }), '-', mi('trash', '强制吊销', { bad: 1, act: 'confirm', a: forceDlg(x) })],
      empty: { ic: 'key', t: '还没有 API Key', d: '租户创建 API Key 后会出现在这里。' },
    }), 'list');
  },
});
function forceDlg(x) {
  return CF({ tone: 'danger', ic: 'shield', title: '强制吊销「' + (x ? x.name : 'API Key') + '」？', desc: '属于租户 <b>' + (x ? esc(x.tenant) : '') + '</b>。吊销后立即失效且无法恢复，使用它的应用将收到 401。<b>该操作会记入审计并通知该租户管理员</b>。', ok: '强制吊销', then: 'API Key 已吊销（已记入审计）' });
}
})();
