/* HyperCDR 原型 · 核心：共享状态（localStorage 同步）、数据种子、工具 */
(function () {
  const KEY = 'hcdr.proto.v7';
  const U = (m, d, h, mi, s) => Date.UTC(2026, m - 1, d, h, mi, s || 0);
  const NOW = U(11, 13, 6, 30, 0);
  const TZS = [{ label: 'UTC+08:00', o: 480 }, { label: 'UTC', o: 0 }, { label: 'UTC-05:00', o: -300 }];

  function seed(scene) {
    const E = scene === 'empty', offline = scene === 'normal' || scene === 'agentOffline', down = scene === 'storageDown';
    const healthy = scene === 'healthy';
    const db = { clock: NOW, seq: 20960, clusters: [], repos: [], policies: [], apps: [], tasks: [], points: [], tags: [], audit: [], members: [], invites: [], orgs: [], users: [] };
    db.members = [
      { id: 'u1', name: 'Zhang Wei', login: 'zhangwei', email: 'zhang.wei@acme.example', role: 'orgadmin', st: 'active', last: U(11, 13, 6, 2, 11) },
      { id: 'u2', name: 'Li Na', login: 'lina', email: 'li.na@acme.example', role: 'member', st: 'active', last: U(11, 13, 3, 20, 45) },
      { id: 'u3', name: 'Wang Qiang', login: 'wangqiang', email: '', role: 'member', st: 'active', last: U(11, 10, 1, 15, 2) },
      { id: 'u4', name: 'Zhao Min', login: 'zhaomin', email: 'zhao.min@acme.example', role: 'member', st: 'disabled', last: U(10, 2, 10, 40, 9) }];
    db.invites = [{ id: 'i1', email: 'chen.yu@acme.example', role: 'member', st: 'pending', exp: U(11, 15, 3, 21, 0) }];
    db.orgs = [
      { id: 'o1', name: 'Acme', desc: 'Primary production organization', st: 'active', members: 4, clusters: 4, apps: 19, sys: true },
      { id: 'o2', name: 'Globex Retail', desc: '', st: 'active', members: 7, clusters: 2, apps: 9, sys: false },
      { id: 'o3', name: 'Initech Lab', desc: 'Trial', st: 'disabled', members: 2, clusters: 0, apps: 0, sys: false }];
    db.users = db.members.map((m) => Object.assign({ org: 'Acme' }, m)).concat([{ id: 'u9', name: 'Platform Admin', login: 'admin', email: 'admin@hypercdr.io', role: 'platform', st: 'active', org: '—', last: U(11, 13, 5, 0, 0) }]);
    if (E) return db;
    db.clusters = [
      { id: 'prod-shanghai-01', role: 'source', st: 'online', ns: 24, nodes: 6, ver: 'v1.29.4', agent: 'v2.4.1', region: 'cn-shanghai', def: true },
      { id: 'prod-beijing-02', role: 'source', st: 'online', ns: 11, nodes: 4, ver: 'v1.28.9', agent: 'v2.3.9', region: 'cn-beijing' },
      { id: 'dr-hangzhou-02', role: 'target', st: 'online', ns: 31, nodes: 6, ver: 'v1.29.4', agent: 'v2.4.1', region: 'cn-hangzhou' },
      { id: 'dr-shenzhen-03', role: 'target', st: offline ? 'offline' : 'online', ns: 12, nodes: 3, ver: 'v1.28.9', agent: 'v2.4.1', region: 'cn-shenzhen' }];
    db.repos = [
      { id: 's3-prod-oss', type: 'S3 · oss-cn-shanghai', used: 98.2, cap: 120, st: 'online', pts: 118 },
      { id: 's3-archive-oss', type: 'S3 · oss-cn-hangzhou', used: 28.2, cap: 59.2, st: down ? 'unreachable' : 'online', pts: 30 }];
    db.policies = [
      { id: 'daily-0200-30d', sched: 'Every day at 02:00', keep: '30 copies', bound: 5 },
      { id: 'hourly-6h-7d', sched: 'Every 6 hours', keep: '7 copies', bound: 4 },
      { id: 'weekly-sun-90d', sched: 'Every Sunday at 03:00', keep: '90 copies', bound: 2 },
      { id: 'manual-only', sched: 'Manual trigger', keep: 'Platform default retention', bound: 0 }];
    db.tags = [{ id: 'tier-1', color: 'red' }, { id: 'tier-2', color: 'amber' }, { id: 'stateless', color: 'gray' }];
    const P = (n, tier, c, scope, pol, repo, extra) => Object.assign({ n, tier, c, scope, plan: { policy: pol, repo, target: 'dr-hangzhou-02' }, sync: 'ok', syncAt: U(11, 13, 6, 22, 0), rec: '' }, extra || {});
    db.apps = [
      P('payments', 'tier-1', 'prod-shanghai-01', 'Entire namespace', 'daily-0200-30d', 's3-prod-oss'),
      P('ledger', 'tier-1', 'prod-shanghai-01', 'Entire namespace', 'daily-0200-30d', 's3-prod-oss', { sync: 'running', prog: 62 }),
      P('orders', 'tier-1', 'prod-shanghai-01', 'Label selector', 'hourly-6h-7d', 's3-prod-oss', { syncAt: U(11, 13, 6, 5, 0), rec: 'drilled' }),
      P('identity', 'tier-2', 'prod-shanghai-01', 'Entire namespace', 'weekly-sun-90d', 's3-archive-oss', { sync: healthy ? 'ok' : 'rpo', syncAt: U(11, 4, 6, 0, 0) }),
      P('analytics', '', 'prod-beijing-02', 'Stateless', 'daily-0200-30d', 's3-archive-oss', { sync: healthy ? 'ok' : 'failed', err: 'E4103', syncAt: U(11, 13, 5, 58, 0) }),
      P('search-index', '', 'prod-shanghai-01', 'Entire namespace', 'hourly-6h-7d', 's3-prod-oss', { rec: 'takeover' }),
      P('notifications', '', 'prod-shanghai-01', 'Entire namespace', 'daily-0200-30d', 's3-prod-oss', { syncAt: U(11, 13, 5, 22, 0) }),
      P('cart', 'tier-2', 'prod-beijing-02', 'Label selector', 'hourly-6h-7d', 's3-prod-oss', { syncAt: U(11, 13, 6, 5, 0) }),
      { n: 'gateway', tier: '', c: 'prod-shanghai-01', scope: '', plan: null, picked: false },
      { n: 'cache', tier: '', c: 'prod-shanghai-01', scope: '', plan: null, picked: false },
      { n: 'tracing', tier: '', c: 'prod-beijing-02', scope: '', plan: null, picked: false },
      { n: 'checkout', tier: 'tier-1', c: 'prod-shanghai-01', scope: '', plan: null, picked: true },
      { n: 'inventory', tier: 'tier-2', c: 'prod-beijing-02', scope: '', plan: null, picked: true }];
    db.tasks = [
      { id: 'T-20958', type: 'drill', app: 'orders', st: 'running', t: U(11, 13, 6, 31, 0), c: 'prod-shanghai-01', by: 'Li Na', prog: 40 },
      { id: 'T-20957', type: 'sync', app: 'payments', st: 'ok', t: U(11, 13, 6, 22, 0), c: 'prod-shanghai-01', by: 'Schedule', size: '4.2 GiB', dur: '3m 11s' },
      { id: 'T-20955', type: 'sync', app: 'analytics', st: healthy ? 'ok' : 'failed', t: U(11, 13, 5, 58, 0), c: 'prod-beijing-02', by: 'Schedule', err: healthy ? '' : 'E4103 · snapshot timeout on PVC analytics/data-0' },
      { id: 'T-20950', type: 'takeover', app: 'search-index', st: 'ok', t: U(11, 13, 3, 4, 0), c: 'prod-shanghai-01', by: 'Zhang Wei' },
      { id: 'T-20941', type: 'drill', app: 'orders', st: 'ok', t: U(11, 12, 18, 14, 0), c: 'prod-shanghai-01', by: 'Li Na' }];
    db.points = [
      { id: 'rp1', t: U(11, 13, 6, 22, 0), app: 'payments', size: '4.2 GiB', repo: 's3-prod-oss', c: 'prod-shanghai-01' },
      { id: 'rp2', t: U(11, 13, 6, 5, 0), app: 'orders', size: '38 GiB', repo: 's3-prod-oss', c: 'prod-shanghai-01' },
      { id: 'rp3', t: U(11, 13, 6, 5, 0), app: 'cart', size: '1.1 GiB', repo: 's3-prod-oss', c: 'prod-beijing-02' },
      { id: 'rp4', t: U(11, 12, 18, 0, 0), app: 'payments', size: '4.1 GiB', repo: 's3-prod-oss', c: 'prod-shanghai-01' },
      { id: 'rp5', t: U(11, 4, 6, 0, 0), app: 'identity', size: '12 GiB', repo: 's3-archive-oss', c: 'prod-shanghai-01' }];
    db.audit = [
      { t: U(11, 13, 6, 31, 0), who: 'Li Na', what: 'Started drill T-20958 for orders' },
      { t: U(11, 13, 3, 21, 0), who: 'Zhang Wei', what: 'Invited chen.yu@acme.example as Member' },
      { t: U(11, 13, 3, 4, 0), who: 'Zhang Wei', what: 'Took over search-index on dr-hangzhou-02' },
      { t: U(11, 12, 8, 2, 0), who: 'Zhang Wei', what: 'Registered cluster dr-shenzhen-03' }];
    return db;
  }

  const defaults = () => ({ v: 7, scene: 'normal', screen: 'landing', auth: 'login', authErr: '', theme: 'light', variant: 'A', lang: 'zh', role: 'orgadmin', tzI: 0, nav: 'dashboard', sub: 'applications', stage: 3, drawer: null, sel: [], tab: {}, db: seed('normal') });
  let S;
  try { const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : null; if (!S || S.v !== 7) S = defaults(); } catch (e) { S = defaults(); }
  const subs = [];
  const H = window.H = {
    seed, defaults, TZS, NOW,
    get: () => S,
    set(p, opt) { Object.assign(S, p); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} subs.forEach((f) => f(S, opt)); },
    mut(fn, p) { fn(S.db); H.set(Object.assign({ db: S.db }, p || {})); },
    sub(f) { subs.push(f); },
    reset(scene) { const d = defaults(); d.scene = scene || S.scene; d.db = seed(d.scene); d.theme = S.theme; d.variant = S.variant; d.lang = S.lang; d.role = S.role; d.screen = S.screen; d.tzI = S.tzI; H.set(d); },
    T: (en, zh) => (S.lang === 'zh' ? zh : en),
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    tz: () => TZS[S.tzI % 3],
    fmt: (ms) => ms ? new Date(ms + TZS[S.tzI % 3].o * 60000).toISOString().slice(0, 19).replace('T', ' ') : '—',
    hm: (ms) => H.fmt(ms).slice(11, 16),
    ago: (ms) => { const d = Math.max(0, Math.round((S.db.clock - ms) / 60000)); return d < 60 ? d + 'm' : d < 1440 ? Math.round(d / 60) + 'h' : Math.round(d / 1440) + 'd'; },
    nextId: () => 'T-' + (S.db.seq++)
  };
  window.addEventListener('storage', (e) => { if (e.key === KEY && e.newValue) { try { S = JSON.parse(e.newValue); subs.forEach((f) => f(S, { remote: true })); } catch (x) {} } });
})();
