/* 用户端页面：登录 / 重置密码 / 首页 / 聊天 / 历史 / 我的分享 / 公开问答 / 设置 / 404 */
(function () {
'use strict';
const { ic, esc, md, rng, pick, int, ago, dt, av, fmt, page, scn, cnt, gate, pill, stt, btn, tgl, field, inp, slt, banner, bar, kv, dgrp, code, phead, empty, listPage, T, toast, openConfirm, openDrawer } = H;
const A = () => H.assistants()[S.asw] || null;

/* ═════ 登录 ═════ */
page({
  id: 'login', grp: '用户端 · 账号', title: '登录', layout: 'bare',
  scn: [['err-pw', '密码错误（剩余 2 次）'], ['locked', '账号被锁定'], ['disabled', '账号未激活 / 已停用'], ['expired', '登录已过期（被动登出）'], ['captcha', '人机验证未通过'], ['net', '网络 / 服务异常'], ['code', '邮箱验证码 · 已发送'], ['code-err', '邮箱验证码 · 错误或过期'], ['forgot', '忘记密码'], ['forgot-sent', '忘记密码 · 邮件已发送']],
  notes: [
    '**错误就近、可恢复**：错误提示固定在表单顶部，并给出下一步（剩余次数 / 解锁时间 / 联系管理员），不再只弹短暂 toast。',
    '**多种登录方式不跳页**：密码 / 邮箱验证码用分段控件原地切换，Google 登录始终在第一屏，减少“找入口”。',
    '**人机验证失败不丢输入**：Turnstile 失败时保留已填账号，仅禁用提交并提示重试。',
    '**移动端**：左侧品牌区折叠，表单单列，输入框 42px 高、字号 15px 以避免 iOS 自动缩放。',
    '**被动登出带回跳**：登录过期时顶部提示“已为你保存当前页面”，登录后回到原页面（`?next=`）。',
  ],
  render() {
    const sc = scn(), tab = sc.startsWith('code') ? 'code' : (S.ui.ltab || 'pw'), forgot = sc.startsWith('forgot');
    const busy = S.ui.busy;
    let top = '';
    if (sc === 'err-pw') top = banner('bad', 'warn', '<b>账号或密码不正确</b>，还可以尝试 2 次。连续失败将锁定 15 分钟。', '<button class="lnk" style="font-weight:600;text-decoration:underline" data-act="lgset" data-a="forgot">忘记密码？</button>');
    if (sc === 'locked') top = banner('bad', 'lock', '<b>账号已被临时锁定</b>，请在 <span class="mono">14:32</span> 后重试，或通过邮箱验证码登录。', '<button class="btn btn-gh sm" data-act="lgset" data-a="code">验证码登录</button>');
    if (sc === 'disabled') top = banner('warn', 'ban', '<b>该账号已被停用</b>。请联系管理员 <span class="mono">admin@acme.com</span> 恢复访问。');
    if (sc === 'expired') top = banner('info', 'clock', '<b>登录已过期</b>，请重新登录。你正在查看的页面已保存，登录后会自动回到那里。');
    if (sc === 'captcha') top = banner('warn', 'shield', '<b>人机验证未通过</b>，请重新完成验证后再提交。');
    if (sc === 'net') top = banner('bad', 'wifioff', '<b>无法连接到服务器</b>，请检查网络后重试。输入内容已保留。', '<button class="btn btn-gh sm" data-act="lgbusy">重试</button>');
    if (sc === 'code-err') top = banner('bad', 'warn', '<b>验证码错误或已过期</b>，请重新获取。');
    let form;
    if (forgot) {
      form = sc === 'forgot-sent'
        ? '<div class="empty sm" style="padding:8px 0"><div class="empty-ic acc">' + ic('mail') + '</div><div class="empty-t">重置邮件已发送</div><div class="empty-d">我们已向 <b>zhang.wei@acme.com</b> 发送了重置链接，30 分钟内有效。没收到？检查垃圾邮件，或 <span class="mono">47s</span> 后重新发送。</div></div><button class="btn btn-gh blk lg" data-act="lgset" data-a="">返回登录</button>'
        : '<h2>找回密码</h2><p class="psub" style="margin:-8px 0 0">输入注册邮箱，我们会发送重置链接。</p>' + field('邮箱', inp('', { ph: 'you@company.com', type: 'email' })) + '<button class="btn btn-pri blk lg" data-act="lgset" data-a="forgot-sent">发送重置链接</button><button class="btn btn-ln blk" data-act="lgset" data-a="">返回登录</button>';
    } else {
      form = '<h2>欢迎回来</h2>' + top +
        '<button class="btn btn-gh blk lg" data-act="toast" data-a="info|跳转 Google OAuth（演示）"><svg class="ico" viewBox="0 0 24 24" style="width:16px;height:16px"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.300 3-7.300z"/><path fill="#34A853" d="M12 22c2.700 0 5-.9 6.600-2.400l-3.200-2.500c-.9.600-2 1-3.400 1-2.600 0-4.800-1.800-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.400 14c-.2-.6-.3-1.300-.3-2s.1-1.400.3-2V7.400H3.100a10 10 0 0 0 0 9.200z"/><path fill="#EA4335" d="M12 5.900c1.500 0 2.800.5 3.800 1.500l2.800-2.800A10 10 0 0 0 3.100 7.400L6.400 10c.8-2.300 3-4.100 5.600-4.100z"/></svg>使用 Google 账号继续</button><div class="divider">或</div>' +
        '<div class="segs" style="align-self:stretch"><button class="seg' + (tab === 'pw' ? ' on' : '') + '" style="flex:1;justify-content:center" data-act="lgset" data-a="pw">密码登录</button><button class="seg' + (tab === 'code' ? ' on' : '') + '" style="flex:1;justify-content:center" data-act="lgset" data-a="code">邮箱验证码</button></div>' +
        field('邮箱', inp('zhang.wei@acme.com', { type: 'email', err: sc === 'err-pw' && false })) +
        (tab === 'pw'
          ? field('密码', '<div class="inwrap"><input class="inp' + (sc === 'err-pw' || sc === 'locked' ? ' err' : '') + '" type="' + (S.ui.eye ? 'text' : 'password') + '" value="' + (sc === 'err-pw' ? 'wrongpass1' : '') + '" placeholder="输入密码"><button class="qbtn eye" data-act="lgeye" aria-label="显示密码">' + ic(S.ui.eye ? 'eyeoff' : 'eye') + '</button></div>')
          : field('验证码', '<div style="display:flex;gap:8px"><input class="inp mono' + (sc === 'code-err' ? ' err' : '') + '" placeholder="6 位数字" maxlength="6" value="' + (sc === 'code-err' ? '482913' : '') + '"><button class="btn btn-gh" style="height:auto;min-height:34px;flex:none" data-act="toast" data-a="ok|验证码已发送，59 秒后可重发">' + (sc === 'code' ? '<span class="mono">47s</span> 后重发' : '获取验证码') + '</button></div>', { hint: sc === 'code' ? '验证码已发送至 zhang.wei@acme.com，10 分钟内有效。' : '' })) +
        '<div class="mono" style="font-size:11px;color:var(--fg4);display:flex;align-items:center;gap:10px;border:1px solid var(--line-strong);border-radius:6px;padding:11px 12px;background:var(--surface)"><span class="cbx on" style="width:20px;height:20px">' + ic('check') + '</span><span style="font-family:var(--f);font-size:12.5px;color:var(--fg2)">' + (sc === 'captcha' ? '<span style="color:var(--danger)">验证失败，请重试</span>' : '已通过人机验证') + '</span><span style="margin-left:auto">Cloudflare</span></div>' +
        '<button class="btn btn-pri blk lg' + (busy ? ' dis' : '') + '" data-act="lgbusy">' + (busy ? '<span class="spin"></span>登录中…' : '登录') + '</button>' +
        (tab === 'pw' ? '<div style="display:flex;justify-content:space-between"><button class="btn btn-ln sm" data-act="lgset" data-a="forgot">忘记密码？</button><span class="muted">还没有账号？联系管理员开通</span></div>' : '');
    }
    return '<div class="authwrap"><aside class="auth-side"><div class="brand" style="position:relative"><span class="bmark" style="background:#fff"></span><span class="bname" style="color:#fff;font-size:17px">SourceLens</span></div><div><h1>让团队的资料，可以被提问。</h1><p>连接代码仓库、文档与业务系统，用带引用的回答替代翻找。每一条结论都能追溯到来源。</p></div><div class="fts"><div class="ft">' + ic('shield') + '<span>回答附带证据引用与审核状态</span></div><div class="ft">' + ic('db') + '<span>GitLab / GitHub / 飞书 / Jira 一键接入</span></div><div class="ft">' + ic('activity') + '<span>每次运行可观测、可复盘</span></div></div></aside><main class="auth-form"><div class="auth-card">' + form + '</div></main></div>';
  },
});
ACT.lgset = a => { if (a === 'pw' || a === 'code') { S.ui.ltab = a; S.scn[S.page] = a === 'code' ? 'code' : ''; } else S.scn[S.page] = a; };
ACT.lgeye = () => { S.ui.eye = !S.ui.eye; };
ACT.lgbusy = () => { S.ui.busy = true; setTimeout(() => { S.ui.busy = false; const s = scn(); if (!s || s === 'code') { go('chat'); } else { toast('bad', '仍然失败：' + ({ 'err-pw': '账号或密码不正确', locked: '账号已锁定', disabled: '账号已停用', captcha: '人机验证未通过', net: '无法连接服务器' }[s] || '请稍后再试')); render(); } }, 900); };

/* ═════ 重置密码 ═════ */
page({
  id: 'reset', grp: '用户端 · 账号', title: '重置密码', layout: 'bare',
  scn: [['weak', '密码强度弱 + 不一致'], ['strong', '密码合规可提交'], ['expired', '链接已过期'], ['done', '重置成功']],
  notes: ['**实时强度提示**：输入时显示 4 段强度条与具体缺失项（长度 / 数字 / 符号），而不是提交后才报错。', '**链接过期可自救**：过期页直接提供“重新发送重置邮件”，不让用户回到登录页重新找入口。', '**成功后不强制重新登录**：给出“进入工作台”，并说明其他设备已登出。'],
  render() {
    const sc = scn();
    let b;
    if (sc === 'expired') b = '<div class="empty sm" style="padding:6px 0"><div class="empty-ic warn">' + ic('clock') + '</div><div class="empty-t">重置链接已失效</div><div class="empty-d">链接有效期为 30 分钟，且只能使用一次。请重新获取。</div></div><button class="btn btn-pri blk lg" data-act="toast" data-a="ok|已重新发送，请查收邮件">重新发送重置邮件</button><button class="btn btn-ln blk" data-nav="login">返回登录</button>';
    else if (sc === 'done') b = '<div class="empty sm" style="padding:6px 0"><div class="empty-ic" style="background:var(--ok-soft);color:var(--ok)">' + ic('okc') + '</div><div class="empty-t">密码已重置</div><div class="empty-d">为了安全，你在其他设备上的登录已全部退出。</div></div><button class="btn btn-pri blk lg" data-nav="chat">进入工作台</button>';
    else {
      const strong = sc === 'strong';
      b = '<h2>设置新密码</h2><p class="psub" style="margin:-8px 0 0">为 <b>zhang.wei@acme.com</b> 设置新密码</p>' + field('新密码', '<div class="inwrap"><input class="inp" type="password" value="' + (strong ? 'Lens#2026-secure' : 'abc123') + '"><button class="qbtn eye">' + ic('eye') + '</button></div><div class="pwmeter" style="margin-top:8px"><i class="' + (strong ? 'on3' : 'on1') + '"></i><i class="' + (strong ? 'on3' : '') + '"></i><i class="' + (strong ? 'on3' : '') + '"></i><i class="' + (strong ? 'on3' : '') + '"></i></div>', { hint: strong ? '<span style="color:var(--ok)">✓ 强度良好</span>' : '<span style="color:var(--danger)">强度弱：</span>至少 8 位 · 含大小写 · 含符号' }) + field('确认新密码', '<input class="inp' + (strong ? '' : ' err') + '" type="password" value="' + (strong ? 'Lens#2026-secure' : 'abc12') + '">', { err: strong ? '' : '两次输入的密码不一致' }) + '<button class="btn btn-pri blk lg' + (strong ? '' : ' dis') + '" data-act="rsdone">重置密码</button>';
    }
    return '<div class="center-page" style="background:var(--canvas)"><div class="panel pad auth-card" style="padding:28px">' + '<div class="brand" style="margin-bottom:4px"><span class="bmark"></span><span class="bname">SourceLens</span></div>' + b + '</div></div>';
  },
});
ACT.rsdone = () => { S.scn[S.page] = 'done'; };

/* ═════ 404 / 错误页 ═════ */
page({
  id: '404', grp: '用户端 · 账号', title: '404 / 错误页', layout: 'bare',
  scn: [['gone', '助手已下线'], ['500', '服务器错误 500'], ['forbid', '无权访问 403']],
  notes: ['**不是死胡同**：每种错误都给“回到最近一次使用的助手”和“反馈问题”，而不是只有首页链接。', '**区分原因**：404 / 助手下线 / 403 / 500 使用不同图标与措辞，并带 request_id 方便排障。'],
  render() {
    const sc = scn(); const M = { '': ['404', '页面不存在', '你访问的地址可能已被移动或删除。', 'search'], gone: ['410', '这个助手已下线', '管理员已停用「基础设施运维助手」。你可以切换到其他助手继续提问。', 'bot'], 500: ['500', '服务暂时不可用', '我们的服务出现了问题，工程师已收到告警。你的输入和会话都没有丢失。', 'warn'], forbid: ['403', '没有访问权限', '该内容仅对特定用户组开放。如需访问，请联系助手管理员。', 'lock'] }[sc];
    return '<div class="center-page"><div class="empty"><div class="bignum">' + M[0] + '</div><div class="empty-ic ' + (sc === '500' ? 'bad' : sc === 'forbid' ? 'warn' : '') + '">' + ic(M[3]) + '</div><div class="empty-t" style="font-size:19px">' + M[1] + '</div><div class="empty-d">' + M[2] + '</div><div class="empty-code">request_id: 5b2e-0c71' + (sc === '500' ? ' · 已自动上报' : '') + '</div><div class="empty-a"><button class="btn btn-pri" data-nav="chat">' + ic('back') + '回到工作台</button>' + (sc === '500' ? '<button class="btn btn-gh" data-act="toast" data-a="info|已刷新页面">刷新重试</button>' : '<button class="btn btn-gh" data-act="toast" data-a="ok|已提交反馈">反馈问题</button>') + '</div></div></div>';
  },
});

/* ═════ 首页（入口分流） ═════ */
page({
  id: 'home', grp: '用户端 · 账号', title: '首页（入口分流）', layout: 'bare',
  scn: [['loading', '正在进入最近助手'], ['admin', '无助手 · 管理员引导'], ['visitor', '无助手 · 普通用户'], ['error', '助手列表加载失败']],
  notes: ['**入口只做分流**：有助手 → 进入最近使用的；没有 → 按角色给不同引导（管理员：3 步创建；普通用户：说明 + 联系方式）。', '**加载有出口**：超过 5 秒显示“跳过，选择助手”，失败时明确指出原因并可重试，而不是无限转圈。'],
  render() {
    const sc = scn() || (S.scale === 'empty' ? 'admin' : 'loading');
    if (sc === 'loading') return '<div class="center-page"><div style="display:flex;flex-direction:column;align-items:center;gap:14px"><span class="spin2" style="width:26px;height:26px;border-width:3px"></span><div class="muted">正在进入「SourceLens 产品文档助手」…</div><button class="btn btn-ln sm" data-nav="chat">跳过，直接选择助手</button></div></div>';
    if (sc === 'error') return '<div class="center-page"><div style="width:min(520px,100%)">' + H.errorPanel('无法加载助手列表') + '</div></div>';
    if (sc === 'visitor') return '<div class="center-page"><div class="empty"><div class="empty-ic">' + ic('bot') + '</div><div class="empty-t" style="font-size:18px">还没有可用的助手</div><div class="empty-d">管理员尚未为你的账号分配助手。请联系管理员 <b>admin@acme.com</b> 开通，开通后刷新页面即可。</div><div class="empty-a"><button class="btn btn-pri" data-act="retry">刷新</button><button class="btn btn-gh" data-act="toast" data-a="ok|已向管理员发送开通请求">请求开通</button></div></div></div>';
    return '<div class="center-page"><div style="width:min(720px,100%);display:flex;flex-direction:column;gap:18px"><div style="text-align:center"><div class="hero-ic" style="margin:0 auto 14px">' + ic('bot') + '</div><h1 class="ptitle" style="font-size:24px">创建你的第一个助手</h1><p class="psub">3 步完成：接入数据 → 配置助手 → 开始提问</p></div><div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">' + [['1', 'db', '接入知识库', '连接 GitLab / 飞书 / 本地文件', 'datasources'], ['2', 'bot', '配置助手', '选择模型、数据范围与技能', 'assistants'], ['3', 'msg', '开始提问', '回答带引用，可分享', 'chat']].map(s => '<button class="panel pad" style="text-align:left;gap:8px;cursor:pointer" data-nav="' + s[4] + '"><span class="pill acc mono" style="align-self:flex-start">STEP ' + s[0] + '</span><div class="thumb acc">' + ic(s[1]) + '</div><b style="font:700 14px var(--f)">' + s[2] + '</b><span class="muted">' + s[3] + '</span></button>').join('') + '</div><div style="text-align:center"><button class="btn btn-pri lg" data-nav="assistants">' + ic('plus') + '开始创建</button></div></div></div>';
  },
});

/* ═════ 聊天 ═════ */
const STEPS = [['确认 GitLab 连接与凭证类型', 3.2], ['读取最近一次同步的失败日志', 5.8], ['检索《凭证与权限》文档', 8.4], ['核对 Token 过期时间与 scope', 2.1], ['整理排查步骤并生成回答', 4.8]];
const ANS = '<p>同步报 <code>401 Unauthorized</code> 基本都是凭证问题，按下面顺序排查：</p><ul><li><b>Token 已过期</b>：日志显示该 Personal Access Token 于 <code>2026-11-02</code> 到期<span class="cite" title="sync.log:128">' + ic('file') + 'sync.log:128</span></li><li><b>scope 不足</b>：同步需要 <code>read_repository</code>，当前仅有 <code>read_api</code><span class="cite">' + ic('file') + '凭证与权限.md §3</span></li><li><b>仓库地址指向了自建实例</b>：自建 GitLab 需要在连接里填写 Base URL</li></ul><p>建议先在「连接管理」里更新 Token，再手动触发一次同步确认。</p>';
function aiMsg(o) { return Object.assign({ r: 'ai', plan: STEPS.map((s, i) => ({ t: s[0], d: s[1], s: 'done' })), ans: ANS, review: 'supported', follow: ['如何给 Token 配置正确的 scope？', '这些结论分别来自哪些来源？'], total: 24.3 }, o || {}); }
function initMsgs(sc) {
  const q = { r: 'me', t: 'GitLab 知识库同步一直报 401，要怎么排查？' };
  if (sc === 'new' || S.ui.fresh) return [];
  if (sc === 'stream') return [q, aiMsg({ stream: true, plan: STEPS.map((s, i) => ({ t: s[0], d: i < 3 ? s[1] : null, s: i < 2 ? 'done' : i === 2 ? 'run' : 'todo' })), ans: '<p>同步报 <code>401 Unauthorized</code> 基本都是凭证问题，先看日志……', review: null, follow: null })];
  if (sc === 'tool-fail') return [q, aiMsg({ plan: STEPS.map((s, i) => ({ t: s[0], d: i === 1 ? 1.2 : s[1], s: i === 1 ? 'fail' : i > 2 ? 'todo' : 'done', err: i === 1 ? '工具 read_sync_log 超时（节点响应 30s）' : '' })), partial: true, ans: '<p>日志读取失败，<b>以下仅基于文档推断</b>，未经日志核实：同步 401 常见于 Token 过期或 scope 不足，建议先检查凭证。</p>', review: 'inconclusive', follow: null })];
  if (sc === 'review-bad') return [q, aiMsg({ review: 'unsupported', warn: '部分引用的证据未被读取，相关结论保持未核实状态。', ans: ANS.replace('2026-11-02', '2026-11-02（未核实）') })];
  if (sc === 'model-err') return [q, { r: 'ai', err: { t: '大模型服务暂时不可用，未能完成回答。请稍后重试或联系管理员切换模型。', code: 'model_unavailable · 503' } }];
  if (sc === 'node-off') return [q, { r: 'ai', queued: true }];
  const base = [q, aiMsg()];
  if (sc === 'long') {
    const out = [{ r: 'note', t: '较早的 38 条消息已自动摘要，关键材料已固定' }];
    for (let i = 0; i < 6; i++) { out.push({ r: 'me', t: ['那 scope 具体怎么勾选？', '自建 GitLab 的 Base URL 填什么格式？', '同步频率能改成每小时吗？', '失败后会自动重试吗？', '怎么只同步某个分支？', '帮我汇总成一份排查清单'][i] }); out.push(aiMsg({ plan: null, ans: '<p>' + ['勾选 <code>read_repository</code> 和 <code>read_api</code> 两项即可。', '格式为 <code>https://gitlab.acme.com</code>，不要带 <code>/api/v4</code>。', '可以，在知识库“同步策略”里把 cron 改为 <code>0 * * * *</code>。', '会，默认指数退避重试 3 次，之后标记为失败并发出告警。', '在知识库表单“分支”里填写分支名，留空为默认分支。', '已整理为 5 条清单，见下方。'][i] + '</p>', review: i % 2 ? 'supported' : 'not_requested', follow: null })); }
    return out;
  }
  return base;
}
function msgHTML(m, i, last) {
  if (m.r === 'note') return '<div class="ctxnote">' + ic('layers') + esc(m.t) + '</div>';
  if (m.r === 'me') return '<div class="msg me"><div class="bub">' + esc(m.t) + '</div></div>';
  const body = [];
  if (m.queued) body.push('<div class="bub"><div style="display:flex;align-items:center;gap:10px"><span class="spin2"></span><b>排队中</b></div><p class="muted" style="margin-top:6px">执行节点 <span class="mono">lens-node-03</span> 暂时离线，已转交 <span class="mono">lens-node-01</span>，前方还有 2 个任务。预计 40 秒内开始。</p><div class="toolrow"><button class="btn btn-gh sm" data-act="toast" data-a="info|已取消本次提问">取消</button></div></div>');
  else if (m.err) body.push('<div class="trace bad">' + ic('warn') + '回答未能完成<span class="mm">' + esc(m.err.code) + '</span></div><div class="bub" style="border-color:var(--danger)">' + esc(m.err.t) + '<div class="toolrow" style="margin-top:10px"><button class="btn btn-pri sm" data-act="retrymsg">' + ic('refresh') + '重试</button><button class="btn btn-gh sm" data-act="toast" data-a="ok|已通知管理员">通知管理员切换模型</button></div></div>');
  else {
    if (m.plan) {
      const done = m.plan.filter(p => p.s === 'done').length, open = S.ui['pl' + i] != null ? S.ui['pl' + i] : (m.stream || m.partial);
      body.push('<div class="plan"><button class="plan-h" data-act="plan" data-a="' + i + '">' + (m.stream ? '<span class="spin2"></span>' : m.partial ? ic('warn') : ic('okc')) + '<span>' + (m.stream ? '正在执行计划' : m.partial ? '计划部分完成' : '执行计划') + '</span><span class="meta">' + (m.stream ? '进行中 · ' + done + '/' + m.plan.length : '已完成 ' + done + '/' + m.plan.length + ' · 用时 ' + m.total + 's') + ic(open ? 'up' : 'down') + '</span></button>' + (open ? '<div class="plan-b">' + m.plan.map((p, k) => '<div class="pstep ' + (p.s === 'run' ? 'run' : p.s) + '"><span class="pn">' + (p.s === 'done' ? ic('check') : p.s === 'fail' ? ic('x') : p.s === 'run' ? '<span class="spin2" style="width:9px;height:9px;border-width:1.5px"></span>' : k + 1) + '</span><span>' + esc(p.t) + (p.err ? '<br><span style="color:var(--danger);font-size:11.5px">' + esc(p.err) + '</span>' : '') + '</span><span class="du">' + (p.d != null ? p.d + 's' : p.s === 'run' ? '…' : '') + '</span></div>').join('') + '</div>' : '') + '</div>');
    }
    if (m.partial) body.push('<div class="trace bad">' + ic('warn') + '回答不完整：有 1 个步骤失败<span class="mm">run_partial</span></div>');
    body.push('<div class="bub">' + m.ans + (m.stream ? '<span class="caret"></span>' : '') + '</div>');
    if (m.review && m.review !== 'not_requested') { const R = { supported: ['ok', 'okc', '答案审核：有证据支持'], unsupported: ['bad', 'warn', '答案审核：缺少证据支持'], inconclusive: ['warn', 'info', '答案审核：无法判定'] }[m.review]; body.push('<button class="review ' + R[0] + '" data-act="toast" data-a="info|' + (m.warn || '证据覆盖完整，所有引用已被读取。') + '">' + ic(R[1]) + R[2] + '</button>'); }
    if (m.warn) body.push('<div class="banner warn" style="margin-top:8px;padding:8px 12px;font-size:12px">' + ic('warn') + '<div class="bd">' + esc(m.warn) + '</div></div>');
    if (m.follow && last) body.push('<div class="fups">' + m.follow.map(f => '<button data-act="ask" data-a="' + esc(f) + '">' + ic('right') + esc(f) + '</button>').join('') + '</div>');
    if (!m.stream) body.push('<div class="msg-tools"><button class="qbtn" data-act="toast" data-a="ok|已复制回答" aria-label="复制">' + ic('copy') + '</button><button class="qbtn" data-act="retrymsg" aria-label="重新生成">' + ic('refresh') + '</button><button class="qbtn" data-act="share" aria-label="分享">' + ic('share') + '</button><button class="qbtn" data-act="toast" data-a="ok|感谢反馈" aria-label="有帮助">' + ic('check') + '</button></div>');
  }
  return '<div class="msg ai"><div class="mav ai">' + ic('bot') + '</div><div style="flex:1;min-width:0">' + body.join('') + '</div></div>';
}
page({
  id: 'chat', grp: '用户端 · 对话', title: '聊天（助手对话）', layout() { return scn() === 'anon' ? 'bare' : 'user'; }, stick: true,
  scn: [['new', '新对话'], ['stream', '流式生成中（计划 3/5）'], ['long', '超长对话 + 已摘要'], ['tool-fail', '工具失败 · 部分完成'], ['review-bad', '答案审核：缺少证据'], ['model-err', '模型不可用'], ['node-off', '节点离线 · 排队中'], ['rate', '额度 / 限流用尽'], ['attach-err', '附件超限 / 格式不支持'], ['offline', '网络断开重连中'], ['disabled', '助手被停用'], ['anon', '匿名访问公开助手']],
  notes: [
    '**过程透明但默认克制**：执行计划折叠为一行“已完成 5/5 · 用时 24.3s”，生成中自动展开并显示每步耗时；失败步骤标红并给出原因。',
    '**答案审核状态**：回答下方的胶囊（有证据支持 / 缺少证据 / 无法判定）可点开看证据覆盖，告别“看起来对但不知道靠不靠谱”。',
    '**追问建议只在最后一条回答显示**，一键发送；超长对话顶部提示“较早消息已摘要，关键材料已固定”，让用户知道上下文被压缩。',
    '**所有异常都在对话里闭环**：模型不可用 / 节点离线排队 / 额度用尽 / 断网，各有对应的占位气泡或输入区状态，并提供重试 / 取消 / 联系管理员。',
    '**移动端**：侧栏收为抽屉，顶栏精简为 菜单·助手名·分享；输入区贴底，建议问题单列。',
    '**匿名访问**公开助手时去掉会话侧栏，顶部给“登录后可保存历史”。',
    '**两种界面风格**（柔和圆润 / 经典）：同一套功能与信息架构，只改视觉与圆角、留白。柔和圆润为默认。',
  ],
  render() {
    const sc = scn(), a = A();
    if (S.ui.msgs == null) S.ui.msgs = initMsgs(sc);
    const msgs = S.ui.msgs;
    if (!a && sc !== 'anon') return '<div class="chat-top"><button class="ibtn hamb" data-act="nav" aria-label="菜单">' + ic('menu') + '</button><div class="tt"><b>SourceLens</b></div></div><div class="center-page"><div class="empty"><div class="empty-ic acc">' + ic('bot') + '</div><div class="empty-t">还没有可用的助手</div><div class="empty-d">创建一个助手并接入知识库后，就可以在这里提问了。</div><div class="empty-a"><button class="btn btn-pri" data-nav="assistants">' + ic('plus') + '创建助手</button><button class="btn btn-gh" data-nav="home">查看引导</button></div></div></div>';
    const an = a || { name: 'SourceLens 产品文档助手', pub: true, slug: 'sourcelens-docs' };
    let lock = '', dis = false, ph = innerWidth < 821 ? '输入问题…' : '向「' + an.name + '」提问，Enter 发送，Shift+Enter 换行';
    if (sc === 'rate') { lock = banner('warn', 'zap', '<b>今日提问额度已用完</b>（50/50）。额度将在 <span class="mono">00:00</span> 重置，或联系管理员提升额度。', '<button class="btn btn-gh sm" data-act="toast" data-a="ok|已申请提升额度">申请更多额度</button>'); dis = true; ph = '额度已用完，暂时无法提问'; }
    if (sc === 'offline') { lock = banner('bad', 'wifioff', '<b>网络已断开</b>，正在重新连接（第 3 次）…你的草稿已保存。', '<span class="spin2"></span>'); dis = true; ph = '网络恢复后可继续'; }
    if (sc === 'disabled') { lock = banner('warn', 'ban', '<b>该助手已被管理员停用</b>，历史对话仍可查看，但无法继续提问。', '<button class="btn btn-gh sm" data-act="aswpick" data-a="0">切换助手</button>'); dis = true; ph = '助手已停用'; }
    if (sc === 'anon') lock = banner('info', 'info', '你正在以访客身份使用公开助手。<b>登录</b>后可保存历史、上传附件并继续分享。', '<button class="btn btn-pri sm" data-nav="login">登录</button>');
    const atts = sc === 'attach-err'
      ? '<div class="toolrow"><div class="attach err"><span class="thumb" style="background:transparent;color:inherit">' + ic('warn') + '</span><span style="min-width:0"><span class="trunc" style="max-width:150px">超大设计稿_最终版_v12.psd</span><small>超过 25 MB 上限（68.4 MB）</small></span><button class="qbtn" style="width:22px;height:22px">' + ic('x') + '</button></div><div class="attach"><span class="thumb">' + ic('img') + '</span><span style="min-width:0"><span class="trunc" style="max-width:150px">报错截图.png</span><small>1.2 MB · 已上传</small></span><button class="qbtn" style="width:22px;height:22px">' + ic('x') + '</button></div><div class="attach err"><span class="thumb" style="background:transparent;color:inherit">' + ic('warn') + '</span><span style="min-width:0"><span class="trunc" style="max-width:150px">模型.dwg</span><small>不支持的格式</small></span><button class="qbtn" style="width:22px;height:22px">' + ic('x') + '</button></div></div>' : '';
    const streaming = msgs.some(m => m.stream);
    let flow;
    if (!msgs.length) {
      const sg = [];
      flow = '<div class="chat-hero"><div class="hero-ic">' + ic('bot') + '</div><h2>今天想了解什么？</h2><p>向「' + esc(an.name) + '」提问，回答会附上来源引用。</p><div class="sugg">' + sg.map(s => '<button data-act="ask" data-a="' + s[1] + '">' + ic(s[2]) + esc(s[0]) + '</button>').join('') + '</div></div>';
    } else flow = '<div class="cflow-in">' + msgs.map((m, i) => msgHTML(m, i, i === msgs.length - 1)).join('') + '</div>';
    const right = '<button class="cmode cite-t' + (S.ui.cite !== false ? ' on' : '') + '" data-act="cite" aria-pressed="' + (S.ui.cite !== false) + '" title="显示回答中的来源引用，设置会在此浏览器中保留">' + ic('quote') + '<span class="hm-s">显示引用</span></button><button class="cmode' + (S.ui.deep ? ' on' : '') + '" data-act="deep" aria-pressed="' + !!S.ui.deep + '">' + ic('bolt') + '<span class="hm-s">深度思考</span></button>';
    const top = '<div class="chat-top"><button class="ibtn hamb" data-act="nav" aria-label="菜单">' + ic('menu') + '</button><div class="tt" style="position:relative">' + (sc === 'anon' || !a ? '<b>' + esc(an.name) + '</b>' : '<button class="aswtrig" data-act="asw" data-keep aria-haspopup="listbox" aria-expanded="' + (S.pop === 'asw') + '"><b>' + esc(an.name) + '</b>' + ic('down') + '</button>') + '<span>' + (an.pub ? '公开' : '私有') + ' · ' + esc(an.slug) + (sc === 'anon' ? ' · 访客' : '') + '</span>' + (S.pop === 'asw' ? H.aswPop() : '') + '</div>' + (sc === 'anon' ? '<button class="btn btn-pri sm" data-nav="login">登录</button>' : '<button class="btn btn-gh sm" data-act="share"' + (msgs.some(m => m.r === 'ai' && m.ans) ? '' : ' disabled style="opacity:.45"') + '>' + ic('share') + '<span class="hm-s">分享</span></button><button class="ibtn" data-nav="history" aria-label="历史">' + ic('clock') + '</button>') + '</div>';
    const long = sc === 'long' ? '<button class="btn btn-gh sm toBottom" data-act="toast" data-a="info|已回到底部">' + ic('down') + '回到底部</button>' : '';
    return top + '<div class="chat-wrap" style="position:relative"><div class="chat-main' + (msgs.length ? '' : ' is-empty') + (S.ui.cite === false ? ' nocite' : '') + '"><div style="padding:' + (lock ? '10px 20px 0' : '0') + '">' + lock + '</div><div class="cflow">' + flow + '</div>' + long +
      '<div class="composer-w"><div class="composer' + (dis ? ' dis' : '') + '">' + atts + '<textarea rows="1" data-k="draft" data-in="draft" placeholder="' + esc(ph) + '"' + (dis ? ' disabled' : '') + '>' + esc(S.ui.draft || '') + '</textarea><div class="comp-r"><button class="qbtn" data-act="toast" data-a="info|选择文件（演示）" aria-label="添加附件"' + (dis || sc === 'anon' ? ' disabled style="opacity:.4"' : '') + '>' + ic('clip') + '</button><button class="qbtn" data-act="toast" data-a="info|@ 引用知识库 / 技能" aria-label="@ 引用">' + ic('hash') + '</button>' + right + (streaming ? '<button class="send stop" data-act="stopgen" aria-label="停止生成">' + ic('stop') + '</button>' : '<button class="send' + (dis ? ' dis' : '') + '" data-act="send" aria-label="发送">' + ic('send') + '</button>') + '</div></div>' + ''+ '<div class="hint" style="text-align:center;margin-top:8px">AI 生成内容可能有误，请结合引用核实</div></div></div>' + '</div>';
  },
});
INP.draft = v => { S.ui.draft = v; return false; };
ACT.deep = () => { S.ui.deep = !S.ui.deep; };
ACT.cite = () => { S.ui.cite = S.ui.cite === false; try { localStorage.setItem('sl.showCitations', S.ui.cite === false ? 'false' : 'true'); } catch (e) {} };
ACT.plan = a => { const m = S.ui.msgs[+a]; S.ui['pl' + a] = !(S.ui['pl' + a] != null ? S.ui['pl' + a] : (m.stream || m.partial)); };
ACT.retrymsg = () => { const ms = S.ui.msgs; ms[ms.length - 1] = aiMsg({ stream: true, plan: STEPS.map(s => ({ t: s[0], d: null, s: 'todo' })), ans: '', review: null, follow: null }); runStream(); };
ACT.stopgen = () => { const m = S.ui.msgs.find(x => x.stream); if (m) { m.stream = false; m.partial = true; m.review = 'inconclusive'; m.ans += '</p><p class="muted">（已停止生成）</p>'; } clearTimeout(S._st); toast('info', '已停止生成'); };
ACT.ask = a => { send(a); };
ACT.send = () => { const t = (S.ui.draft || '').trim(); if (!t) { toast('warn', '请输入问题'); return false; } S.ui.draft = ''; send(t); };
function send(t) {
  S.ui.fresh = false; if (!S.ui.msgs) S.ui.msgs = []; if (scn() === 'new') S.scn[S.page] = '';
  S.ui.msgs.push({ r: 'me', t });
  S.ui.msgs.push(aiMsg({ stream: true, plan: STEPS.map(s => ({ t: s[0], d: null, s: 'todo' })), ans: '', review: null, follow: null }));
  runStream();
}
function runStream() {
  const m = S.ui.msgs[S.ui.msgs.length - 1]; let k = 0;
  const tick = () => {
    if (!m.stream) return;
    if (k < m.plan.length) { if (k > 0) { m.plan[k - 1].s = 'done'; m.plan[k - 1].d = STEPS[k - 1][1]; } m.plan[k].s = 'run'; k++; m.ans = ''; }
    else { m.plan[m.plan.length - 1].s = 'done'; m.plan[m.plan.length - 1].d = STEPS[4][1]; m.stream = false; m.ans = ANS; m.review = 'supported'; m.follow = ['如何给 Token 配置正确的 scope？', '这些结论分别来自哪些来源？']; render(); return; }
    render(); S._st = setTimeout(tick, 800);
  };
  render(); S._st = setTimeout(tick, 500);
}
ACT.share = () => { S.dialog = { html: shareHTML(), isShare: true }; };
function shareHTML() {
  const u = S.ui, mode = u.smode || 'login', locked = scn() === 'chat-lock', shared = u.shared;
  return '<div class="dlg-h"><h3>' + ic('share') + ' 分享这条问答</h3><button class="ibtn" style="margin-left:auto" data-act="dlg" data-a="cancel">' + ic('x') + '</button></div><div class="dlg-b" style="display:flex;flex-direction:column;gap:14px"><p class="muted" style="margin:0">接收者可以查看「' + esc((A() || { name: '助手' }).name) + '」的完整回答，并继续向这个 Agent 提问。</p>' + field('标题', inp('GitLab 知识库同步 401 排查')) +
    field('分享问答的可见范围', '<div style="display:flex;flex-direction:column;gap:8px"><button class="optcard' + (mode === 'public' ? ' on' : '') + '" data-act="smode" data-a="public"><span class="radio' + (mode === 'public' ? ' on' : '') + '"></span><span><b>公开可见</b><span>任何拿到链接的人都可以免登录直接打开。</span></span></button><button class="optcard' + (mode === 'login' ? ' on' : '') + '" data-act="smode" data-a="login"><span class="radio' + (mode === 'login' ? ' on' : '') + '"></span><span><b>租户内可见（跟随助手权限）</b><span>登录后、能使用该助手的成员可打开；助手对谁可见，分享就对谁可见。</span></span></button></div>', { hint: ((A() || { pub: true }).pub ? '默认是租户内可见（跟随助手权限）；管理员也可以在助手或全局设置里统一调整。' : '该助手只对指定成员 / 组可见，所以分享只能选“租户内可见”，仍然只有这批人能打开。') }) +
    '<div class="callout"><b>分享的是一条链接</b>：已登录且有权访问「' + esc((A() || { name: "助手" }).name) + '」的人，凭链接就能打开。它<b>不会</b>自动出现在助手的公开问答列表里；如果你希望更多同事看到，由管理员在「QA 榜单审核」里决定是否上榜。</div>' +
    (shared ? field('分享链接', '<div style="display:flex;gap:8px"><input class="inp mono" readonly value="https://lens.acme.com/lens/qa/k7Hq2xP9"><button class="btn btn-gh" data-act="toast" data-a="ok|分享链接已复制">' + ic('copy') + '复制</button></div>') : '') + '</div><div class="dlg-f">' + (shared ? '<button class="btn btn-ln" style="margin-right:auto;color:var(--danger)" data-act="unshare">取消分享</button><button class="btn btn-gh" data-act="toast" data-a="info|调用系统分享（演示）">' + ic('share') + '系统分享</button><button class="btn btn-pri" data-act="dlg" data-a="cancel">完成</button>' : '<button class="btn btn-gh" data-act="dlg" data-a="cancel">取消</button><button class="btn btn-pri" data-act="doshare">生成分享链接</button>') + '</div>';
}
ACT.smode = a => { S.ui.smode = a; S.dialog = { html: shareHTML(), isShare: true }; };
ACT.doshare = () => { S.ui.shared = true; S.dialog = { html: shareHTML(), isShare: true }; toast('ok', '已生成分享链接'); };
ACT.unshare = () => { S.ui.shared = false; S.dialog = null; toast('ok', '已取消分享，链接已失效'); };

DRAWERS.preview = (id) => ({
  title: (id || 'sync.log'), sub: '知识库 · backend-api · 行 120–134', wide: true,
  body: () => '<div class="banner info">' + ic('info') + '<div class="bd">此预览已禁用脚本和外部网络请求。高亮行为回答中引用的证据。</div></div><div class="lines">' + ['2026-11-02T08:11:02Z INFO  sync start repo=backend-api', '2026-11-02T08:11:03Z INFO  auth scheme=pat', '2026-11-02T08:11:03Z DEBUG GET /api/v4/projects/184/repository/tree', '2026-11-02T08:11:04Z WARN  token expires_at=2026-11-02', '2026-11-02T08:11:04Z ERROR 401 Unauthorized: invalid_token', '2026-11-02T08:11:04Z INFO  retry 1/3 backoff=2s', '2026-11-02T08:11:07Z ERROR 401 Unauthorized: invalid_token', '2026-11-02T08:11:07Z ERROR sync aborted'].map((l, i) => '<div class="' + (i === 4 ? 'hl' : '') + '"><b>' + (124 + i) + '</b>' + esc(l) + '</div>').join('') + '</div>',
  foot: '<button class="btn btn-gh" data-act="toast" data-a="ok|已下载">' + ic('download') + '下载</button><button class="btn btn-pri" data-act="dclose" style="margin-left:auto">关闭</button>',
});

/* ═════ 会话历史 ═════ */
page({
  id: 'history', grp: '用户端 · 对话', title: '会话历史', layout: 'user',
  notes: ['**搜索 + 时间筛选 + 批量删除**：历史很多时不再靠无限滚动找会话；搜索命中标题与首个问题。', '**海量数据**分页 20 条/页；手机上变两行卡片（标题 / 元信息）。', '**空状态**引导回到对话；**删除**走二次确认并给出“可撤销 10 秒”。'],
  render() {
    const ss = H.sessions(); const r = rng(3);
    const rows = ss.map((s, i) => ({ id: s.id, t: s.t, n: int(r, 2, 38), age: s.age, shared: r() > .8, st: r() > .93 ? 'failed' : 'ok', who: A() ? A().name : '' }));
    return H.userTop(esc((A() || { name: '会话历史' }).name) + ' / 会话历史', '', 'chat') + '<div class="scroll"><div class="body">' + phead('会话历史', (A() ? A().name : '无助手') + ' · 仅自己可见', btn('新对话', 'newchat', null, { k: 'btn-pri', i: 'plus' }), null) + gate(() => listPage({
      id: 'hist', rows, ph: '搜索会话标题或内容', searchKeys: ['t'], filters: [{ k: 'when', label: '时间', opts: [['d', '今天'], ['w', '最近 7 天'], ['o', '更早']], fn: (x, v) => v === 'd' ? x.age < 1440 : v === 'w' ? x.age >= 1440 && x.age < 10080 : x.age >= 10080 }, { k: 'st', label: '状态', opts: [['ok', '正常'], ['failed', '含失败']] }],
      cols: [{ t: '会话', w: 'minmax(0,3fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('msg') + '</span><div class="cname"><span class="nm">' + esc(x.t) + '</span></div></div>' }, { t: '消息', w: '70px', f: x => '<span class="mono2">' + x.n + ' 条</span>' }, { t: '状态', w: '110px', hm: 1, f: x => x.shared ? pill('已分享', 'acc') : x.st === 'failed' ? pill('含失败', 'bad') : '<span class="muted">—</span>' }, { t: '最后更新', w: '110px', f: x => '<span class="muted">' + ago(x.age) + '</span>', sk: 'age' }],
      onRow: 'openses', menu: x => [{ i: 'msg', t: '继续对话', act: 'openses', a: x.id }, { i: 'share', t: x.shared ? '管理分享' : '分享' }, '-', { i: 'trash', t: '删除', bad: 1, act: 'confirm', a: JSON.stringify({ tone: 'danger', ic: 'trash', title: '删除这个会话？', desc: '会话「' + x.t.slice(0, 18) + '」及其所有消息将被永久删除。已生成的分享链接会同时失效。', ok: '删除', then: '会话已删除', undo: 1 }) }],
      bulk: [{ i: 'trash', t: '删除', bad: 1 }], empty: { ic: 'clock', t: '还没有历史会话', d: '你和助手的对话会出现在这里，方便回看和继续。', btns: btn('开始第一次对话', 'newchat', null, { k: 'btn-pri' }) },
    }), 'list') + '</div></div>';
  },
});
ACT.openses = a => { S.ui.ses = a; go('chat'); };

/* ═════ 我的分享 ═════ */
page({
  id: 'myshares', grp: '用户端 · 对话', title: '我的分享', layout: 'user',
  notes: ['**失效原因可见**：已撤销 / 助手已删除 / 管理员下架 分别标注，不让用户猜“链接为什么打不开”。', '**访问方式与上榜状态分开显示**：访问方式 = 公开可见 / 租户内可见（跟随助手权限）（由助手 / 全局设置决定，指定成员或组可见的助手跟随助手权限）；上榜状态 = 未上榜（仅链接）/ 已上榜（出现在助手的公开问答列表）。', '**一键复制链接**常驻；批量取消分享用于清理。'],
  render() {
    const r = rng(8), n = cnt({ few: 3, normal: 16, many: 180 });
    const titles = ['GitLab 同步 401 排查', 'Q3 预算复盘摘要', '合同风险点汇总', 'Celery worker 丢任务根因', 'MCP 校验失败处理', '上线检查清单'];
    const rows = Array.from({ length: n }, (_, i) => { const st = i === 1 ? 'removed' : i === 4 ? 'revoked' : 'live'; return { id: 'q' + i, t: titles[i % titles.length] + (i > 5 ? ' #' + i : ''), a: pick(r, ['产品文档助手', '运维助手', '合同审阅']), mode: r() > .4 ? 'public' : 'login', lst: r() > .5 ? 'listed' : 'linkonly', views: int(r, 0, 480), age: int(r, 30, 20000), st }; });
    return H.userTop('我的分享', '', 'chat') + '<div class="scroll"><div class="body">' + phead('我的分享', '你分享出去的问答，可随时撤销', null, rows.length || null) + gate(() => listPage({
      id: 'shares', rows, ph: '搜索分享标题', searchKeys: ['t', 'a'], segs: [['live', '有效', rows.filter(x => x.st === 'live').length], ['revoked', '已撤销'], ['removed', '已失效']], segKey: 'st', filters: [{ k: 'mode', label: '访问方式', opts: [['public', '公开可见'], ['login', '租户内可见']] }, { k: 'lst', label: '上榜状态', opts: [['linkonly', '未上榜'], ['listed', '已上榜']] }],
      cols: [{ t: '标题', w: 'minmax(0,3fr)', f: x => '<div class="cmain"><span class="thumb">' + ic('share') + '</span><div class="cname"><span class="nm">' + esc(x.t) + '</span><span class="slug">' + esc(x.a) + '</span></div></div>' }, { t: '访问方式', w: '100px', hm: 1, f: x => pill(x.mode === 'public' ? '公开可见' : '租户内可见', x.mode === 'public' ? 'ok' : '') }, { t: '上榜', w: '90px', f: x => x.lst === 'listed' ? pill('已上榜', 'ok') : pill('未上榜', '') }, { t: '状态', w: '120px', f: x => x.st === 'live' ? stt('有效', 'ok') : x.st === 'revoked' ? stt('已撤销', '') : stt('助手已删除', 'bad') }, { t: '浏览', w: '70px', hm: 1, f: x => '<span class="mono2">' + x.views + '</span>' }, { t: '创建', w: '100px', f: x => '<span class="muted">' + ago(x.age) + '</span>' }],
      menu: x => [{ i: 'copy', t: '复制链接', act: 'toast', a: 'ok|分享链接已复制', dis: x.st !== 'live' }, { i: 'ext', t: '打开预览', act: 'nav2', a: 'pubqa' }, '-', { i: 'ban', t: '取消分享', bad: 1, dis: x.st !== 'live', act: 'confirm', a: JSON.stringify({ tone: 'danger', ic: 'ban', title: '取消分享这条问答？', desc: '分享链接将立即失效，已打开的访客刷新后将无法查看。', ok: '取消分享', then: '已取消分享' }) }],
      bulk: [{ i: 'ban', t: '取消分享', bad: 1 }], onRow: 'nav2', empty: { ic: 'share', t: '你还没有分享过问答', d: '在对话中点击回答下方的分享按钮，即可生成可继续追问的链接。', btns: btn('去对话', 'newchat', null, { k: 'btn-pri' }) },
    }), 'list') + '</div></div>';
  },
});
ACT.nav2 = a => { go(a === 'pubqa' || a.startsWith('q') ? 'pubqa' : a); };

/* ═════ 公开问答列表 / 单条 ═════ */
page({
  id: 'publist', grp: '用户端 · 公开访问', title: '公开问答列表', layout: 'bare',
  scn: [['private', '需登录 · 租户内可见 / 指定成员'], ['empty', '该助手暂无分享'], ['denied', '登录但无权访问']],
  notes: ['**只列“已上榜”的问答**：管理员在“QA 榜单审核”通过上榜的，才会出现在这个助手的公开问答列表；是否需要登录由分享可见性设置决定（公开可见 / 租户内可见（跟随助手权限））。CTA 引导“向这个助手提问”。', '**需要登录时**显示明确的门禁而不是 404，登录后回跳。', '**移动端**卡片单列，搜索置顶。'],
  render() {
    const sc = scn(), an = 'SourceLens 产品文档助手';
    const head = '<header class="pubbar"><span class="bmark"></span><b style="font:700 14px var(--f)">' + an + '</b>' + pill('公开可见', 'ok') + '<span style="margin-left:auto;display:flex;gap:8px"><button class="btn btn-pri sm" data-nav="login">登录 / 提问</button></span></header>';
    if (sc === 'private') return head + '<div class="center-page"><div class="empty"><div class="empty-ic warn">' + ic('lock') + '</div><div class="empty-t">此助手仅对登录用户开放</div><div class="empty-d">登录后即可查看该助手分享的问答。</div><div class="empty-a"><button class="btn btn-pri" data-nav="login">登录后查看</button></div></div></div>';
    if (sc === 'denied') return head + '<div class="center-page">' + H.deniedPanel() + '</div>';
    const n = sc === 'empty' ? 0 : cnt({ few: 3, normal: 12, many: 96 }) || 12;
    const Q = ['GitLab 同步 401 怎么排查', 'MCP Server 校验失败', '知识库如何只同步指定分支', '节点离线后任务如何恢复', '怎么给 Token 配置正确的 scope', '分享链接可以设置有效期吗'];
    return head + '<div class="scroll"><div class="body" style="max-width:1100px"><div><h1 class="ptitle">公开问答</h1><p class="psub">管理员审核上榜的问答 · ' + n + ' 条</p></div>' + (n ? '<div class="toolbar" style="border:1px solid var(--line);border-radius:9px;background:var(--surface)"><label class="search" style="max-width:none">' + ic('search') + '<input placeholder="搜索问答"></label></div><div class="qa-grid">' + Array.from({ length: Math.min(n, 12) }, (_, i) => '<div class="panel qa-card" data-nav="pubqa"><div class="qa-q">' + esc(Q[i % Q.length]) + '</div><div class="qa-a">同步报 401 基本都是凭证问题：Token 已过期、scope 不足、或自建实例的 Base URL 未配置。建议先在连接管理里更新 Token……</div><div class="rf" style="display:flex;gap:8px;font:400 11px var(--m);color:var(--fg4)"><span>' + av('张伟', 'sm') + '</span><span>' + ago(120 * (i + 1)) + '</span><span>· ' + (i * 7 + 12) + ' 次浏览</span></div></div>').join('') + '</div>' + (n > 12 ? '<div class="tfoot" style="border:1px solid var(--line);border-radius:9px;background:var(--surface)"><span>共 <b>' + n + '</b> 条</span><nav class="pager"><span class="pg dis">' + ic('left') + '</span><span class="pg on">1</span><span class="pg">2</span><span class="pg">3</span><span class="pg">…</span><span class="pg">8</span><span class="pg">' + ic('right') + '</span></nav></div>' : '') : '<div class="panel">' + empty({ ic: 'msg', t: '这个助手还没有公开问答', d: '成员分享问答后会出现在这里。', btns: '<button class="btn btn-pri" data-nav="login">登录并提问</button>' }) + '</div>') + '</div></div>';
  },
});
page({
  id: 'pubqa', grp: '用户端 · 公开访问', title: '公开问答详情', layout: 'bare',
  scn: [['login', '需登录才能查看'], ['revoked', '链接已被撤销'], ['gone', '助手已删除'], ['err', '加载失败']],
  notes: ['**失效原因分级**：已撤销 / 助手已删除 / 需登录 / 加载失败，各自说明并给出下一步。', '**继续追问 CTA** 固定在底部（移动端为全宽按钮），让阅读者自然转化为使用者。', '**附件文件**列表可预览，大文件显示体积；预览禁用脚本。'],
  render() {
    const sc = scn(), head = '<header class="pubbar"><button class="ibtn" data-nav="publist" aria-label="返回">' + ic('back') + '</button><b style="font:700 14px var(--f)">SourceLens 产品文档助手</b>' + pill('公开可见', 'ok') + '<button class="btn btn-pri sm" style="margin-left:auto" data-nav="login">登录</button></header>';
    const M = { login: ['lock', 'warn', '这条分享需要登录后查看', '这条分享的可见范围是“租户内可见”（或跟随助手权限）。登录并拥有访问权限后即可查看。', '<button class="btn btn-pri" data-nav="login">登录后查看</button>'], revoked: ['ban', '', '分享链接已失效', '分享者已撤销这条分享。如需查看，请联系对方重新分享。', '<button class="btn btn-gh" data-nav="publist">浏览其他公开问答</button>'], gone: ['bot', '', '该助手已被删除', '这条分享所属的助手已不存在，内容无法再展示。', '<button class="btn btn-gh" data-nav="publist">返回</button>'], err: ['warn', 'bad', '加载失败', '暂时无法加载这条问答，请稍后重试。', '<button class="btn btn-pri" data-act="retry">重试</button>'] }[sc];
    if (M) return head + '<div class="center-page"><div class="empty"><div class="empty-ic ' + M[1] + '">' + ic(M[0]) + '</div><div class="empty-t">' + M[2] + '</div><div class="empty-d">' + M[3] + '</div><div class="empty-a">' + M[4] + '</div></div></div>';
    return head + '<div class="scroll"><div class="body" style="max-width:820px"><div><h1 class="ptitle">GitLab 知识库同步 401 排查</h1><p class="psub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' + av('张伟', 'sm') + '张伟 分享于 ' + ago(260) + ' · 浏览 128 次 ' + pill('公开可见', 'ok') + pill('已上榜', 'ok') + '</p></div><div class="msg me"><div class="bub">GitLab 知识库同步一直报 401，要怎么排查？</div></div><div class="msg ai"><div class="mav ai">' + ic('bot') + '</div><div style="flex:1;min-width:0"><div class="bub">' + ANS + '</div><button class="review ok" data-act="toast" data-a="info|证据覆盖完整">' + ic('okc') + '答案审核：有证据支持</button></div></div>' + dgrp('相关文件', '<div style="display:flex;flex-direction:column;gap:6px"><button class="fileline" data-act="drawer" data-a="preview|sync.log">' + ic('file') + 'sync.log<small>24.1 KB</small></button><button class="fileline" data-act="drawer" data-a="preview|凭证与权限.md">' + ic('file') + '凭证与权限.md<small>8.3 KB</small></button></div>') + '<div class="panel pad" style="flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap;position:sticky;bottom:12px;box-shadow:var(--sh-pop)"><div style="flex:1;min-width:200px"><b style="font:700 14px var(--f)">想继续追问？</b><div class="muted">登录后可以直接向这个助手提问，并保留完整对话。</div></div><button class="btn btn-pri" data-nav="login">登录并继续提问</button></div></div></div>';
  },
});

/* ═════ 设置弹窗 ═════ */
page({
  id: 'settings', grp: '用户端 · 对话', title: '设置（弹窗）', layout: 'user',
  enter() { S.ui.set = 'account'; H.openSettings(); },
  notes: ['**分区而非长页**：账号 / 修改密码 / 回答通知 / Agent 集成 / 更新日志，左侧导航，手机上变顶部横滑标签。', '**Agent 集成**：Access Key 默认脱敏、一键复制、重置前二次确认并说明影响。', '**更新日志**显示未读红点，进入后清除。'],
  render() { return '<div class="chat-top"><button class="ibtn hamb" data-act="nav">' + ic('menu') + '</button><div class="tt"><b>设置</b></div></div><div class="center-page"><div class="muted">设置弹窗已打开 · 点击关闭后返回</div></div>'; },
});
})();
