import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = name => readFileSync(new URL(name, import.meta.url), "utf8");
function sceneStrip() {
  const elements = new Map(),
    listeners = {},
    timers = new Map();
  function node(id) {
    if (!elements.has(id))
      elements.set(id, {
        dataset: {},
        attributes: {},
        style: {},
        disabled: false,
        checked: false,
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        getAttribute(name) {
          return this.attributes[name];
        },
        querySelectorAll() {
          return [];
        },
        querySelector() {
          return null;
        },
        focus() {}
      });
    return elements.get(id);
  }
  const context = vm.createContext({
    document: {
      getElementById: node,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener(name, callback) {
        (listeners[name] ??= []).push(callback);
      },
      body: { style: {} }
    },
    localStorage: { getItem: () => null },
    window: { addEventListener() {} },
    setTimeout(callback) {
      const id = timers.size + 1;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    console
  });
  for (const name of ["./translations.js", "./i18n.js", "./app.js"]) {
    vm.runInContext(read(name).replace(/\nrender\(\);\s*$/, ""), context);
  }
  vm.runInContext("render=()=>{};renderOverlay=()=>{};", context);
  return { node, listeners, timers, document: context.document, run: source => vm.runInContext(source, context) };
}

test("scene strip has the reference label, two-line tabs and a two-line checkbox card", () => {
  const html = read("./index.html");
  const block = html.slice(
    html.indexOf('id="network-purpose-switcher"'),
    html.indexOf('id="network-purpose-content"')
  );
  for (const id of [
    "purpose-title-drill",
    "purpose-description-drill",
    "purpose-title-takeover",
    "purpose-description-takeover",
    "takeover-network-inheritance-title",
    "takeover-network-inheritance-description"
  ])
    assert.ok(block.includes(`id="${id}"`), id);
  assert.match(block, /网络场景/);
  assert.match(block, /演练验证时使用/);
  assert.match(block, /主机接管时使用/);
  assert.match(block, /接管网络与演练网络一致/);
  assert.match(block, /勾选后接管网络沿用演练网络配置/);
});

test("inherited takeover tab is disabled and carries the reference unlock hint", () => {
  const app = sceneStrip();
  app.run("renderNetworkPurpose()");
  assert.equal(app.node("purpose-tab-takeover").disabled, true);
  assert.equal(app.node("purpose-tab-drill").disabled, false);
  assert.equal(app.node("network-purpose-switcher").dataset.inherit, "true");
  assert.equal(
    app.node("purpose-tab-takeover").title,
    "Uncheck the option on the right to configure separately."
  );
});

test("unchecking inheritance stays on drill and unlocks takeover without navigating", () => {
  const app = sceneStrip();
  app.run("handleNetworkInheritanceToggle(false);renderNetworkPurpose()");
  assert.equal(app.run("activePurpose"), "drill");
  assert.equal(app.node("purpose-tab-takeover").disabled, false);
  assert.equal(app.node("purpose-tab-takeover").title, "");
});

test("checking inheritance while on takeover returns to drill and preserves the independent draft", () => {
  const app = sceneStrip();
  app.run(
    "handleNetworkInheritanceToggle(false);setNetworkPurpose('takeover');state.hosts['host-1'].single.groups=['sg-ray'];handleNetworkInheritanceToggle(true)"
  );
  assert.equal(app.run("activePurpose"), "drill");
  assert.equal(
    app.run("networkPlans.edit.drill.hosts['host-1'].single.groups[0]"),
    "sg-proxy"
  );
  app.run("handleNetworkInheritanceToggle(false)");
  assert.equal(app.run("activePurpose"), "drill");
  app.run("setNetworkPurpose('takeover')");
  assert.equal(app.run("state.hosts['host-1'].single.groups[0]"), "sg-ray");
});

test("unchecking inheritance while on takeover does not navigate", () => {
  const app = sceneStrip();
  app.run(
    "setNetworkPurpose('takeover');handleNetworkInheritanceToggle(false)"
  );
  assert.equal(app.run("activePurpose"), "takeover");
  assert.equal(app.run("isTakeoverReadOnly()"), false);
});

test("checking inheritance while already on drill stays on drill", () => {
  const app = sceneStrip();
  app.run(
    "handleNetworkInheritanceToggle(false);handleNetworkInheritanceToggle(true);renderNetworkPurpose()"
  );
  assert.equal(app.run("activePurpose"), "drill");
  assert.equal(app.node("purpose-tab-takeover").disabled, true);
});

test("keyboard navigation cannot enter the locked takeover tab", () => {
  const app = sceneStrip();
  let prevented = false;
  app.listeners.keydown[0]({
    key: "ArrowRight",
    preventDefault() {
      prevented = true;
    },
    target: { dataset: { purpose: "drill" } }
  });
  assert.equal(prevented, true);
  assert.equal(app.run("activePurpose"), "drill");
});

test("new scene-strip labels remain bilingual without replacing old catalog entries", () => {
  const app = sceneStrip();
  app.run("currentLanguage='en';renderNetworkPurpose()");
  assert.equal(app.run("t('prototype.networkScenario')"), "Network Scenario");
  assert.equal(
    app.run("t('prototype.drillNetworkUsage')"),
    "For drill validation"
  );
  assert.match(app.node("purpose-tab-takeover").title, /Uncheck/);
  assert.equal(app.run("Object.keys(UI_MESSAGE_SOURCES).length"), 90);
});

test("reference strip styling is confined to the scene-strip selectors", () => {
  const css = read("./styles.css");
  const block = css.slice(
    css.indexOf("/* Network-scene strip:"),
    css.indexOf('#network-purpose-content[data-read-only="true"]')
  );
  assert.match(block, /background:\s*#f4f7fb/);
  assert.match(block, /flex:\s*0 0 150px/);
  assert.match(block, /flex:\s*0 0 340px/);
  assert.match(block, /height:\s*52px/);
  assert.match(block, /padding:\s*14px 16px/);
  assert.doesNotMatch(
    block,
    /(?:^|\n)(?:body|html|\.footer|\.data-table|\.topbar)\b/
  );
});

// Real help handlers, with only browser event targets and painting stubbed.
function helpTarget(app, purpose) {
  const button = app.node("purpose-help-" + purpose);
  button.dataset.purposeHelp = purpose;
  const item = {
    dataset: { purposeHelpItem: purpose },
    contains: target => target === button || target === item,
  };
  button.closest = selector => selector === "[data-purpose-help]" ? button
    : selector === "[data-purpose-help-item]" ? item : null;
  return { button, item };
}
function dispatchHelp(app, type, target, extra = {}) {
  const event = { target, relatedTarget: null, preventDefault() {}, ...extra };
  for (const listener of app.listeners[type] || []) listener(event);
}

test("help controls are siblings of tabs, not children of disabled buttons", () => {
  const html = read("./index.html");
  for (const purpose of ["drill", "takeover"]) {
    const start = html.indexOf(`id="purpose-tab-${purpose}"`);
    const end = html.indexOf("</button>", start);
    const trigger = html.indexOf(`id="purpose-help-${purpose}"`);
    assert.ok(trigger > end);
    const markup = html.slice(trigger, html.indexOf("</button>", trigger));
    assert.doesNotMatch(markup, /disabled|data-action|data-purpose="/);
    assert.match(markup, new RegExp(`aria-describedby="purpose-tooltip-${purpose}"`));
    assert.match(html, new RegExp(`id="purpose-tooltip-${purpose}"[^>]*role="tooltip"[^>]*hidden`));
  }
});

test("disabled takeover help opens without switching purpose or mutating the plan", () => {
  const app = sceneStrip();
  const { button } = helpTarget(app, "takeover");
  app.run("renderNetworkPurpose()");
  const before = app.run("JSON.stringify(networkPlans)");
  assert.equal(app.node("purpose-tab-takeover").disabled, true);
  dispatchHelp(app, "click", button);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, false);
  assert.equal(button.attributes["aria-expanded"], "true");
  assert.equal(app.run("activePurpose"), "drill");
  assert.equal(app.run("JSON.stringify(networkPlans)"), before);
  dispatchHelp(app, "click", button);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, true);
});

test("only one help tooltip is open and outside clicks dismiss it", () => {
  const app = sceneStrip();
  const drill = helpTarget(app, "drill");
  const takeover = helpTarget(app, "takeover");
  dispatchHelp(app, "click", drill.button);
  dispatchHelp(app, "click", takeover.button);
  assert.equal(app.node("purpose-tooltip-drill").hidden, true);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, false);
  dispatchHelp(app, "click", { closest: () => null, matches: () => false });
  assert.equal(app.node("purpose-tooltip-takeover").hidden, true);
});

