(function initializePrototypeI18n() {
  const STORAGE_KEY = "hyperbdr-prototype-locale";
  const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title"];
  const textState = new WeakMap();
  const attributeState = new WeakMap();
  let catalog = null;
  let currentLocale = "en";
  let exactEntries = new Map();
  let patternEntries = [];

  function readSavedLocale() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveLocale(locale) {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      // Some browsers restrict storage for file:// pages. Switching still works for the current page.
    }
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function compilePattern(entry) {
    const source = entry["zh-CN"];
    const names = [];
    let cursor = 0;
    let expression = "^";

    for (const match of source.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)) {
      expression += escapeRegExp(source.slice(cursor, match.index));
      expression += "(.+?)";
      names.push(match[1]);
      cursor = match.index + match[0].length;
    }

    expression += escapeRegExp(source.slice(cursor)) + "$";
    return { ...entry, names, regex: new RegExp(expression) };
  }

  function translate(original, locale) {
    if (!original || locale === "zh-CN") return original;

    const exact = exactEntries.get(original);
    if (exact && exact[locale] && exact[locale] !== original) return exact[locale];

    for (const pattern of patternEntries) {
      const match = original.match(pattern.regex);
      if (!match) continue;

      const values = Object.fromEntries(pattern.names.map((name, index) => [name, match[index + 1]]));
      return (pattern[locale] || original).replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_, name) => values[name] ?? `{${name}}`);
    }

    return original;
  }

  function format(patternId, values = {}, locale = currentLocale) {
    const entry = catalog?.patterns?.[patternId];
    if (!entry) return "";
    const template = entry[locale] || entry[catalog.defaultLocale] || "";
    return template.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_, name) => values[name] ?? `{${name}}`);
  }

  function shouldIgnore(node) {
    const parent = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !parent || Boolean(parent.closest("script, style, [data-i18n-ignore]"));
  }

  function renderTextNode(node) {
    if (shouldIgnore(node) || !node.data.trim()) return;

    let state = textState.get(node);
    if (!state || node.data !== state.rendered) {
      state = { original: node.data, rendered: node.data };
      textState.set(node, state);
    }

    const leading = state.original.match(/^\s*/)?.[0] || "";
    const trailing = state.original.match(/\s*$/)?.[0] || "";
    const originalText = state.original.slice(leading.length, state.original.length - trailing.length || undefined);
    const next = leading + translate(originalText, currentLocale) + trailing;
    state.rendered = next;
    if (node.data !== next) node.data = next;
  }

  function renderAttributes(element) {
    if (shouldIgnore(element)) return;

    let states = attributeState.get(element);
    if (!states) {
      states = new Map();
      attributeState.set(element, states);
    }

    for (const name of TRANSLATABLE_ATTRIBUTES) {
      if (!element.hasAttribute(name)) continue;
      const value = element.getAttribute(name);
      let state = states.get(name);
      if (!state || value !== state.rendered) {
        state = { original: value, rendered: value };
        states.set(name, state);
      }
      const next = translate(state.original, currentLocale);
      state.rendered = next;
      if (value !== next) element.setAttribute(name, next);
    }
  }

  function renderSubtree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      renderTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) renderAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) renderTextNode(node);
      else renderAttributes(node);
      node = walker.nextNode();
    }
  }

  function updateLanguageControl() {
    document.documentElement.lang = currentLocale;
    document.querySelectorAll("[data-locale]").forEach((button) => {
      const selected = button.dataset.locale === currentLocale;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function setLocale(locale, persist = true) {
    if (!catalog?.locales?.[locale]) return;
    currentLocale = locale;
    if (persist) saveLocale(locale);
    updateLanguageControl();
    renderSubtree(document.documentElement);
    window.dispatchEvent(new CustomEvent("prototype:locale-change", { detail: { locale } }));
  }

  function installLanguageControl() {
    document.querySelectorAll("[data-locale]").forEach((button) => {
      button.addEventListener("click", () => {
        setLocale(button.dataset.locale);
        button.closest(".language-switcher")?.removeAttribute("open");
      });
    });
  }

  function loadPrototypeApp() {
    if (document.querySelector('script[data-prototype-app]')) return;
    const script = document.createElement("script");
    script.src = "app.js";
    script.dataset.prototypeApp = "true";
    document.body.appendChild(script);
  }

  const catalogRequest = window.PROTOTYPE_TRANSLATIONS
    ? Promise.resolve(window.PROTOTYPE_TRANSLATIONS)
    : Promise.reject(new Error("translations.js must be loaded before i18n.js."));

  catalogRequest
    .then((data) => {
      catalog = data;
      exactEntries = new Map(Object.values(catalog.entries).map((entry) => [entry["zh-CN"], entry]));
      patternEntries = Object.values(catalog.patterns || {}).map(compilePattern);
      const savedLocale = readSavedLocale();
      currentLocale = catalog.locales[savedLocale] ? savedLocale : catalog.defaultLocale;
      installLanguageControl();
      setLocale(currentLocale, false);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") renderTextNode(mutation.target);
          else if (mutation.type === "attributes") renderAttributes(mutation.target);
          else mutation.addedNodes.forEach(renderSubtree);
        }
      });
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: TRANSLATABLE_ATTRIBUTES,
      });

      window.prototypeI18n = {
        get locale() { return currentLocale; },
        setLocale,
        format,
        catalog,
      };
    })
    .catch((error) => {
      console.error("Prototype translations could not be initialized.", error);
    })
    .finally(loadPrototypeApp);
})();
