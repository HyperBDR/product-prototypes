/* ui1：图标 / 组件 / 派生状态 / 任务引擎 */
(function () {
  const U = window.UI = {};
  const T = (en, zh) => H.T(en, zh), E = H.esc;
  const P = {
    dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z', dr: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM6.08 10.37l-3.48 1.59a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.48-1.59M6.08 15.37l-3.48 1.59a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.48-1.59',
    ops: 'M3 12h4l3-8 4 16 3-8h4', settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    server: 'M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM6 6h.01M6 18h.01', db: 'M3 5a9 3 0 1 0 18 0 9 3 0 1 0-18 0M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0',
    shield: 'M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z', clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    building: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4', check: 'M20 6 9 17l-5-5', x: 'M18 6 6 18M6 6l12 12', chev: 'm9 18 6-6-6-6', chevd: 'm6 9 6 6 6-6', chevl: 'm15 18-6-6 6-6', plus: 'M12 5v14M5 12h14', refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5', search: 'M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14',
    filter: 'M22 3H2l8 9.5V19l4 2v-8.5z', play: 'M6 4l14 8-14 8z', swap: 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3', alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01', mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6', key: 'M21 2l-2 2M11.4 11.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zM15.5 7.5l3 3L22 7l-3-3', globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0', logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9', sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 2v2M12 20v2M2 12h2M20 12h2', moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z', box: 'M12 2.6 20.5 7v10L12 21.4 3.5 17V7zM8.6 12.1h6.8M12.7 9.4l2.7 2.7-2.7 2.7',
    tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01', trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6', terminal: 'M4 17l6-6-6-6M12 19h8', download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3', upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12', lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3', cpu: 'M9 9h6v6H9zM4 4h16v16H4zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3'
  };
  U.ic = (n, c) => `<svg class="i ${c || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || ''}"/></svg>`;
  U.chip = (tone, text, nodot) => `<span class="chip c-${tone}${nodot ? ' nodot' : ''}">${E(text)}</span>`;
  U.btn = (act, label, o) => { o = o || {}; const d = Object.entries(o.d || {}).map(([k, v]) => ` data-${k}="${E(v)}"`).join(''); return `<button class="btn ${o.cls || ''}" data-act="${act}"${d}${o.dis ? ' disabled' : ''}${o.title ? ` title="${E(o.title)}"` : ''}>${o.icon ? U.ic(o.icon, 's') : ''}${label}</button>`; };
  U.cb = (on, act, d) => `<button class="cb ${on ? 'on' : ''}" data-act="${act}" data-id="${E(d)}" aria-label="select" aria-pressed="${!!on}">${on ? U.ic('check', 's') : ''}</button>`;
  U.field = (name, label, o) => { o = o || {}; const v = (U.F[name] != null ? U.F[name] : o.v) || ''; return `<label class="field">${label}<input class="inp ${o.cls || ''}" name="${name}" type="${o.type || 'text'}" value="${E(v)}" placeholder="${E(o.ph || '')}" autocomplete="${o.ac || 'off'}">${o.hint ? `<small>${o.hint}</small>` : ''}</label>`; };
  U.F = {};
  U.opt = (on, act, id, inner, o) => `<button class="opt ${on ? 'on' : ''} ${o && o.radio ? 'radio' : ''}" data-act="${act}" data-id="${E(id)}"${o && o.dis ? ' disabled' : ''}><span class="box">${on ? '✓' : ''}</span><span class="grow">${inner}</span></button>`;
  U.fact = (rows) => `<dl class="fact">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  U.mono = (s) => `<span class="data">${E(s)}</span>`;

  // 角色
  U.role = () => H.get().role;
  U.isAdmin = () => ['orgadmin', 'platform'].includes(H.get().role);
  U.isPlatform = () => H.get().role === 'platform';
  U.roleName = (r) => ({ platform: T('Platform administrator', '平台管理员'), orgadmin: T('Organization administrator', '组织管理员'), member: T('Member', '成员') }[r]);
  U.who = () => ({ platform: 'Platform Admin', orgadmin: 'Zhang Wei', member: 'Li Na' }[H.get().role]);

  // 状态文案
  U.TT = { sync: ['Sync', '同步'], drill: ['Drill', '演练'], takeover: ['Takeover', '接管'], restore: ['Restore', '还原'], backup: ['Backup', '备份'] };
  U.tt = (t) => T(U.TT[t][0], U.TT[t][1]);
  U.TS = { ok: ['Succeeded', '成功', 'ok'], running: ['Running', '运行中', 'info'], failed: ['Failed', '失败', 'crit'], waiting: ['Waiting for cluster', '等待集群', 'warn'], cancelled: ['Cancelled', '已取消', 'neutral'] };
  U.tstat = (t) => { const k = t.stalled && t.st === 'running' ? 'waiting' : t.st; return U.chip(U.TS[k][2], T(U.TS[k][0], U.TS[k][1])); };

  // 派生：应用阶段 / 状态
  U.derive = (db) => db.apps.map((a) => {
    const cl = db.clusters.find((c) => c.id === a.c), rp = a.plan && db.repos.find((r) => r.id === a.plan.repo), tg = a.plan && db.clusters.find((c) => c.id === a.plan.target);
    const stage = a.plan ? 3 : a.picked ? 2 : 1;
    let tone = 'neutral', label = T('Not started', '未开始'), pct = 0;
    if (stage === 2) { tone = 'warn'; label = T('Pending setup', '待配置'); }
    if (stage === 3) {
      if (cl && cl.st === 'offline') { tone = 'crit'; label = T('Offline', '离线'); }
      else if (rp && rp.st === 'unreachable') { tone = 'crit'; label = T('Storage unreachable', '存储不可达'); }
      else if (a.sync === 'failed') { tone = 'crit'; label = T('Failed', '失败') + ' · ' + (a.err || ''); }
      else if (a.sync === 'rpo') { tone = 'warn'; label = T('RPO at risk', 'RPO 风险'); }
      else if (a.sync === 'none') { tone = 'neutral'; label = T('Awaiting first sync', '待首次同步'); }
      else if (a.sync === 'running') { tone = 'info'; label = T('Running', '运行中') + ' ' + (a.prog || 0) + '%'; pct = a.prog || 0; }
      else { tone = 'ok'; label = T('Succeeded', '成功'); }
    }
    return Object.assign({}, a, { stage, tone, label, pct, blocked: tone === 'crit', cluster: cl, targetCl: tg });
  });
  U.recLabel = (r) => r === 'drilled' ? U.chip('ok', T('Drilled', '已演练')) : r === 'takeover' ? U.chip('warn', T('Taken over', '已接管')) : '<span class="t3">—</span>';

  // 任务引擎
  U.mkTask = (db, type, app, extra) => { const a = db.apps.find((x) => x.n === app) || {}; const id = H.nextId(); db.clock += 180000; db.tasks.unshift(Object.assign({ id, type, app, st: 'running', t: db.clock, c: a.c || '', by: U.who(), prog: 0 }, extra || {})); return id; };
  U.log = (db, what) => { db.clock += 60000; db.audit.unshift({ t: db.clock, who: U.who(), what }); };
  U.finish = (db, t, ok, err) => {
    db.clock += 120000; const a = db.apps.find((x) => x.n === t.app);
    if (!ok) { t.st = 'failed'; t.err = err || 'E4103 · snapshot timeout'; if (a && t.type === 'sync') { a.sync = 'failed'; a.err = 'E4103'; } return; }
    t.st = 'ok'; t.prog = 100;
    if (!a) return;
    if (t.type === 'sync') { a.sync = 'ok'; a.err = ''; a.syncAt = db.clock; a.prog = 100; db.points.unshift({ id: 'rp' + db.clock, t: db.clock, app: a.n, size: '4.2 GiB', repo: a.plan ? a.plan.repo : '', c: a.c }); }
    if (t.type === 'drill') a.rec = 'drilled'; if (t.type === 'takeover') a.rec = 'takeover';
  };
  U.tick = () => {
    const S = H.get(); if (S.screen !== 'app' || !S.db.tasks.some((t) => t.st === 'running')) return;
    const out = [];
    H.mut((db) => db.tasks.forEach((t) => {
      if (t.st !== 'running') return;
      const cl = db.clusters.find((c) => c.id === t.c); if (cl && cl.st === 'offline') { t.stalled = true; return; } t.stalled = false;
      const a = db.apps.find((x) => x.n === t.app), rp = a && a.plan && db.repos.find((r) => r.id === a.plan.repo);
      if (t.type === 'sync' && rp && rp.st === 'unreachable') { U.finish(db, t, false, 'E5002 · object storage unreachable'); out.push(t.id + ' ' + T('failed', '失败')); return; }
      t.prog = Math.min(100, (t.prog || 0) + 20); if (t.type === 'sync' && a) { a.sync = 'running'; a.prog = t.prog; }
      if (t.prog >= 100) { U.finish(db, t, true); out.push(t.id + ' ' + T('succeeded', '成功')); }
    }));
    if (out.length) U.toast(out.join(' · '));
  };
  U.toast = (m) => { U.toastMsg = m; clearTimeout(U._tt); U._tt = setTimeout(() => { U.toastMsg = ''; window.__render && window.__render(); }, 3000); window.__render && window.__render(); };
})();