test("hover opens help and permits crossing the gap into its tooltip", () => {
  const app = sceneStrip();
  const { button, item } = helpTarget(app, "drill");
  dispatchHelp(app, "mouseover", button);
  assert.equal(app.node("purpose-tooltip-drill").hidden, false);
  dispatchHelp(app, "mouseout", button);
  assert.equal(app.timers.size, 1);
  const tooltip = { closest: selector => selector === "[data-purpose-help-item]" ? item : null };
  dispatchHelp(app, "mouseover", tooltip);
  assert.equal(app.timers.size, 0);
  dispatchHelp(app, "mouseout", tooltip);
  for (const callback of [...app.timers.values()]) callback();
  assert.equal(app.node("purpose-tooltip-drill").hidden, true);
});

test("keyboard focus opens help; Escape and focus leaving dismiss it", () => {
  const app = sceneStrip();
  const { button } = helpTarget(app, "takeover");
  dispatchHelp(app, "focusin", button);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, false);
  let prevented = false;
  dispatchHelp(app, "keydown", button, { key: "Escape", preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, true);
  dispatchHelp(app, "focusin", button);
  dispatchHelp(app, "focusout", button);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, true);
});

test("scene and purpose changes dismiss help without changing network settings", () => {
  const app = sceneStrip();
  app.run("showPurposeHelp('takeover');setScene('create')");
  assert.equal(app.run("activePurposeHelp"), null);
  assert.equal(app.node("purpose-tooltip-takeover").hidden, true);
  app.run("setTakeoverInheritance(false);showPurposeHelp('drill');setNetworkPurpose('takeover')");
  assert.equal(app.run("activePurposeHelp"), null);
});

