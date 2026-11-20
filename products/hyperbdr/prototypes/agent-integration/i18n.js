(() => {
  const KEY = 'hyperbdr-agent-language';
  let language = 'zh';
  try { if (['zh','en'].includes(localStorage.getItem(KEY))) language = localStorage.getItem(KEY); } catch {}
  window.AgentI18n = {
    get language(){ return language; },
    t(key, params={}) { let value = window.AGENT_MESSAGES[language]?.[key] ?? window.AGENT_MESSAGES.zh[key] ?? key; if (typeof value === 'function') return value(...Object.values(params)); return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`); },
    set(next) { if (!['zh','en'].includes(next)) return; language = next; try { localStorage.setItem(KEY, next); } catch {} window.renderAgentLanguage?.(); },
    toggle() { this.set(language === 'zh' ? 'en' : 'zh'); }
  };
})();
