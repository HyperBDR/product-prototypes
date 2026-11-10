/* Roles, zones and shell: 工作台 / 租户管理 / 平台控制台 */
(function () {
  const W = window, H = W.H, S = W.S, ic = H.ic, esc = H.esc, C = H.core, ACT = W.ACT, PMAP = W.PMAP;

  const ROLES = [['member', '普通用户'], ['tadmin', '租户管理员'], ['super', '超级管理员']];
  const ROLE_NAME = { member: '普通用户', tadmin: '租户管理员', super: '超级管理员' };
  const TENANTS = [
    ['平台租户', '内置 · 超级管理员所在'],
    ['Acme 科技', '成员 128 · 助手 12'],
    ['星河教育', '成员 342 · 助手 31'],
    ['云帆医疗', '成员 57 · 额度告急'],
    ['北辰能源', '待激活 · 尚未登录'],
    ['远航物流', '已停用'],
  ];
  const ZONE_INFO = { work: ['msg', '对话', '对话'], tenant: ['layers', '管理', '租户管理'], platform: ['shield', '平台', '平台控制台'] };

  const TENANT_NAV = [
    ['概览', [['overview', 'spark', '管理概览'], ['setup', 'bolt', '配置向导']]],
    ['助手(Assistant)管理', [['assistants', 'bot', '助手'], ['runs', 'activity', '问答历史'], ['eval', 'flask', '助手评估'], ['shares', 'share', 'QA 榜单审核'], ['envvars', 'key', '环境变量']]],
    ['知识库管理', [['datasources', 'db', '知识库']]],
    ['插件管理', [['hub', 'spark', '能力市场'], ['connectors', 'key', '连接']]],
    ['租户管理', [['tenantinfo', 'layers', '租户信息'], ['users', 'users', '成员管理'], ['groups', 'layers', '组管理'], ['apikeys', 'key', 'API Key']]],
    ['大模型管理', [['llm-stats', 'chart', '使用统计'], ['llm-usage', 'list', '使用明细'], ['llm-config', 'key', '模型配置']]],
    ['通知管理', [['n-channels', 'send', '通知渠道'], ['a-rules', 'bell', '事件订阅'], ['a-events', 'list', '通知记录']]],
  ];
  const PLATFORM_NAV = [
    ['', [['p-overview', 'spark', '全局概览']]],
    ['租户管理', [['tenants', 'layers', '租户与代管'], ['p-tstats', 'chart', '租户统计'], ['p-members', 'users', '成员总览'], ['p-apikeys', 'key', 'API Key 总览']]],
    ['节点管理', [['shared-nodes', 'shield', '节点'], ['nodeset', 'sliders', '节点设置']]],
    ['官方目录', [['catalog-skill', 'spark', '技能'], ['catalog-mcp', 'plug', 'MCP Servers'], ['catalog-conn', 'key', '连接器']]],
    ['大模型管理', [['llm-stats', 'chart', '使用统计'], ['llm-config', 'key', '平台模型配置'], ['llm-data', 'archive', '历史记录清理设置']]],
    ['告警与通知设置', [['n-channels', 'send', '通知渠道'], ['a-rules', 'bell', '事件订阅'], ['a-events', 'list', '通知记录']]],
    ['任务管理', [['task-stats', 'chart', '任务统计'], ['tasks', 'list', '任务列表'], ['task-set', 'sliders', '任务设置']]],
    ['审计与配置', [['p-audit', 'list', '审计日志'], ['lenset', 'cpu', '全局配置']]],
  ];
  const BOTH = ['llm-stats', 'llm-config', 'a-rules', 'a-events', 'n-channels'];
  const PLATFORM_HIDDEN = ['n-stats', 'n-records', 'n-set', 'a-msgs'];
  const PLATFORM = PLATFORM_NAV.reduce((a, g) => a.concat(g[1].map(i => i[0])), []).filter(id => BOTH.indexOf(id) < 0).concat(PLATFORM_HIDDEN);
  const PROXY_HIDDEN = ['users', 'groups'];
  const proxy = () => S.role === 'super' && S.tenant !== 0;
  const PARENT = { skills: 'hub', mcp: 'hub', 'eval-ds': 'eval', 'eval-report': 'eval', 'n-stats': 'n-channels', 'n-records': 'n-channels', 'n-set': 'n-channels', 'a-msgs': 'a-rules' };

  const zonesFor = role => role === 'super' ? (proxy() ? ['tenant', 'platform'] : ['platform']) : role === 'member' ? ['work'] : ['work', 'tenant'];
  function zoneOf(id) {
    const d = PMAP[id]; if (!d) return 'work';
    if (d.layout === 'bare') return 'bare';
    if (d.layout === 'admin') { if (BOTH.indexOf(id) >= 0) return S.ctx === 'platform' && S.role === 'super' ? 'platform' : 'tenant'; return PLATFORM.indexOf(id) >= 0 ? 'platform' : 'tenant'; }
    return 'work';
  }
  function can(id, role) {
    const z = zoneOf(id);
    if (z === 'bare') return true;
    if (z === 'work') return role !== 'super';
    if (z === 'platform') return role === 'super';
    if (role === 'super') return z === 'tenant' && proxy() && PROXY_HIDDEN.indexOf(id) < 0;
    return role === 'tadmin' && z === 'tenant' || z === 'work';
  }
  const navFor = zone => zone === 'platform' ? PLATFORM_NAV : proxy() ? TENANT_NAV.map(g => [g[0], g[1].filter(i => PROXY_HIDDEN.indexOf(i[0]) < 0)]).filter(g => g[1].length) : TENANT_NAV;
  const groupOf = id => { const p = PARENT[id] || id, all = (zoneOf(p) === 'platform' ? PLATFORM_NAV : TENANT_NAV); const g = all.find(x => x[1].some(i => i[0] === p)); return g ? g[0] : ''; };
  const tname = () => TENANTS[S.tenant] ? TENANTS[S.tenant][0] : TENANTS[1][0];

  PAGES_RELABEL();
  function PAGES_RELABEL() {
    W.PAGES.forEach(p => {
      const z = zoneOf(p.id);
      if (z === 'tenant') p.grp = '管理 · ' + (groupOf(p.id) || '其他');
      else if (z === 'platform') p.grp = '平台 · ' + groupOf(p.id);
    });
  }

  function zlist(zone) {
    const zs = zonesFor(S.role).filter(z => z !== zone); if (!zs.length) return '';
    return '<div class="zlist">' + zs.map(z => '<button class="zi" data-act="zone" data-a="' + z + '">' + ic(ZONE_INFO[z][0]) + (z === 'work' ? '返回对话' : ZONE_INFO[z][2]) + '</button>').join('') + '</div>';
  }
  function promo(zone) {
    if (zone !== 'work') return '';
    return '<button class="promo" data-act="toast" data-a="info|新手指引（演示）"><b>' + ic('spark') + '新手指引</b><small>了解 <b>@ 引用</b> 与 <b>深度思考</b> 的用法</small></button>';
  }
  function tchip() { return ''; }
  function decorate(nav, zone) {
    const sub = zone === 'platform' ? '平台控制台' : zone === 'tenant' ? '租户管理' : 'v0.63.8';
    nav = nav.replace(/<div class="nav-brand">[\s\S]*?<\/div>/, '<div class="nav-title"><b>SourceLens</b><small>' + sub + '</small></div><button class="nav-search" data-act="toast" data-a="info|搜索（演示）">' + ic('search') + '<span>' + (zone === 'work' ? '搜索会话' : '搜索菜单') + '</span><kbd>/</kbd></button>');
    nav = nav.replace('<div class="nav-foot">', '<div class="nav-foot">' + promo(zone));
    return nav.replace('<div class="nav-scroll">', tchip(zone) + '<div class="nav-scroll">');
  }

  S.navTog = S.navTog || {};
  ACT.navgrp = a => { const now = S.navTog[a] !== undefined ? S.navTog[a] : true; S.navTog[a] = !now; };
  function groupNav(zone) {
    const cur = PARENT[S.page] || S.page, plat = zone === 'platform';
    const offline = H.cnt({ few: 1, normal: 3, many: 17 });
    const body = navFor(zone).map(g => {
      const k = zone + ':' + g[0], open = S.navTog[k] !== undefined ? S.navTog[k] : true;
      return (g[0] ? '<button class="nav-sec nav-grp" aria-expanded="' + open + '" data-act="navgrp" data-a="' + esc(k) + '" data-keep>' + g[0] + '<span class="chv' + (open ? ' o' : '') + '">' + ic('down') + '</span></button>' : '') +
        (open || !g[0] ? g[1].map(i => '<button class="nav-i' + (cur === i[0] ? ' on' : '') + '" data-act="navto" data-a="' + zone + '|' + i[0] + '">' + ic(i[1]) + i[2] + (i[0] === 'nodes' && offline ? '<span class="tail hot">' + offline + '</span>' : '') + (i[0] === 'shares' && S.scale !== 'empty' ? '<span class="tail">' + H.cnt({ few: 1, normal: 6, many: 99 }) + '</span>' : '') + '</button>').join('') : '');
    }).join('');
    return '<aside class="nav" aria-label="' + (plat ? '平台控制台导航' : '租户管理导航') + '"><div class="nav-brand"><span class="bmark"></span><span class="bname">SourceLens</span>' + (plat ? '<span class="tagx">PLATFORM</span>' : '<span class="tagx t">ADMIN</span>') + '</div><div class="nav-scroll">' + body + '</div><div class="nav-foot">' + C.userCard('admin') + '</div></aside><div class="nav-scrim" data-act="nav"></div>';
  }

  function deniedRole(def) {
    if (proxy() && PROXY_HIDDEN.indexOf(def.id) >= 0) return '<div class="panel"><div class="empty"><div class="empty-ic warn">' + ic('lock') + '</div><div class="empty-t">代管模式下不可见：' + esc(def.title) + '</div><div class="empty-d">成员、用户组、角色与权限由租户自己控制。代管时你可以帮租户配置模型、节点、知识库、助手等，但看不到这些人员与权限信息。</div><div class="empty-a"><button class="btn btn-pri" data-nav="overview">返回管理概览</button></div></div></div>';
    if (S.role === 'super' && !proxy()) return '<div class="panel"><div class="empty"><div class="empty-ic warn">' + ic('shield') + '</div><div class="empty-t">超级管理员默认不直接管理租户内容</div><div class="empty-d">「' + esc(def.title) + '」属于租户内的资源。要帮某个租户配置，请到「租户与代管」点“进入租户”（代管，操作会被审计）；想自己建助手，请先新建一个租户再操作。</div><div class="empty-a"><button class="btn btn-pri" data-nav="tenants">去租户与代管</button></div></div></div>';
    const need = zoneOf(def.id) === 'platform' ? '超级管理员' : '租户管理员';
    return '<div class="panel"><div class="empty"><div class="empty-ic warn">' + ic('lock') + '</div><div class="empty-t">你的角色无权访问「' + esc(def.title) + '」</div><div class="empty-d">此页面需要<b>' + need + '</b>。当前角色：<b>' + ROLE_NAME[S.role] + '</b>' + (S.role !== 'super' ? '（' + esc(tname()) + '）' : '') + '。入口已对你隐藏，只有直接打开链接才会看到这里。<br><span class="muted">原型提示：可在顶部控制条的「角色」切换视角。</span></div><div class="empty-a"><button class="btn btn-pri" data-nav="chat">返回对话</button><button class="btn btn-gh" data-act="toast" data-a="info|已向租户管理员发送权限申请">申请权限</button></div></div></div>';
  }

  function enterBar() {
    if (!proxy()) return '';
    const t = TENANTS[S.tenant];
    return '<div class="enterbar" role="alert">' + ic('shield') + '<span><b>代管模式</b> · 你正以超级管理员身份代管租户「' + esc(t[0]) + '」，可帮它配置模型、节点、知识库、助手；成员与权限由租户自行管理。所有操作将被记录审计。</span><button data-act="tpick" data-a="0" data-ctxp="1">退出代管</button></div>';
  }

  function shell(def, inner, overlays) {
    let zone = zoneOf(def.id), body = inner;
    if (!can(def.id, S.role)) { zone = S.role === 'super' ? 'platform' : 'work'; body = '<div class="main">' + C.userTop(esc(def.title)) + '<div class="scroll"><div class="body">' + deniedRole(def) + '</div></div></div>'; }
    else if (zone === 'tenant' || zone === 'platform') body = '<div class="main">' + C.adminTop(def) + '<div class="scroll"><div class="body">' + inner + '</div></div></div>';
    else body = '<div class="main">' + inner + '</div>';
    const nav = zone === 'work' ? decorate(C.userNav(), zone) : zone === 'platform' ? decorate(groupNav('platform'), zone) : decorate(groupNav('tenant'), zone);
    const bar = zone === 'platform' ? '' : enterBar();
    const sh = '<div class="shell' + (zone === 'platform' ? ' pz' : '') + (zone === 'tenant' ? ' tz' : '') + (S.nav ? ' navopen' : '') + '">' + nav + body + overlays() + '</div>';
    return bar ? '<div class="vwrap">' + bar + sh + '</div>' : sh;
  }

  const DEF = { work: 'chat', tenant: 'overview', platform: 'p-overview' };
  ACT.zone = a => { S.userMenu = false; S.ctx = a === 'platform' ? 'platform' : 'tenant'; W.go(DEF[a]); return false; };
  ACT.navto = a => { const p = a.split('|'); S.ctx = p[0] === 'platform' ? 'platform' : 'tenant'; W.go(p[1]); return false; };
  ACT.proxy = a => { S.tenant = +a; S.ctx = 'tenant'; S.pop = null; W.go('overview'); return false; };
  ACT.tsw = () => { S.pop = C.prev().pop === 'tsw' ? null : 'tsw'; };
  ACT.tpick = a => { S.tenant = +a; S.pop = null; if (+a === 0) { S.ctx = 'platform'; W.go('tenants'); return false; } };

  W.ZONES = {
    ROLES, zoneOf, can, shell, tname: () => tname(),
    crumbRoot: () => zoneOf(S.page) === 'platform' ? '平台控制台' : '管理 · ' + tname(),
    crumbGroup: def => groupOf(def.id),
    userSub: () => ROLE_NAME[S.role] + ' · ' + tname(),
    menuZones: () => {
      const cur = zoneOf(S.page), zs = zonesFor(S.role).filter(z => z !== 'work' && z !== cur);
      return zs.map(z => '<button class="mi" data-act="zone" data-a="' + z + '">' + ic(ZONE_INFO[z][0]) + (z === 'tenant' ? '租户管理' : '平台控制台') + '</button>').join('') + (cur !== 'work' && S.role && S.role !== 'super' ? '<button class="mi" data-act="zone" data-a="work">' + ic('msg') + '返回对话</button>' : '');
    },
    setRole: v => { S.role = v; S.ctx = v === 'super' ? 'platform' : 'tenant'; S.tenant = v === 'super' ? 0 : 1; S.pop = null; S.nav = false; if (v === 'super' && !can(S.page, v)) { W.go('p-overview'); return; } C.refresh(); },
  };
})();
