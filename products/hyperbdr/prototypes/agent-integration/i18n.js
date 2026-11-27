(() => {
  const KEY = 'hyperbdr-agent-language';
  let language = 'en';
  try { if (['zh','en'].includes(localStorage.getItem(KEY))) language = localStorage.getItem(KEY); } catch {}
  window.AgentI18n = {
    get language(){ return language; },
    t(key, params={}) { const resolve = source => key.split('.').reduce((value, part) => value?.[part], source); let value = resolve(window.AGENT_MESSAGES[language]) ?? resolve(window.AGENT_MESSAGES.en) ?? key; if (typeof value === 'function') return value(...Object.values(params)); return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`); },
    set(next) { if (!['zh','en'].includes(next)) return; language = next; try { localStorage.setItem(KEY, next); } catch {} window.renderAgentLanguage?.(); },
    toggle() { this.set(language === 'zh' ? 'en' : 'zh'); }
  };
})();