test("help copy and accessible names are localized in both languages", () => {
  const app = sceneStrip();
  for (const language of ["en", "zh"]) {
    app.run(`currentLanguage='${language}'`);
    for (const purpose of ["drill", "takeover"]) {
      const copy = app.run(`t('prototype.${purpose}NetworkHelp')`);
      const label = app.run(`t('prototype.${purpose}NetworkHelpLabel')`);
      assert.ok(copy.length > 40);
      if (language === "en") {
        assert.doesNotMatch(copy + label, /[\u4e00-\u9fff]/);
        assert.match(label, /^About/);
      } else {
        assert.match(copy, /网络/);
        assert.match(label, /^关于/);
      }
    }
  }
});


test("help icon uses a larger single-color outline, including the question mark", () => {
  const html = read("./index.html");
  const icon = html.slice(html.indexOf('<symbol id="icon-help"'), html.indexOf('<symbol id="icon-back"'));
  assert.match(icon, /fill="none" stroke="currentColor"/);
  assert.doesNotMatch(icon, /#fff|#ffffff/i);
  const css = read("./styles.css");
  const iconStyle = css.slice(css.indexOf(".purpose-help-button svg {"), css.indexOf(".purpose-help-button:hover,"));
  assert.match(iconStyle, /width: 16px/);
  assert.match(iconStyle, /height: 16px/);
  assert.match(css, /\.purpose-tab\[aria-selected="true"\] ~ \.purpose-help-button \{\s*color: #fff;/);
});

test("help tooltip and arrow use the same dark surface with readable white copy", () => {
  const css = read("./styles.css");
  const start = css.indexOf(".purpose-tooltip {");
  const block = css.slice(start, css.indexOf(".network-inheritance-control {", start));
  assert.match(block, /background: #303133;/);
  assert.match(block, /color: #fff;/);
  assert.match(block, /font-size: 14px;/);
  assert.match(block, /line-height: 1.6;/);
  assert.equal((block.match(/border-bottom-color: #303133;/g) || []).length, 2);
  assert.doesNotMatch(block, /border-bottom-color: #fff;/);
});


test("drill scenario uses neutral validation wording for recovery and migration", () => {
  const app = sceneStrip();
  app.run("currentLanguage='zh'");
  assert.equal(app.run("t('prototype.drillNetworkUsage')"), "演练验证时使用");
  assert.match(app.run("t('prototype.drillNetworkHelp')"), /用于演练验证，检查目标主机/);
  assert.doesNotMatch(app.run("t('prototype.drillNetworkHelp')"), /容灾|恢复主机/);
  app.run("currentLanguage='en'");
  assert.equal(app.run("t('prototype.drillNetworkUsage')"), "For drill validation");
  assert.match(app.run("t('prototype.drillNetworkHelp')"), /on target hosts/);
  assert.doesNotMatch(app.run("t('prototype.drillNetworkHelp')"), /DR drills|recovered hosts/);
});


test("takeover scenario uses neutral host takeover wording for recovery and migration", () => {
  const app = sceneStrip();
  app.run("currentLanguage='zh'");
  assert.equal(app.run("t('prototype.takeoverNetworkUsage')"), "主机接管时使用");
  assert.match(app.run("t('prototype.takeoverNetworkHelp')"), /用于主机接管，为目标主机/);
  assert.doesNotMatch(app.run("t('prototype.takeoverNetworkHelp')"), /故障|恢复主机/);
  app.run("currentLanguage='en'");
  assert.equal(app.run("t('prototype.takeoverNetworkUsage')"), "For host takeover");
  assert.match(app.run("t('prototype.takeoverNetworkHelp')"), /on target hosts/);
  assert.doesNotMatch(app.run("t('prototype.takeoverNetworkHelp')"), /failover|recovered applications/);
});
