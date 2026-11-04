import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = name => readFileSync(new URL(name, import.meta.url), "utf8");
function sceneStrip() {
  const elements = new Map(),
    listeners = {};
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
    setTimeout: () => 0,
    clearTimeout() {},
    console
  });
  for (const name of ["./translations.js", "./i18n.js", "./app.js"]) {
    vm.runInContext(read(name).replace(/\nrender\(\);\s*$/, ""), context);
  }
  vm.runInContext("render=()=>{};renderOverlay=()=>{};", context);
  return { node, listeners, run: source => vm.runInContext(source, context) };
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
  assert.match(block, /容灾演练时使用/);
  assert.match(block, /故障接管时使用/);
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
    "关闭右侧开关后可单独配置"
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
    "Used for DR drills"
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
