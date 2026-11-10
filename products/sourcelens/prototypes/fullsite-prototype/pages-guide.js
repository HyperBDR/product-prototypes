/* 配置向导（租户）：总体引导页，按真实系统的依赖关系排列。
   模型配置（必须）→ 知识库（必须；连接可选，节点由平台提供）→ 助手（必须；技能 / MCP / 环境变量 / 授权都在助手里配）→ 成员（可选）。
   所有配置都在本页右侧抽屉里完成，字段与步骤仿照真实表单（LLM 配置 / 知识库向导 3 步 / 助手向导 4 步）。 */
(function () {
'use strict';
const { ic, esc, page, scn, gate, stt, bar, banner, phead, field, toast } = H;
const go = (id, t, c) => '<button class="btn ' + (c || 'btn-ln') + ' sm" data-nav="' + id + '">' + t + '</button>';

/* id / 图标 / 名称 / 作用 / 必须? / 高级设置页 / 添加按钮 */
const STAGES = [
  ['model', 'key', '模型配置', '模型是助手的“大脑”。至少添加一个「对话补全」模型（填服务商、模型名、API Key，并测试连接）；创建助手时的 Agent 模型必须从这里选。向量嵌入、图像生成模型可按需另加', 1, 'llm-config', '添加模型'],
  ['ds', 'db', '知识库', '知识库是助手检索的资料来源（代码仓库、飞书文档、上传文件等），同步到平台提供的节点，无需你配置。「知识问答」和「代码分析」助手必须有知识库；只做「通用对话」可以跳过。私有仓库、飞书需要先建「连接」保存凭证，公开仓库不需要', 2, 'datasources', '添加知识库'],
  ['asst', 'bot', '助手', '助手是成员真正对话的对象。创建时先选类型（知识问答 / 代码分析 / 通用对话 / 智能协作），再按类型引导你完成需要的步骤；也可以“一键创建”，只填必要信息、其余用推荐默认值', 1, 'assistants', '创建助手'],
  ['user', 'users', '成员与分享', '邀请同事加入租户，并分配角色（普通用户只使用助手，租户管理员管理一切）和用户组。不邀请也能先自己试用；谁能用哪个助手，在助手的「可见性」里设置', 0, 'users', '邀请成员'],
];
const SI = id => STAGES.findIndex(s => s[0] === id);
const SSTAT = { skip: ['已跳过 · 仅通用对话', ''], done: ['已完成', 'ok'], warn: ['需要处理', 'warn'], empty: ['未开始', ''], todo: ['下一步', 'acc'] };
const PROVIDERS = ['Anthropic', 'OpenAI', 'Azure OpenAI', '通义千问', 'DeepSeek'];
const MTYPES = [['llm', '对话补全 (completion)'], ['embedding', '向量嵌入 (embedding)'], ['image', '图像生成 (image_generation)']];
const DSTYPES = [['GitHub', '同步 GitHub 仓库、组织或用户命名空间到节点工作区。', 1], ['GitLab', '同步 GitLab 仓库、Group 或项目命名空间到节点工作区。', 1], ['飞书', '同步飞书文档或 Drive 目录到节点工作区。', 2], ['手动上传', '把文件直接上传到平台提供的节点。', 0]];
const CONNECTORS = ['GitHub', 'GitLab', '飞书'];
const PLUG = {
  skill: ['Skills', 'spark', '给助手增加可执行的能力，例如检索代码、分析表格、归类日志。', [['代码检索', '官方', 'GITLAB_TOKEN'], ['表格分析', '官方', ''], ['日志归类', '官方', ''], ['内部流程', '我的', 'INTERNAL_API_KEY']], '通用对话类助手至少需要一个技能。'],
  mcp: ['MCP Servers', 'plug', '通过 MCP 协议接入外部系统的工具，例如查 Jira 工单、看 Grafana 面板。', [['Jira MCP', '官方 MCP', 'JIRA_BASE_URL、JIRA_API_TOKEN'], ['Grafana MCP', '官方 MCP', 'GRAFANA_URL、GRAFANA_TOKEN']], '需要连接外部系统工具时再添加。'],
  conn: ['内置插件工具', 'key', '绑定一个插件连接（如 GitHub）后，助手会自动获得该插件声明的全部只读能力。模型只会看到工具说明和参数，不会接触连接信息或密钥。', null, '不启用内置插件工具。'],
};
const SKILLS = PLUG.skill[3].concat(PLUG.mcp[3]);
const ENVSETS = ['gitlab-prod-token', 'jira-cloud', 'internal-api'];
const SHARED = ['shared-node-01', 'shared-node-02', 'shared-node-03'];
const CAPS = [['knowledge_qa', '知识问答', '基于知识库中的文档与资料回答，给出带引用的答案（需要知识库）'], ['code_analysis', '代码分析', '检索知识库中的代码，做跨文件的深度分析（需要知识库）'], ['general_chat', '通用对话', '不检索工作区目录，使用绑定的技能与内置工具运行；不需要知识库，至少需要一个技能']];
const NEEDS_DS = c => c === 'knowledge_qa' || c === 'code_analysis';
const SPS = () => (S.ui.sp = S.ui.sp || { added: {}, f: {}, fixed: {}, err: '', step: {}, back: null });
const nameOf = l => l.split(' · ')[0];

/* ═════ 数据 ═════ */
function data() {
  const sc = scn(), mode = ['fresh', 'partial', 'issue', 'complete'].indexOf(sc) >= 0 ? sc : S.scale === 'empty' ? 'fresh' : S.scale === 'few' ? 'partial' : 'complete', many = S.scale === 'many';
  const k = (n, m) => many ? m : n;
  const A = {
    full: {
      model: ['claude-sonnet-5-5 · Anthropic（默认）', 'claude-haiku-4-5 · Anthropic', 'text-embedding-3 · OpenAI（向量嵌入）'],
      node: ['acme-node-01 · 在线（私有）', 'shared-node-01 · 在线（共享）'],
      conn: ['gitlab-acme · 已校验', 'github-public · 已校验', 'feishu-app · 已校验'],
      ds: ['backend-api · 已同步', '产品手册 · 已同步', '研发 Wiki · 已同步', '工单库 · 已同步'],
      asst: [['客服助手', 3, 2, 'claude-sonnet-5-5', 'ok'], ['研发问答', 2, 3, 'claude-sonnet-5-5', 'ok'], ['销售支持', 1, 1, 'claude-haiku-4-5', 'ok'], ['运维值班', 2, 2, 'claude-haiku-4-5', 'ok']],
      user: [k(12, 340) + ' 位成员 · ' + k(3, 24) + ' 个用户组'],
    },
  };
  const F = A.full, M = {
    fresh: { model: [], node: [], conn: [], ds: [], asst: [], user: [] },
    partial: { model: F.model.slice(0, 2), node: F.node.slice(0, 1), conn: F.conn.slice(0, 1), ds: [], asst: [], user: [] },
    issue: Object.assign({}, F, { node: ['acme-node-01 · 在线（私有）', 'shared-node-02 · 离线（共享）'], conn: ['gitlab-acme · 已校验', 'github-public · 已校验', 'feishu-app · 凭证已过期'], ds: ['backend-api · 已同步', '产品手册 · 已同步', '研发 Wiki · 同步失败', '工单库 · 已同步'], asst: [['客服助手', 3, 2, 'claude-sonnet-5-5', 'ok'], ['研发问答', 2, 3, 'claude-sonnet-5-5', 'ok'], ['销售支持', 1, 1, 'claude-haiku-4-5', 'env'], ['运维值班', 2, 2, 'claude-haiku-4-5', 'ok']] }),
    complete: F,
  };
  const b = M[mode], P = SPS(), add = id => P.added[id] || [];
  const fx = P.fixed, out = { mode };
  out.model = b.model.concat(add('model'));
  out.node = b.node.concat(add('node')).map(t => fx.node ? t.replace('离线（共享）', '在线（共享）') : t);
  out.conn = b.conn.concat(add('conn')).map(t => fx.conn ? t.replace('凭证已过期', '已校验') : t);
  out.ds = b.ds.concat(add('ds')).map(t => fx.ds ? t.replace('同步失败', '已同步') : t);
  out.asstBase = b.asst.map(a => a[4] === 'env' && fx.asst ? a.slice(0, 4).concat('ok') : a);
  out.asstAdd = add('asst');
  out.user = b.user.concat(add('user'));
  out.newSet = {}; ['model', 'node', 'conn', 'ds', 'user'].forEach(id => add(id).forEach(l => { out.newSet[l] = 1; }));
  const dsBad = mode === 'issue' && !(fx.conn && fx.ds), asBad = out.asstBase.some(a => a[4] === 'env');
  const skip = !!P.skipDs && !out.ds.length;
  out.skip = skip;
  out.st = { model: out.model.length ? 'done' : 'empty', ds: out.ds.length ? (dsBad ? 'warn' : 'done') : skip ? 'skip' : 'empty', asst: out.asstBase.length + out.asstAdd.length ? (asBad ? 'warn' : 'done') : 'empty', user: out.user.length ? 'done' : 'empty' };
  out.msg = { ds: dsBad ? [!fx.conn ? '飞书连接凭证已过期，影响 2 个知识库' : '', !fx.ds ? '知识库「研发 Wiki」同步失败' : ''].filter(Boolean) : [], asst: asBad ? ['「销售支持」绑定的 Jira MCP 还没有环境变量集，运行时会失败'] : [] };
  return out;
}
const ASST_ST = { ok: ['可以使用', 'ok'], env: ['MCP 未绑定变量集', 'warn'] };

/* ═════ 页面 ═════ */
function chipsRow(title, items, d, addStage, optional) {
  return '<div class="sp-sub-row"><span class="sp-sub-t">' + title + (optional ? ' <span class="pill">可选</span>' : '') + '</span><div class="sp-chips">' + (items.length ? items.map(t => '<span class="sp-chip' + (/失败|离线|过期/.test(t) ? ' bad' : d.newSet[t] ? ' new' : '') + '">' + esc(t) + '</span>').join('') : '<span class="muted">暂无</span>') + '</div>' + '<button class="btn btn-gh sm" data-act="spopen" data-a="' + addStage + '">' + (addStage === 'conn' ? '添加连接' : '接入节点') + '</button></div>';
}
function stageRow(s, d, idx, nextId) {
  const id = s[0], st0 = d.st[id], st = st0 === 'empty' && id === nextId ? 'todo' : st0, label = SSTAT[st], msgs = d.msg[id] || [];
  const unmet = (id === 'asst' ? ['model', 'ds'] : []).filter(p => d.st[p] === 'empty' && !(p === 'ds' && d.skip));
  let body = '';
  if (id === 'model') body = d.model.length ? '<div class="sp-chips">' + d.model.map(t => '<span class="sp-chip' + (d.newSet[t] ? ' new' : '') + '">' + esc(t) + '</span>').join('') + '</div>' : '<div class="muted">还没有配置。</div>';
  if (id === 'ds') body = (d.ds.length ? '<div class="sp-chips">' + d.ds.map(t => '<span class="sp-chip' + (/失败/.test(t) ? ' bad' : d.newSet[t] ? ' new' : '') + '">' + esc(t) + '</span>').join('') + '</div>' : d.skip ? '<div class="muted">已跳过：只创建「通用对话」助手，不需要知识库。之后要做问答 / 代码分析助手，再回来添加。</div>' : '<div class="muted">还没有知识库。</div>') + '<div class="sp-subs">' + chipsRow('同步节点', d.node, d, 'node') + chipsRow('连接', d.conn, d, 'conn', 1) + '</div>';
  if (id === 'asst') {
    const rows = d.asstBase.map(a => [a[0], a[1], a[2], a[3], a[4]]).concat(d.asstAdd.map(a => [a.name, a.ds, a.sk, a.model, 'ok', 1]));
    body = rows.length ? '<div class="sp-alist">' + rows.slice(0, 5).map(a => '<div class="sp-arow"><span class="thumb">' + ic('bot') + '</span><span class="nm">' + esc(a[0]) + (a[5] ? ' <span class="pill ok">刚创建</span>' : '') + '</span><span class="sp-ch">' + a[1] + ' 个知识库</span><span class="sp-ch">' + a[2] + ' 个技能 / MCP</span><span class="sp-ch hm">' + esc(a[3]) + '</span>' + stt(ASST_ST[a[4]][0], ASST_ST[a[4]][1]) + '</div>').join('') + '</div>' : unmet.length ? '<div class="sp-lock">' + ic('lock') + '需要先完成：' + unmet.map(p => STAGES[SI(p)][2]).join('、') + '</div>' : '<div class="muted">还没有助手。</div>';
  }
  if (id === 'user') body = d.user.length ? '<div class="sp-chips">' + d.user.map(t => '<span class="sp-chip' + (d.newSet[t] ? ' new' : '') + '">' + esc(t) + '</span>').join('') + '</div>' : '<div class="muted">还没有邀请成员。成员加入后，在助手的「授权」里设置可用范围。</div>';
  const open = (t, c) => '<button class="btn ' + c + ' sm" data-act="spopen" data-a="' + id + '">' + t + '</button>';
  const skipBtn = id === 'ds' && st !== 'done' && st !== 'warn' ? '<button class="btn btn-gh sm" data-act="spskip">' + (d.skip ? '取消跳过' : '我只用通用对话，跳过') + '</button>' : '';
  const btns = skipBtn + (st === 'warn' ? open('去处理', 'btn-pri') : st === 'done' ? open(s[6], 'btn-ln') : open(s[6], st === 'todo' ? 'btn-pri' : 'btn-ln'));
  return '<li class="sp-row st-' + st + '"><div class="sp-rail"><span class="sp-dot">' + (st === 'done' ? ic('check') : st === 'warn' ? '!' : idx + 1) + '</span></div><div class="sp-body"><div class="sp-h"><span class="sp-ic">' + ic(s[1]) + '</span><b>' + s[2] + '</b>' + (s[4] === 1 ? '<span class="pill acc">必须</span>' : s[4] === 2 ? '<span class="pill acc">问答 / 代码分析必须</span>' : '<span class="pill">可选</span>') + stt(label[0], label[1]) + '<span style="flex:1"></span>' + btns + '<button class="btn btn-gh sm sp-adv" data-nav="' + s[5] + '" title="在完整的管理页里批量管理">高级设置</button></div>' +
    '<p class="sp-d">' + s[3] + '</p>' + msgs.map(m => '<div class="sp-msg">' + ic('warn') + esc(m) + '</div>').join('') + body + '</div></li>';
}
page({
  id: 'setup', grp: '管理 · 概览', title: '配置向导', layout: 'admin', grp2: '概览',
  scn: [['fresh', '全新租户 · 全部未开始'], ['partial', '配置了一半 · 模型已配'], ['issue', '有异常 · 需要处理'], ['complete', '全部完成'], ['save-fail', '保存失败 · 模型测试连接失败']],
  notes: ['**按真实依赖排列**：模型配置（必须）→ 知识库（知识问答 / 代码分析必须，仅通用对话可跳过）→ 助手（必须）→ 成员（可选）。连接是**可选**的，只在知识库需要认证时才用（GitHub / GitLab 公开仓库、手动上传都不需要）；节点由平台提供，租户不需要配置；Skills、MCP Servers、内置插件工具、环境变量、可见性都在创建助手时配置，不再单独成段。', '**所有配置在本页抽屉完成**：保存后页面立即更新，“保存并继续”直接进入下一段；原管理页只作为次要的“高级设置”入口。', '**抽屉仿照真实表单**：模型配置（类型 / 提供商 / 模型 / API Key / Base URL / 视觉能力 / 测试连接）；知识库 3 步（来源 → 连接与资源 → 同步与处理策略）；助手：先选类型（知识问答 / 代码分析 / 通用对话 / 智能协作），再按类型引导——问答与代码分析 4 步（基础与模型 → 知识库与工作区 → 插件 → 可见性），通用对话 3 步（基础与模型 → 插件 → 可见性），智能协作 3 步（基础与模型 → 协作成员 → 可见性）；每种类型也可“一键创建”。助手页的“新建助手”共用同一个抽屉。', '**与真实校验一致**：助手的 Agent 模型必填；“知识问答 / 代码分析”必须选知识库，“通用对话”不需要知识库但至少要一个技能；添加技能 / MCP 后，所声明的必填环境变量必须选配置集或新建；内置插件工具绑定一个插件连接，自动获得全部只读能力；公开助手可设“分享问答的可见范围”（公开可见 / 租户内可见）。每一步顶部有一句“这一步做什么”，每个字段带用途说明。', '**知识库按需**：助手有三种类型——知识问答、代码分析需要知识库，通用对话不需要；因此知识库标“问答 / 代码分析必须”，并提供“我只用通用对话，跳过”，跳过后不计入必须项。进度只算必须项，成员为可选。', '**边界**：全新 / 配置一半 / 有异常（节点离线、飞书凭证过期、同步失败、MCP 未绑定变量集，可在抽屉里逐项修复）/ 全部完成 / 模型测试连接失败（保留已填内容）；缺少前置（无模型、无知识库、无在线节点）时抽屉内提示并可切换去补。'],
  render() {
    const d = data(), ids = STAGES.map(s => s[0]), req = STAGES.filter(s => s[4] === 1 || (s[4] === 2 && !d.skip)).map(s => s[0]);
    const done = req.filter(i => d.st[i] === 'done').length, warn = ids.filter(i => d.st[i] === 'warn').length;
    const nextId = ids.find(i => d.st[i] === 'empty' && STAGES[SI(i)][4] && (i !== 'asst' || (d.st.model !== 'empty' && (d.st.ds !== 'empty' || d.skip)))), nx = nextId && STAGES[SI(nextId)];
    const first = ids.find(i => d.st[i] === 'warn');
    const head = '<section class="panel pad sp-sum"><div class="sp-sum-t"><div><h3>' + (done === req.length && !warn ? '必须的配置已完成，可以开始使用了' : warn ? '有 ' + warn + ' 项需要处理' : done === 0 ? '从这里开始，一步步把租户配置到可用' : '继续完成配置') + '</h3><p>必须项 ' + done + ' / ' + req.length + ' 已完成' + (warn ? ' · ' + warn + ' 项需处理' : '') + '</p></div>' + (done === req.length && !warn ? go('chat', '去对话试试', 'btn-pri') : warn ? '<button class="btn btn-pri sm" data-act="spopen" data-a="' + first + '">处理：' + STAGES[SI(first)][2] + '</button>' : nx ? '<button class="btn btn-pri sm" data-act="spopen" data-a="' + nextId + '">开始：' + nx[2] + '</button>' : '') + '</div>' + bar(Math.round(done / req.length * 100), '') + '</section>';
    const intro = '<div class="callout"><b>配置向导是什么？</b>把租户从零配到可用的路线，<b>所有配置都在这一页完成</b>：点每一段的按钮，在右侧抽屉里填写，保存后这里立即显示结果。最少只要<b>配一个模型、创建一个助手</b>；做「知识问答 / 代码分析」助手时还需要<b>接一个知识库</b>（只用「通用对话」可以跳过）。连接只在知识库需要认证时才用。创建助手时先选类型，再按类型引导（问答 / 代码分析：基础与模型 → 知识库与工作区 → 插件 → 可见性；通用对话：基础与模型 → 插件 → 可见性；智能协作：基础与模型 → 协作成员 → 可见性），也可一键创建。</div>';
    return phead('配置向导', '模型 → 知识库 → 助手，一页完成全部配置') + gate(() => head + intro + (d.mode === 'issue' && warn ? banner('warn', 'warn', '<b>有 ' + warn + ' 处异常</b>，会影响助手回答。点黄色段落的「去处理」直接修复。') : '') + '<ol class="sp-list">' + STAGES.map((s, i) => stageRow(s, d, i, nextId)).join('') + '</ol>', 'list');
  },
});

/* ═════ 抽屉 ═════ */
const opts = (key, list, cur) => '<div class="sp-opts">' + list.map(o => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<button class="sp-opt' + (cur === v ? ' on' : '') + '" data-act="spsel" data-a="' + key + '|' + esc(v) + '">' + esc(l) + '</button>'; }).join('') + '</div>';
const txt = (key, ph, o) => '<input class="inp' + (o && o.mono ? ' mono' : '') + '" data-k="sp-' + key + '" data-in="spf" data-a="' + key + '" value="' + esc(SPS().f[key] || '') + '" placeholder="' + esc(ph || '') + '"' + (o && o.pw ? ' type="password"' : '') + '>';
const checks = (key, list) => '<div class="vlist">' + list.map(l => { const on = (SPS().f[key] || {})[l[0]]; return '<button class="vrow' + (on ? ' on' : '') + '" data-act="spchk" data-a="' + key + '|' + esc(l[0]) + '"><span class="cbx' + (on ? ' on' : '') + '">' + (on ? ic('check') : '') + '</span><span class="vt"><b>' + esc(l[0]) + '</b>' + (l[1] ? '<small class="muted">' + esc(l[1]) + '</small>' : '') + '</span></button>'; }).join('') + '</div>';
const cards = (key, list, cur) => '<div class="opts">' + list.map(o => '<button class="optcard' + (cur === o[0] ? ' on' : '') + '" data-act="spsel" data-a="' + key + '|' + esc(o[0]) + '"><span class="radio' + (cur === o[0] ? ' on' : '') + '"></span><span><b>' + esc(o[1]) + '</b><span>' + esc(o[2]) + '</span></span></button>').join('') + '</div>';
const need = (stage, t, label) => banner('warn', 'lock', t, '<button class="btn btn-ln sm" data-act="spopen" data-a="' + stage + '" data-back="1">' + (label || '先去添加') + '</button>');
const picked = key => Object.keys(SPS().f[key] || {}).filter(k => SPS().f[key][k]);
const sstep = (id, steps) => Math.min(Math.max(SPS().step[id] || 1, 1), steps);
const stepsBar = (titles, st) => '<div class="steps" style="margin-bottom:16px">' + titles.map((n, i) => '<div class="step ' + (st === i + 1 ? 'on' : st > i + 1 ? 'done' : '') + '"><span class="sn">' + (st > i + 1 ? '✓' : i + 1) + '</span><span class="lb">' + n + '</span></div>' + (i < titles.length - 1 ? '<span class="step"><span class="ln"></span></span>' : '')).join('') + '</div>';

/* 模型配置：单页 */
function fModel() {
  const f = SPS().f, t = scn() === 'save-fail' || f.mtest;
  return lead('添加一个大模型', '填写服务商、模型名和 API Key，点“测试连接”确认能调通再保存。Key 加密保存在你的租户里，平台看不到。') + '<div class="fgrid">' + field('类型', opts('mt', MTYPES, f.mt || 'llm'), { full: 1 }) + field('提供商', opts('mp', PROVIDERS, f.mp || 'Anthropic'), { full: 1, req: 1 }) + field('模型', txt('mn', '如 claude-sonnet-5-5', { mono: 1 }), { req: 1, full: 1 }) + field('API Key', txt('mk', 'sk-…', { pw: 1, mono: 1 }), { req: 1, full: 1, hint: '加密保存在你的租户里，平台看不到；留空则保留原值' }) + field('API Base URL', txt('mb', 'https://…（选填）', { mono: 1 }), { full: 1, opt: 1 }) + '</div>' +
    '<div class="prow" style="margin-top:6px"><span style="flex:1"><b>确认支持视觉输入</b><br><small class="muted">仅当服务商确认接受图片内容时启用；助手的多模态模型会用到</small></span><button class="tgl' + (f.mv ? ' on' : '') + '" role="switch" data-act="spsel" data-a="mv|' + (f.mv ? '' : '1') + '"></button></div>' +
    '<div class="prow"><span style="flex:1"><b>设为默认模型</b><br><small class="muted">未单独指定模型时使用</small></span><button class="tgl' + (f.md !== '' ? ' on' : '') + '" role="switch" data-act="spsel" data-a="md|' + (f.md !== '' ? '' : '1') + '"></button></div>' +
    '<div style="margin-top:12px"><button class="btn btn-ln sm" data-act="spmtest">测试连接</button> ' + (f.mtest === 'ok' ? '<span class="stt ok">连接成功</span>' : f.mtest === 'bad' ? '<span class="stt bad">连接失败：401 invalid_api_key</span>' : '') + '</div>';
}
/* 连接（可选）：官方连接器 + 凭证 */
function fConn() {
  const f = SPS().f;
  return banner('info', 'info', '连接是<b>可选</b>的：只有需要认证的知识库（私有仓库、飞书等）才需要。连接器由平台官方提供，你只需填入自己的凭证，加密保存。') + '<div class="fgrid">' + field('连接器', opts('cc', CONNECTORS, f.cc || 'GitHub'), { full: 1 }) + field('连接名称', txt('cn', '如 gitlab-acme'), { req: 1, full: 1 }) + field('访问令牌 / 密钥', txt('ck', 'ghp_…', { pw: 1, mono: 1 }), { req: 1, full: 1, hint: '保存时会校验凭证' }) + '</div>';
}
/* 节点：私有 / 共享 */
function fNode() {
  const f = SPS().f, m = f.nm || '使用共享节点';
  return banner('info', 'info', '节点是知识库同步的目标，也是助手运行的地方。可以注册自己的私有节点，或使用平台对你开放的共享节点。') + '<div class="fgrid">' + field('接入方式', opts('nm', ['使用共享节点', '注册私有节点'], m), { full: 1 }) + '</div>' + (m === '注册私有节点' ? '<div class="fgrid">' + field('节点名称', txt('nn', '如 acme-node-02'), { req: 1, full: 1 }) + '</div><div class="callout" style="margin-top:12px">在你的服务器上运行下面的命令，节点会自动注册并上线（需要管理员审批）：<div class="code" style="margin-top:8px">docker run -d sourcelens/lensnode \\\n  --server https://acme.sourcelens.cn \\\n  --token ln_••••••••</div></div>' : '<p class="hint" style="margin:0 0 8px">平台已对你的租户开放这些共享节点（只显示已审批且在线的），勾选要使用的：</p>' + checks('sh', SHARED.map((n, i) => [n, i === 2 ? '负载较高 · 在线' : '在线'])));
}
/* 知识库：真实 3 步 */
function fDs(d) {
  const f = SPS().f, st = sstep('ds', 3), T = f.dt || 'GitHub', ty = DSTYPES.find(x => x[0] === T), conns = d.conn.map(nameOf), onNode = d.node.filter(t => /在线/.test(t)).map(nameOf);
  const head = stepsBar(['来源', '连接与资源', '同步与处理策略'], st) + lead(['第 1 步 · 选择来源', '第 2 步 · 连接与资源', '第 3 步 · 同步与处理策略'][st - 1], ['资料从哪里来？GitHub / GitLab / 飞书会按计划同步；手动上传不拉取外部内容。', '指定具体的仓库或文档目录。私有仓库和飞书需要连接（保存的访问凭证）；公开仓库可以直接访问。', '选一个在线节点存放这些资料（助手在该节点上检索），并设定多久同步一次。'][st - 1]);
  if (st === 1) return head + '<h4 class="sp-sub">选择知识库类型</h4>' + cards('dt', DSTYPES.map(x => [x[0], x[0], x[1]]), T);
  if (st === 2) {
    if (T === '手动上传') return head + '<div class="fgrid">' + field('名称', txt('dn', T === '手动上传' ? '如 合同模板' : ''), { req: 1, full: 1 }) + '</div>' + (T === '手动上传' ? '<div class="callout">创建后在知识库页上传文件（支持 PDF、Word、PPT、Excel、纯文本及图片），由节点处理。</div>' : '');
    const optional = ty[2] === 1;
    const connCards = '<div class="opts">' + (optional ? '<button class="optcard' + (!f.dc ? ' on' : '') + '" data-act="spsel" data-a="dc|"><span class="radio' + (!f.dc ? ' on' : '') + '"></span><span><b>公开访问（不使用连接）</b><span>适用于公开仓库，无需任何凭证</span></span></button>' : '') + conns.map(c => '<button class="optcard' + (f.dc === c ? ' on' : '') + '" data-act="spsel" data-a="dc|' + esc(c) + '"><span class="radio' + (f.dc === c ? ' on' : '') + '"></span><span><b>' + esc(c) + '</b><span>' + T + ' 连接</span></span></button>').join('') + '</div>';
    return head + '<div class="fgrid">' + field('名称', txt('dn', '如 backend-api'), { req: 1, full: 1 }) + field('连接', connCards + (!optional && !conns.length ? need('conn', '<b>' + T + ' 知识库必须使用连接</b>，当前还没有。', '新建连接') : '<p class="hint" style="margin:8px 0 0">没有合适的连接？<button class="btn btn-gh sm" data-act="spopen" data-a="conn" data-back="1">新建连接</button></p>'), { full: 1, req: !optional, opt: optional }) +
      field(T === '飞书' ? '飞书资源链接' : '仓库', txt('dr', T === '飞书' ? 'https://acme.feishu.cn/drive/folder/…' : 'owner/repo 或仓库地址', { mono: 1 }), { req: 1, full: 1, hint: T === '飞书' ? '保存前会验证目录是否可访问' : '可添加多个；点“检查仓库访问”确认可读' }) + '</div><button class="btn btn-ln sm" data-act="spchk2">检查仓库访问</button> ' + (f.dcheck ? '<span class="stt ok">仓库可访问 · 公开 · main</span>' : '');
  }
  const nodes = '<div class="opts">' + onNode.map(n => '<button class="optcard' + (f.dn2 === n ? ' on' : '') + '" data-act="spsel" data-a="dn2|' + esc(n) + '"><span class="radio' + (f.dn2 === n ? ' on' : '') + '"></span><span><b>' + esc(n) + '</b><span>在线 · 已审批</span></span></button>').join('') + '</div>';
  return head + '<div class="fgrid">' + field('同步位置', '<div class="sp-lead" style="margin:0">同步到平台提供的节点，无需选择；数据按租户隔离。</div>', { full: 1 }) + field('目标目录', txt('dp', '如 repos/backend-api', { mono: 1 }), { full: 1, opt: 1, hint: '工作区内的相对路径；留空则自动生成' }) +
    (T === '手动上传' ? '' : field('同步策略', opts('dsp', ['固定间隔', 'Crontab', '仅手动'], f.dsp || '固定间隔'), { full: 1 }) + ((f.dsp || '固定间隔') === '固定间隔' ? field('同步间隔', opts('dsi', ['每小时', '每 6 小时', '每天'], f.dsi || '每 6 小时'), { full: 1, hint: '可在知识库详情里再调整' }) : (f.dsp === 'Crontab' ? field('Cron 表达式', txt('dcr', '0 2 * * *', { mono: 1 }), { full: 1 }) : ''))) + '</div><div class="callout" style="margin-top:12px"><b>内容处理（可选）</b>：按需开启文档、图片转换和检索增强。默认关闭，可稍后在知识库页调整。</div>';
}
/* 助手：先选类型，再按类型给出不同的引导步骤（对应真实的 助手表单 / 类型 + 助手模式） */
const lead = (t, x) => '<div class="sp-lead"><b>' + t + '</b><span>' + x + '</span></div>';
const ATYPES = [
  ['knowledge_qa', '知识问答', 'db', '基于知识库里的文档与资料回答问题，答案带引用。', '需要：至少 1 个知识库', '基础与模型 → 知识库与工作区 → 插件 → 可见性'],
  ['code_analysis', '代码分析', 'cpu', '检索知识库里的代码，做跨文件的深度分析，可启用代码图。', '需要：至少 1 个知识库', '基础与模型 → 知识库与工作区 → 插件 → 可见性'],
  ['general_chat', '通用对话', 'msg', '不检索工作区目录，用绑定的技能和内置工具完成任务。', '需要：至少 1 个技能；不需要知识库', '基础与模型 → 插件 → 可见性'],
  ['smart', '智能协作', 'users', '由多个已配置的“直接助手”协作完成复杂任务，自己不直接绑资源。', '需要：至少 1 个已启用的直接助手', '基础与模型 → 协作成员 → 可见性'],
];
const ASEQ = { knowledge_qa: ['base', 'data', 'plug', 'auth'], code_analysis: ['base', 'data', 'plug', 'auth'], general_chat: ['base', 'plug', 'auth'], smart: ['base', 'members', 'auth'] };
const ASTIT = { base: '基础与模型', data: '知识库与工作区', plug: '插件', auth: '可见性', members: '协作成员' };
const asteps = () => { const c = SPS().f.cap; return c && !SPS().f.aq ? ASEQ[c] : null; };
const nOf = stage => stage === 'asst' ? (asteps() ? asteps().length : 0) : STEPN[stage] || 0;
const tname = c => (ATYPES.find(t => t[0] === c) || [])[1];
const ASSISTANTS = ['客服助手', '研发问答', '销售支持', '运维值班'];
function typePicker() {
  return lead('先选择要创建的助手类型', '不同类型需要的配置不一样，选好类型后，只会引导你完成这个类型用得到的步骤。想快一点，可以直接“一键创建”：只填必要信息，其余用推荐默认值。') + '<div class="sp-types">' + ATYPES.map(t => '<div class="sp-type"><div class="sp-type-h"><span class="sp-ic">' + ic(t[2]) + '</span><b>' + t[1] + '</b></div><p>' + t[3] + '</p><small class="muted">' + t[4] + '</small><small class="muted">步骤：' + t[5] + '</small><div class="sp-type-b"><button class="btn btn-pri sm" data-act="sptype" data-a="' + t[0] + '|0">逐步配置</button><button class="btn btn-ln sm" data-act="sptype" data-a="' + t[0] + '|1">一键创建</button></div></div>').join('') + '</div>';
}
function typeBar(cap) { return '<div class="sp-cur">当前类型：<b>' + tname(cap) + '</b><button class="btn btn-gh sm" data-act="sptype" data-a="|0">更换类型</button></div>'; }
function plugCard(k, n, f, d) {
  const sk = SKILLS.find(x => x[0] === n), vars = k === 'conn' ? '' : (sk && sk[2]) || '', ev = (f.ev || {})[n], isNew = ev === '__new';
  const meta = k === 'conn' ? '插件连接 · 助手自动获得该插件声明的全部只读能力' : sk[1] + (vars ? ' · 需要 <span class="mono">' + vars + '</span>' : ' · 无需配置');
  let cfg = '';
  if (k === 'conn') cfg = '<span class="muted">该连接允许访问的仓库</span><div class="sp-chips"><span class="sp-chip">acme/backend-api</span><span class="sp-chip">acme/docs</span></div><span class="hint">已启用该插件的全部只读能力。模型只会看到工具说明和参数，不会接触连接信息或密钥。</span>';
  else if (vars) cfg = '<span class="muted">环境变量集（必填）· 仅对当前' + (/MCP/.test(sk[1]) ? ' MCP Server ' : ' Skill ') + '生效，值由你的租户保管、加密、运行时才注入</span>' + opts('ev:' + n, ENVSETS.concat(['__new']).map(e => [e, e === '__new' ? '＋ 新建配置集' : e]), ev) + (ev && !isNew ? '<span class="stt ok">已保存</span>' : '') + (!ev ? '<span class="hint">请选择已有配置集或新建配置集后继续。变量值必须保存在配置集中。</span>' : '') + (isNew ? '<div class="fgrid">' + vars.split('、').map(v => field(v, txt('evv-' + n + '-' + v, '值', { pw: 1, mono: 1 }), { req: 1 })).join('') + field('配置集名称', txt('evn-' + n, '如 Jira - Production'), { opt: 1, hint: '留空时将自动使用助手名称与当前资源名称生成，之后可在「环境变量」页复用' }) + '</div>' : '');
  return '<div class="wzsk"><div class="wzsk-h"><span class="thumb">' + ic(PLUG[k][1]) + '</span><div class="sl" style="flex:1"><b>' + esc(n) + '</b><small>' + meta + '</small></div><button class="btn btn-gh sm" data-act="sprm" data-a="' + k + '|' + esc(n) + '">移除</button></div>' + (cfg ? '<div class="wzsk-b" style="flex-direction:column;align-items:stretch;gap:8px">' + cfg + '</div>' : '') + '</div>';
}
function plugSec(k, f, d) {
  const P0 = PLUG[k], items = (f.pl || {})[k] || [], open = f.padd === k, cat = k === 'conn' ? d.conn.map(nameOf).map(n => [n, '插件连接', '']) : P0[3], avail = cat.filter(c => items.indexOf(c[0]) < 0);
  const picker = open ? '<div class="sp-pick">' + (avail.length ? '<div class="vlist">' + avail.map(c => '<button class="vrow" data-act="spadd" data-a="' + k + '|' + esc(c[0]) + '"><span class="vt"><b>' + esc(c[0]) + '</b><small class="muted">' + esc(c[1]) + (k === 'conn' ? '' : c[2] ? ' · 需要 ' + esc(c[2]) : ' · 无需配置') + '</small></span><span class="pill acc">添加</span></button>').join('') + '</div>' : '<div class="muted">' + (k === 'conn' ? '可选。请先在连接管理中创建并验证插件连接。' : k === 'mcp' ? '暂无可用 MCP Server，请先在 MCP Server 资源库中创建。' : '没有更多可添加的了。') + '</div>') + (k === 'conn' ? '<div style="margin-top:8px"><button class="btn btn-gh sm" data-act="spopen" data-a="conn" data-back="1">＋ 新建连接</button></div>' : '') + '</div>' : '';
  return '<section class="sp-plug"><div class="sp-plh"><span class="thumb">' + ic(P0[1]) + '</span><div style="flex:1"><b>' + P0[0] + '</b> <span class="pill">可选</span> <span class="pill">' + items.length + ' 个</span><br><small class="muted">' + P0[2] + '</small></div><button class="btn btn-ln sm" data-act="sppick" data-a="' + k + '">' + (open ? '收起' : '＋ 添加') + '</button></div>' + picker +
    (items.length ? items.map(n => plugCard(k, n, f, d)).join('') : '<div class="muted sp-none">还没有添加。' + P0[4] + '</div>') + '</section>';
}
const AV_WARN = { open: '<b>公开可见意味着任何人都能提问</b>，会消耗你租户的模型额度与节点资源，也可能暴露知识库里的内容。请确认知识库可以对外，并关注使用量。' };
function fAsst(d) {
  const f = SPS().f, cap = f.cap, models = d.model.filter(t => !/向量嵌入/.test(t)).map(nameOf), smart = cap === 'smart';
  if (!cap) return typePicker();
  if (f.aq) return quickForm(d, models);
  const seq = ASEQ[cap], st = sstep('asst', seq.length), key = seq[st - 1], head = stepsBar(seq.map(k => ASTIT[k]), st) + typeBar(cap), ds = d.ds.map(nameOf);
  if (key === 'base') return head + lead('第 ' + st + ' 步 · 基础与模型', '给助手起名，选它使用的模型，并设定基本运行参数。') + (!models.length ? need('model', '<b>还没有对话模型</b>，Agent 模型为必填，没有它助手无法运行。', '先去添加模型') : '') + '<div class="fgrid">' + field('名称', txt('an', '如 研发问答'), { req: 1, full: 1, hint: '成员在对话入口看到的名字' }) + field('描述', txt('ad', '说明该助手可以帮助用户完成什么'), { full: 1, opt: 1, hint: '建议用一句话说明助手用途，尽量控制在 80 字以内。' }) + field('Slug', txt('as', 'rd-qa', { mono: 1 }), { full: 1, opt: 1, hint: '仅允许字母、数字、连字符和下划线，最长 180 个字符；留空自动生成' }) +
    field(smart ? '协调器模型' : 'Agent 模型', opts('am', models.length ? models : ['（暂无）'], f.am || models[0]), { req: 1, full: 1, hint: smart ? '必填 — 智能协作协调器使用该模型进行任务分派与汇总。' : '必填 — LensNode 使用该模型运行深度分析 Agent。' }) +
    (smart ? '' : field('多模态模型', opts('amm', ['默认'], f.amm || '默认'), { full: 1, opt: 1, hint: '可选 — 用于视觉或图像相关任务。当前没有配置支持图片输入的模型；需要时在模型配置里开启“确认支持视觉输入”。' })) +
    field('决策模型', opts('adm', ['不配置（沿用原有链路）'], f.adm || '不配置（沿用原有链路）'), { full: 1, opt: 1, hint: '可选。配置后使用独立模型执行证据校验和候选排序；不配置时沿用原有处理链路。' }) + '</div><h4 class="sp-sub" style="margin-top:14px">运行预算</h4><div class="fgrid">' + field('单次运行 Token 预算', txt('atk', '0', { mono: 1 }), { opt: 1, hint: '0 表示不设置上限。' }) + field('单次运行模型轮次预算', txt('atn', '0', { mono: 1 }), { opt: 1, hint: 'Token 用量在模型调用之间检查，不等同于费用金额上限。' }) + '</div>';
  if (key === 'data') {
    const cn = cap === 'knowledge_qa' ? '知识问答' : '代码分析';
    return head + lead('第 ' + st + ' 步 · 知识库与工作区', cn + '助手只能在你选的知识库里检索。选好知识库，设定检索范围，再写一份工作区指引。') +
      field('知识库（至少选 1 个）', ds.length ? checks('ad2', d.ds.map(t => [nameOf(t), /失败|离线/.test(t) ? '同步异常，可能影响检索' : '已同步，可检索'])) : need('ds', '<b>还没有知识库</b>，' + cn + '助手需要至少一个。', '先去添加知识库'), { full: 1, req: 1, hint: '知识库同步到哪个节点，助手就在该节点上执行。' }) +
      '<h4 class="sp-sub" style="margin-top:14px">检索策略</h4><div class="fgrid">' + field('排除扩展名', txt('aex', '如 .lock,.pyc,.sqlite3', { mono: 1 }), { full: 1, opt: 1, hint: '这些类型的文件不参与检索，减少噪音。' }) + field('排除目录', txt('aed', '如 .git,node_modules,dist', { mono: 1 }), { full: 1, opt: 1, hint: '这些目录整体跳过。' }) + '</div>' +
      (cap === 'code_analysis' ? '<div class="prow"><span style="flex:1"><b>启用代码图</b><br><small class="muted">构建并检索代码图，辅助代码分析；首次建图会增加同步耗时</small></span><button class="tgl' + (f.acg ? ' on' : '') + '" role="switch" data-act="spsel" data-a="acg|' + (f.acg ? '' : '1') + '"></button></div>' : '') +
      '<div class="prow"><span style="flex:1"><b>显示引用内容</b><br><small class="muted">在回答中展示所查阅的来源文件，并提供可点击打开证据快照的链接</small></span><button class="tgl' + (f.acq !== '' ? ' on' : '') + '" role="switch" data-act="spsel" data-a="acq|' + (f.acq !== '' ? '' : '1') + '"></button></div>' +
      '<h4 class="sp-sub" style="margin-top:14px">工作区指引</h4><div class="fgrid">' + field('工作区指引（可选）', '<textarea class="txa mono" style="font-family:var(--m);font-size:12px" rows="6" data-k="sp-aw" data-in="spf" data-a="aw" placeholder="# 模型不读代码就不知道的信息，写在这里能让它更快、更准。\n\n## 项目说明\n# backend/ 是 Django REST API 主服务；frontend/ 是 Vue 3 管理台…">' + esc(f.aw || '') + '</textarea>', { full: 1, hint: '告诉助手工作区目录结构、业务背景、团队约定、检索优先级和需要避开的目录。保存后会作为该助手的专属上下文注入。' }) + '</div>';
  }
  if (key === 'plug') return head + lead('第 ' + st + ' 步 · 插件', '给助手“加装备”。分三类：Skills、MCP Servers、内置插件工具，都是<b>可选</b>的。点每类右侧的“＋ 添加”选用，再逐个配置。') + (cap === 'general_chat' ? banner('info', 'info', '通用对话使用绑定的 Skill、内置插件工具、包内脚本和包内二进制运行，不启用工作区目录检索。<b>至少需要一个已启用的 Skill</b>。') : '') + plugSec('skill', f, d) + plugSec('mcp', f, d) + plugSec('conn', f, d);
  if (key === 'members') {
    const names = ASSISTANTS.concat((d.asstAdd || []).map(a => a.name));
    return head + lead('第 ' + st + ' 步 · 协作成员', '选择这个智能助手可以协作的直接助手。新的会话会复用这组成员。') + banner('info', 'info', '智能助手使用所选成员：Skill、MCP、节点和执行工作区由成员助手管理，这里不需要再配。') + field('协作成员（至少选 1 个）', names.length ? checks('am2', names.map(n => [n, '已启用 · 直接助手'])) : banner('warn', 'lock', '请先创建一个启用的直接助手。'), { full: 1, req: 1, hint: '只列出处于启用状态的直接助手。' }) + '<div class="fgrid" style="margin-top:12px">' + field('智能协作指引（可选）', '<textarea class="txa" rows="4" data-k="sp-aw" data-in="spf" data-a="aw" placeholder="补充项目背景、分工原则和检索优先级…">' + esc(f.aw || '') + '</textarea>', { full: 1, hint: '用于补充智能协作的项目背景、分工原则和检索优先级。' }) + '</div>';
  }
  const av = f.av || 'tenant', asg = av === 'assigned', sh = asg ? '租户内可见' : (f.aps || '租户内可见');
  return head + lead('第 ' + st + ' 步 · 可见性', '这里有两件不同的事：<b>助手可见性</b>决定谁能直接使用这个助手；<b>分享可见性</b>决定成员把问答分享成链接后，谁能打开那条链接。管理员始终可访问全部助手；创建后随时可以修改。') +
    '<h4 class="sp-sub">① 助手可见性 <small class="muted">谁能直接使用这个助手</small></h4><div class="fgrid">' + field('助手可见性', cards('av', [['open', '公开可见', '任何人免登录就能直接使用这个助手的能力；适合对外的客服、文档问答'], ['tenant', '租户内可见（默认）', '本租户内所有已登录成员都能使用，无需逐个授权；未登录不能使用'], ['assigned', '指定成员或组可见', '只有被授权的用户组 / 用户能使用；适合内部或敏感资料']], av) + (AV_WARN[av] ? banner('warn', 'warn', AV_WARN[av]) : ''), { full: 1, req: 1 }) +
    (av === 'assigned' ? field('可访问的用户组', checks('ag', [['研发组', ''], ['客服组', ''], ['销售组', ''], ['全员', '']]), { full: 1, opt: 1, hint: '组内所有成员都能使用；不选且不加用户，则只有管理员能使用。' }) + field('可访问的用户', txt('au', '搜索并添加用户…'), { full: 1, opt: 1, hint: '额外授权某几位成员，不受用户组限制。' }) : '') + '</div>' +
    '<h4 class="sp-sub" style="margin-top:18px">② 分享可见性 <small class="muted">成员分享的问答链接，谁能打开</small></h4><div class="fgrid">' + field('分享问答的可见范围', '<div class="opts">' + (asg ? '<div class="optcard" style="opacity:.55;cursor:not-allowed"><span class="radio"></span><span><b>公开可见</b><span>不可选：该助手只给指定成员 / 组使用，分享不能放宽到所有人</span></span></div><div class="optcard on" style="cursor:default"><span class="radio on"></span><span><b>租户内可见（跟随助手权限）</b><span>只有被授权使用这个助手的成员 / 组能打开分享链接</span></span></div>' : ['公开可见|拿到链接的人免登录就能看；适合对外分享', '租户内可见（跟随助手权限）|登录后、能使用该助手的本租户成员才能看；助手对谁可见，分享就对谁可见'].map(x => { const [t, d] = x.split('|'), v = t.slice(0, 5) === '租户内可见' ? '租户内可见' : t; return '<button class="optcard' + (sh === v ? ' on' : '') + '" data-act="spsel" data-a="aps|' + v + '"><span class="radio' + (sh === v ? ' on' : '') + '"></span><span><b>' + t + '</b><span>' + d + '</span></span></button>'; }).join('')) + '</div>', { full: 1, hint: asg ? '想让分享对更多人可见，请先放宽助手可见性。' : '租户内可见 = 跟随助手的租户权限，不会比助手本身的可见范围更大。默认租户内可见，也可以在全局设置里统一调整。' }) + '</div>';
}
/* 一键创建：只填必要信息，其余走推荐默认值 */
function quickForm(d, models) {
  const f = SPS().f, cap = f.cap, ds = d.ds.map(nameOf), noEnv = SKILLS.filter(k => !k[2] && k[1] !== '官方 MCP');
  let must = '';
  if (NEEDS_DS(cap)) must = field('知识库（至少选 1 个）', ds.length ? checks('ad2', d.ds.map(t => [nameOf(t), '已同步，可检索'])) : need('ds', '<b>还没有知识库</b>，' + tname(cap) + '助手需要至少一个。', '先去添加知识库'), { full: 1, req: 1 });
  else if (cap === 'general_chat') must = field('技能（至少选 1 个）', checks('qsk', noEnv.map(k => [k[0], k[1] + ' · 无需配置'])), { full: 1, req: 1, hint: '一键创建只列无需凭证的技能；需要环境变量的技能请用“逐步配置”。' });
  else must = field('协作成员（至少选 1 个）', checks('am2', ASSISTANTS.map(n => [n, '已启用 · 直接助手'])), { full: 1, req: 1 });
  return typeBar(cap) + lead('一键创建 · ' + tname(cap), '只需填写下面的必要信息，其余全部使用推荐默认值，创建后随时可以在助手详情里修改。') + (!models.length ? need('model', '<b>还没有对话模型</b>，Agent 模型为必填。', '先去添加模型') : '') + '<div class="fgrid">' + field('名称', txt('an', '如 研发问答'), { req: 1, full: 1 }) + '</div>' + must +
    '<div class="callout" style="margin-top:12px"><b>将使用的默认值</b>：' + (smart => smart ? '协调器模型 ' : 'Agent 模型 ')(cap === 'smart') + '<b>' + esc(models[0] || '（请先添加模型）') + '</b>' + (NEEDS_DS(cap) ? '；检索不排除任何目录；显示引用内容' : '') + '；运行预算不限制；助手 <b>租户内可见</b>，分享也是租户内可见（创建后可再调整）；不绑定 MCP / 内置插件工具。</div>';
}
function fUser() {
  const f = SPS().f;
  return lead('邀请一位成员', '被邀请人会收到邮件并设置密码。角色决定能做什么，用户组决定默认能用哪些助手。') + '<div class="fgrid">' + field('邮箱', txt('ue', 'name@acme.com'), { req: 1, full: 1, hint: '用于登录和接收邀请邮件' }) + field('角色', opts('ur', ['普通用户', '租户管理员'], f.ur || '普通用户'), { full: 1, hint: '普通用户只使用助手；租户管理员管理租户内一切' }) + field('加入用户组', opts('ug', ['研发组', '客服组', '销售组'], f.ug), { full: 1, opt: 1, hint: '助手按用户组授权，加入后自动获得该组可用的助手' }) + '</div>';
}
/* 修复（有异常时） */
function fixSec(stage, d) {
  const m = d.msg[stage]; if (!m || !m.length) return '';
  const P = SPS();
  const btn = (key, t) => !P.fixed[key] && '<button class="btn btn-pri sm" data-act="spfix" data-a="' + key + '">' + t + '</button>';
  const parts = stage === 'ds' ? [!P.fixed.conn && ['飞书连接凭证已过期', btn('conn', '更新凭证并校验')], !P.fixed.ds && ['知识库「研发 Wiki」同步失败', btn('ds', '重试同步')]].filter(Boolean) : [['「销售支持」绑定的 Jira MCP 没有环境变量集', opts('fv', ENVSETS, P.f.fv || 'jira-cloud') + btn('asst', '绑定配置集')]];
  return '<div class="sp-fix">' + parts.map(p => '<div class="sp-fix-r"><div class="sp-msg">' + ic('warn') + esc(p[0]) + '</div><div>' + p[1] + '</div></div>').join('') + '</div>';
}
const TITLES = { model: '添加模型', ds: '添加知识库', asst: '创建助手', user: '邀请成员', conn: '添加连接', node: '接入节点' };
const STEPN = { ds: 3, asst: 4 };
DRAWERS.spf = stage => {
  const d = data(), P = SPS(), idx = SI(stage), s = STAGES[idx] || null, warn = d.st[stage] === 'warn' && (d.msg[stage] || []).length, n = nOf(stage), st = n ? sstep(stage, n) : 1;
  const body = { model: fModel, conn: fConn, node: fNode, ds: () => fDs(d), asst: () => fAsst(d), user: fUser }[stage]();
  const nx = !P.origin && s && STAGES[idx + 1], last = !n || st === n, quick = stage === 'asst' && P.f.aq, pick = stage === 'asst' && !P.f.cap;
  const mk = (t, nm) => '<button class="btn btn-ln" data-act="spsave" data-a="' + stage + '|0">' + t + '</button>' + (nm ? '<button class="btn btn-pri" data-act="spsave" data-a="' + stage + '|1">' + t + '并继续：' + nm + '</button>' : '');
  let foot = '<button class="btn btn-ln" data-act="dclose">取消</button><span style="margin-left:auto"></span>';
  if (pick) foot += '<span class="muted" style="font-size:12px">选择类型后开始配置</span>';
  else if (quick) foot += '<button class="btn btn-gh" data-act="sptype" data-a="' + P.f.cap + '|0">改为逐步配置</button>' + (nx ? '<button class="btn btn-ln" data-act="spsave" data-a="asst|0">创建</button><button class="btn btn-pri" data-act="spsave" data-a="asst|1">创建并继续：' + nx[2] + '</button>' : '<button class="btn btn-pri" data-act="spsave" data-a="asst|0">创建</button>');
  else {
    foot += (n && st > 1 ? '<button class="btn btn-ln" data-act="spprev" data-a="' + stage + '">上一步</button>' : '');
    if (n && !last) foot += '<button class="btn btn-pri" data-act="spnext" data-a="' + stage + '">下一步</button>';
    else if (s) foot += nx ? mk(n ? '创建' : '保存', nx[2]).replace('并继续：', '并继续：') : '<button class="btn btn-pri" data-act="spsave" data-a="' + stage + '|0">' + (n ? '创建' : '保存') + (P.origin ? '' : '并完成') + '</button>';
    else foot += '<button class="btn btn-pri" data-act="spsave" data-a="' + stage + '|0">保存并返回</button>';
  }
  const sub = stage === 'asst' ? (pick ? '第一步：选择类型' : tname(P.f.cap) + (quick ? ' · 一键创建' : ' · 第 ' + st + ' / ' + n + ' 步') + (s && !P.origin ? ' · 必须 · 第 ' + (idx + 1) + ' / ' + STAGES.length + ' 段' : '')) : (s ? s[2] + (s[4] ? ' · 必须' : ' · 可选') + ' · 第 ' + (idx + 1) + ' / ' + STAGES.length + ' 段' : (stage === 'conn' ? '连接 · 可选' : '节点') + (P.back ? ' · 保存后返回上一个表单' : ''));
  return { title: warn ? '处理：' + (s ? s[2] : '') : TITLES[stage], sub, wide: true,
    body: () => (P.err ? banner('bad', 'warn', P.err) : '') + fixSec(stage, d) + (warn && d.msg[stage].length ? '<h4 class="sp-sub">或继续添加</h4>' : '') + body, foot };
};
INP.spf = (v, el) => { SPS().f[el.dataset.a] = v; SPS().err = ''; return false; };
ACT.spopen = (a, el) => { const P = SPS(); P.err = ''; if (!(el && el.dataset && el.dataset.back)) P.origin = null; P.back = el && el.dataset && el.dataset.back && S.drawer ? { kind: S.drawer.id } : null; S.drawer = { kind: 'spf', id: a, tab: '' }; S.menu = null; };
ACT.spsel = a => { const i = a.indexOf('|'), k = a.slice(0, i), v = a.slice(i + 1), f = SPS().f; if (k.startsWith('ev:')) { f.ev = f.ev || {}; f.ev[k.slice(3)] = v; } else if (k.startsWith('cs:')) { f.cs = f.cs || {}; f.cs[k.slice(3)] = v; } else f[k] = v === '' && (k === 'mv' || k === 'acg') ? '' : v; if (k === 'md') f.md = v; SPS().err = ''; };
ACT.spchk = a => { const i = a.indexOf('|'), k = a.slice(0, i), v = a.slice(i + 1), f = SPS().f; f[k] = f[k] || {}; f[k][v] = !f[k][v]; };
ACT.sppick = a => { const f = SPS().f; f.padd = f.padd === a ? '' : a; };
ACT.spadd = a => { const i = a.indexOf('|'), k = a.slice(0, i), v = a.slice(i + 1), f = SPS().f; f.pl = f.pl || {}; f.pl[k] = (f.pl[k] || []).concat(v); SPS().err = ''; };
ACT.sprm = a => { const i = a.indexOf('|'), k = a.slice(0, i), v = a.slice(i + 1), f = SPS().f; f.pl[k] = (f.pl[k] || []).filter(x => x !== v); if (f.ev) delete f.ev[v]; };
ACT.spskip = () => { const P = SPS(); P.skipDs = !P.skipDs; };
ACT.spchk2 = () => { SPS().f.dcheck = 1; };
ACT.spmtest = () => { const f = SPS().f; f.mtest = scn() === 'save-fail' || !f.mk ? 'bad' : 'ok'; };
ACT.spfix = a => { SPS().fixed[a] = true; if (a === 'asst') S.drawer = null; toast('ok', { node: '节点已重新上线', conn: '凭证已更新并通过校验', ds: '已重试，同步完成', asst: '已绑定环境变量集' }[a]); const d = data(); if (a !== 'asst' && !(d.msg.ds || []).length) S.drawer = null; };
ACT.spprev = a => { const P = SPS(); P.err = ''; P.step[a] = Math.max(1, sstep(a, nOf(a)) - 1); };
const askErr = (f, d, key, P) => {
  const cap = f.cap, models = d.model.filter(t => !/向量嵌入/.test(t)), pick = k => Object.keys(f[k] || {}).filter(x => f[k][x]);
  if (key === 'base' || key === 'quick') { if (!f.an || !String(f.an).trim()) return '请填写助手名称'; if (!models.length) return (cap === 'smart' ? '协调器' : 'Agent') + ' 模型必填：请先添加一个对话模型'; }
  if ((key === 'data' || key === 'quick') && NEEDS_DS(cap) && !pick('ad2').length) return tname(cap) + '助手请至少选择一个知识库';
  if (key === 'members' || (key === 'quick' && cap === 'smart')) { if (!pick('am2').length) return '请至少选择一个协作成员'; }
  if (key === 'quick' && cap === 'general_chat' && !pick('qsk').length) return '通用对话至少需要一个技能';
  if (key === 'plug') { const pl = f.pl || {}, sk = pl.skill || [], on = sk.concat(pl.mcp || []); if (cap === 'general_chat' && !sk.length) return '通用对话至少需要添加一个 Skill'; for (const k of on) { const x = SKILLS.find(y => y[0] === k); if (!x[2]) continue; const ev = (f.ev || {})[k]; if (!ev) return '「' + k + '」声明了必填环境变量，请选择配置集或新建'; if (ev === '__new' && x[2].split('、').some(v => !f['evv-' + k + '-' + v])) return '请填写「' + k + '」的全部必填环境变量'; } }
  return '';
};
ACT.spnext = a => {
  const P = SPS(), f = P.f, d = data(), req = (v, m) => { if (!v || !String(v).trim()) { P.err = m; return false; } return true; };
  if (a === 'asst') {
    const seq = ASEQ[f.cap], st = sstep('asst', seq.length), e = askErr(f, d, seq[st - 1], P); if (e) { P.err = e; return; }
    P.err = ''; P.step[a] = Math.min(seq.length, st + 1); return;
  }
  const st = sstep(a, STEPN[a]);
  if (a === 'ds') {
    const T = f.dt || 'GitHub', ty = DSTYPES.find(x => x[0] === T);
    if (st === 2) { if (!req(f.dn, '请填写知识库名称')) return; if (ty[2] && !req(f.dr, '请填写仓库或资源地址')) return; if (ty[2] === 2 && !f.dc) { P.err = '飞书知识库必须选择一个连接'; return; } }
  }
  P.err = ''; P.step[a] = Math.min(STEPN[a], st + 1);
};
ACT.sptype = a => { const [c, q] = a.split('|'), P = SPS(), f = P.f; f.cap = c; f.aq = q === '1' ? '1' : ''; P.step.asst = 1; P.err = ''; };
ACT.awiz = () => { const P = SPS(); P.origin = 'assistants'; P.err = ''; P.step.asst = 1; S.ui.auto = 1; S.drawer = { kind: 'spf', id: 'asst', tab: '' }; };
ACT.awizscn = sc => { const P = SPS(); ACT.awiz(); if (sc === 'wizard') { P.f.cap = 'knowledge_qa'; P.f.an = '研发问答'; P.step.asst = 2; } if (sc === 'wizard-err') { P.f.cap = 'knowledge_qa'; P.step.asst = 1; P.err = '请填写助手名称'; } };
DRAWERS.awiz = () => DRAWERS.spf('asst');
ACT.spsave = a => {
  const [stage, nextFlag] = a.split('|'), P = SPS(), f = P.f, d = data(), add = P.added[stage] = P.added[stage] || [], req = (v, m) => { if (!v || !String(v).trim()) { P.err = m; return false; } return true; };
  let items = [];
  if (stage === 'model') {
    if (!req(f.mn, '请填写模型名称') || !req(f.mk, '请填写 API Key')) return;
    if (scn() === 'save-fail' || f.mtest === 'bad') { f.mtest = 'bad'; P.err = '连接失败：401 invalid_api_key，请检查 API Key（已保留你填写的内容）'; return; }
    items = [f.mn + ' · ' + (f.mp || 'Anthropic') + (f.mt === 'embedding' ? '（向量嵌入）' : f.md !== '' && !d.model.length ? '（默认）' : '')];
  } else if (stage === 'conn') { if (!req(f.cn, '请填写连接名称') || !req(f.ck, '请填写访问令牌')) return; items = [f.cn + ' · 已校验']; if (!f.dc) f.dc = f.cn; }
  else if (stage === 'node') { if ((f.nm || '使用共享节点') === '注册私有节点') { if (!req(f.nn, '请填写节点名称')) return; items = [f.nn + ' · 在线（私有）']; } else { const p = picked('sh'); if (!p.length) { P.err = '请至少选择一个共享节点'; return; } items = p.map(n => n + ' · 在线（共享）'); } if (!f.dn2) f.dn2 = nameOf(items[0]); }
  else if (stage === 'ds') { items = [f.dn + ' · 同步中']; }
  else if (stage === 'asst') {
    if (!f.cap) { P.err = '请先选择助手类型'; return; }
    const ks = f.aq ? ['quick'] : ASEQ[f.cap]; for (const k of ks) { const e = askErr(f, d, k, P); if (e) { P.err = e; if (!f.aq) P.step.asst = ASEQ[f.cap].indexOf(k) + 1; return; } }
    const pl = f.pl || {}, ds = NEEDS_DS(f.cap) ? Object.keys(f.ad2 || {}).filter(x => f.ad2[x]) : [], mem = Object.keys(f.am2 || {}).filter(x => f.am2[x]), qs = Object.keys(f.qsk || {}).filter(x => f.qsk[x]);
    items = [{ name: f.an, ds: ds.length, sk: f.cap === 'smart' ? mem.length : f.aq ? qs.length : ['skill', 'mcp', 'conn'].reduce((n, k) => n + (pl[k] || []).length, 0), model: f.am || nameOf(d.model.filter(t => !/向量嵌入/.test(t))[0]) }];
  }
  else { if (!req(f.ue, '请填写邮箱')) return; items = [f.ue + ' · 已邀请']; }
  items.forEach(i => add.push(i));
  const clr = { model: ['mt', 'mp', 'mn', 'mk', 'mb', 'mv', 'md', 'mtest'], conn: ['cc', 'cn', 'ck'], node: ['nm', 'nn', 'sh'], ds: ['dt', 'dc', 'dn', 'dr', 'dn2', 'dp', 'dsp', 'dsi', 'dcr', 'dcheck'], asst: ['an', 'ad', 'as', 'am', 'amm', 'adm', 'atk', 'atn', 'cap', 'aq', 'ad2', 'am2', 'qsk', 'aex', 'aed', 'acg', 'acq', 'pl', 'padd', 'ev', 'aw', 'av', 'ag', 'au', 'aps'], user: ['ue', 'ur', 'ug'] }[stage];
  Object.keys(f).filter(k => clr.indexOf(k) >= 0 || k.startsWith('evv-') || k.startsWith('evn-')).forEach(k => { if (!(P.back && stage !== 'ds' && stage !== 'asst' && (k === 'dc' || k === 'dn2'))) delete f[k]; });
  P.err = ''; P.step[stage] = 1;
  const back = P.back; P.back = null;
  toast('ok', stage === 'asst' ? '助手已创建，可以开始提问了' : '已保存' + (stage === 'ds' ? '，开始首次同步' : ''));
  if (back) { S.drawer = { kind: 'spf', id: back.kind, tab: '' }; return; }
  const nx = P.origin ? null : STAGES[SI(stage) + 1];
  if (nextFlag === '1' && nx) S.drawer = { kind: 'spf', id: nx[0], tab: '' }; else S.drawer = null;
};
})();
