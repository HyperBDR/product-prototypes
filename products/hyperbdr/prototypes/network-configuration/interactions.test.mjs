import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Execute the actual standalone application code. Only DOM painting is stubbed;
// data mutation, validation, serialization, persistence and click handlers are real.
const source = readFileSync(
  new URL("./app.js", import.meta.url),
  "utf8"
).replace(/\nrender\(\);\s*$/, "");
function app(persisted = null, sceneOptions = {}) {
  const listeners = {},
    storage = new Map(
      persisted ? [["hyperbdr-network-prototype-v2", persisted]] : []
    );
  if (sceneOptions.createPersisted)
    storage.set(
      "hyperbdr-network-creation-step5-v1",
      sceneOptions.createPersisted
    );
  if (sceneOptions.language)
    storage.set("hyperbdr-network-language-v1", sceneOptions.language);
  const location = { hash: sceneOptions.hash || "" };
  const stub = {
    innerHTML: "",
    style: {},
    scrollTop: 0,
    querySelector: () => stub,
    querySelectorAll: () => [],
    focus() {},
    scrollIntoView() {}
  };
  const document = {
    getElementById: () => stub,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (name, fn) => (listeners[name] ??= []).push(fn),
    body: { style: {} }
  };
  const context = vm.createContext({
    document,
    location,
    history: {
      replaceState(_state, _title, hash) {
        location.hash = hash;
      }
    },
    window: { addEventListener() {} },
    localStorage: {
      getItem: k => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: k => storage.delete(k)
    },
    setTimeout: () => 0,
    clearTimeout() {},
    console
  });
  vm.runInContext(
    readFileSync(new URL("./translations.js", import.meta.url), "utf8"),
    context
  );
  vm.runInContext(
    readFileSync(new URL("./i18n.js", import.meta.url), "utf8"),
    context
  );
  vm.runInContext(source, context);
  vm.runInContext(
    "render=()=>{};renderOverlay=()=>{};toast=()=>{};positionGroupMenus=()=>{};",
    context
  );
  const run = code => vm.runInContext(code, context);
  const click = (action, host = "host-1", index = 0) =>
    listeners.click.forEach(fn =>
      fn({
        preventDefault() {},
        target: {
          matches: () => false,
          closest: selector =>
            selector === "[data-action]"
              ? {
                  dataset: { action, host, index: String(index) },
                  disabled: false
                }
              : null
        }
      })
    );
  return {
    run,
    click,
    storage,
    json: code => JSON.parse(run(`JSON.stringify(${code})`))
  };
}

test("default is single NIC with one selected host and valid configuration", () => {
  const a = app();
  assert.equal(a.run("state.mode"), "single");
  assert.equal(a.run("state.selected.length"), 1);
  assert.equal(a.run("validateAll().length"), 0);
  assert.equal(a.run("validStoredState(state)"), true);
});
test("IPv4 syntax rejects octet overflow, leading zeroes and incomplete addresses", () => {
  const a = app();
  for (const ip of [
    "256.1.1.1",
    "01.2.3.4",
    "1.2.3",
    "1.2.3.4.5",
    "a.b.c.d",
    ""
  ])
    assert.equal(a.run(`ipv4(${JSON.stringify(ip)})`), false);
  assert.equal(a.run("ipv4('192.168.10.3')"), true);
});
test("subnet validation rejects network address, broadcast and out-of-range IP", () => {
  const a = app();
  for (const ip of ["10.0.0.0", "10.0.0.255", "10.0.1.1"])
    assert.equal(a.run(`usableIp('${ip}','10.0.0.0/24')`), false);
  assert.equal(a.run("usableIp('10.0.0.254','10.0.0.0/24')"), true);
});
test("manual IP validates actual selected subnet", () => {
  const a = app();
  a.run(
    "Object.assign(state.hosts['host-1'].single,{privateMode:'manual',privateIp:'10.0.0.10'})"
  );
  assert.equal(a.run("validateAll().length"), 0);
  a.run("state.hosts['host-1'].single.privateIp='172.16.10.10'");
  assert.match(a.run("validateAll()[0]"), /不在子网/);
});
test("original IP is selected from source host and validated", () => {
  const a = app();
  a.run(
    "Object.assign(state.hosts['host-1'].single,{network:'recovery',subnet:'dr-1',privateMode:'original'})"
  );
  assert.equal(a.run("validateAll().length"), 0);
  assert.equal(
    a.run("privateValue(state.hosts['host-1'].single,HOSTS[0])"),
    "192.168.10.3"
  );
});
test("security groups are required", () => {
  const a = app();
  a.run("state.hosts['host-1'].single.groups=[]");
  assert.match(a.run("validateAll()[0]"), /安全组/);
});
test("new EIP bandwidth must be integer between 1 and 300", () => {
  const a = app();
  a.run("state.hosts['host-1'].single.publicMode='new'");
  for (const value of ["0", "301", "1.5", "", "NaN"]) {
    a.run(`state.hosts['host-1'].single.bandwidth='${value}'`);
    assert.ok(a.run("validateAll().length") > 0);
  }
  for (const v of [1, 300]) {
    a.run(`state.hosts['host-1'].single.bandwidth=${v}`);
    assert.equal(a.run("validateAll().length"), 0);
  }
});
test("single and multiple NIC drafts stay independent when switching tabs", () => {
  const a = app();
  a.run("state.hosts['host-1'].single.privateIp='10.0.0.42'");
  a.click("multiple");
  a.click("add");
  a.click("single");
  assert.equal(a.run("state.hosts['host-1'].single.privateIp"), "10.0.0.42");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 2);
});
test("adding NIC inherits primary network and groups without duplicate fixed IP", () => {
  const a = app();
  a.run(
    "Object.assign(state.hosts['host-1'].nics[0],{network:'production',subnet:'prod-web',privateMode:'manual',privateIp:'172.16.10.5',publicMode:'existing'})"
  );
  a.click("add");
  assert.equal(a.run("state.hosts['host-1'].nics[1].network"), "production");
  assert.equal(a.run("state.hosts['host-1'].nics[1].privateMode"), "auto");
  assert.equal(a.run("state.hosts['host-1'].nics[1].publicMode"), "none");
  assert.equal(
    a.run(
      "state.hosts['host-1'].nics[0].id!==state.hosts['host-1'].nics[1].id"
    ),
    true
  );
});
test("NIC add action is bounded at 12", () => {
  const a = app();
  for (let i = 0; i < 20; i++) a.click("add");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 12);
});
test("primary NIC is guarded; secondary removal matches the original immediate action", () => {
  const a = app();
  a.click("add");
  a.click("remove", "host-1", 0);
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 2);
  a.click("remove", "host-1", 1);
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 1);
});
test("drawer cancellation discards changes; applying commits a deep copy", () => {
  const a = app();
  a.click("edit");
  a.run("draft.network='production';draft.subnet='prod-web'");
  a.click("close");
  assert.equal(a.run("state.hosts['host-1'].nics[0].network"), "ray");
  a.click("edit");
  a.run("draft.groups=['sg-default']");
  a.click("apply-nic");
  assert.deepEqual(a.json("state.hosts['host-1'].nics[0].groups"), [
    "sg-default"
  ]);
});
test("drawer rejects invalid values without altering original NIC", () => {
  const a = app();
  a.click("edit");
  a.run("draft.groups=[]");
  a.click("apply-nic");
  assert.ok(a.run("overlay.errors.length") > 0);
  assert.deepEqual(a.json("state.hosts['host-1'].nics[0].groups"), [
    "sg-proxy"
  ]);
});
test("duplicates are detected across NICs and hosts on same network", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.run(
    "state.hosts['host-1'].nics.forEach(n=>Object.assign(n,{privateMode:'manual',privateIp:'10.0.0.10'}))"
  );
  assert.match(a.run("validateAll().join()"), /重复/);
  a.run(
    "state.mode='single';state.selected.push('host-2');state.selected.forEach(id=>Object.assign(state.hosts[id].single,{privateMode:'manual',privateIp:'10.0.0.11'}))"
  );
  assert.match(a.run("validateAll().join()"), /重复/);
});
test("same fixed IP on distinct virtual networks is not flagged as duplicate", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.run(
    "NETWORKS[1].subnets[0].cidr='10.0.0.0/24';state.hosts['host-1'].nics[1].network='production';state.hosts['host-1'].nics[1].subnet='prod-web';state.hosts['host-1'].nics.forEach(n=>Object.assign(n,{privateMode:'manual',privateIp:'10.0.0.42'}))"
  );
  assert.equal(a.run("validateAll().length"), 0);
});
test("existing EIP cannot be assigned to two NICs", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.run("state.hosts['host-1'].nics.forEach(n=>n.publicMode='existing')");
  assert.match(a.run("validateAll().join()"), /公网 IP.*已被/);
});
test("payload contains current mode and only active IP allocation fields", () => {
  const a = app();
  a.run(
    "state.hosts['host-1'].single.publicMode='new';state.hosts['host-1'].single.bandwidth=5"
  );
  const result = a.json("configPayload()");
  assert.equal(result.prototype, true);
  assert.equal(result.hosts[0].nics[0].publicIp.bandwidth, 5);
  assert.equal(result.hosts[0].nics[0].primary, true);
  assert.equal(result.hosts[0].nics[0].publicIp.sharedBandwidth, undefined);
});
test("save, reload and cancel restore configuration using local storage", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.click("save");
  const reloaded = app(a.storage.get("hyperbdr-network-prototype-v2"));
  assert.equal(reloaded.run("state.mode"), "multiple");
  assert.equal(reloaded.run("state.hosts['host-1'].nics.length"), 2);
  a.click("add");
  a.click("cancel");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 2);
  assert.equal(a.run("dirty()"), false);
});
test("invalid active configuration is not persisted", () => {
  const a = app();
  a.run("state.hosts['host-1'].single.groups=[]");
  a.click("save");
  assert.equal(a.storage.size, 0);
});
test("malformed or outdated persisted data falls back safely", () => {
  for (const input of ["not json", "{}", '{"version":2,"state":{}}'])
    assert.equal(app(input).run("state.mode"), "single");
  const a = app();
  a.run("state.hosts['host-1'].nics=[]");
  assert.equal(a.run("validStoredState(state)"), false);
});
test("single NIC network changes reset subnet and obsolete manual addresses", () => {
  const a = app();
  a.run(
    "state.hosts['host-1'].single.privateIp='10.0.0.42';updateField({dataset:{context:'common',field:'network'},value:'production',tagName:'SELECT'})"
  );
  assert.equal(a.run("state.subnet"), "prod-web");
  assert.equal(a.run("state.hosts['host-1'].single.privateIp"), "");
  assert.equal(a.run("state.hosts['host-1'].single.network"), "production");
});
test("selected hosts drawer is read-only and adds no selection workflow", () => {
  const a = app();
  a.click("hosts");
  assert.equal(a.run("overlay.type"), "hosts");
  assert.equal(a.run("state.selected.length"), 1);
  a.click("close");
  assert.equal(a.run("state.selected.length"), 1);
});

test("HTML loads separate local styles and behavior with meaningful page nodes", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.js" defer/);
  assert.doesNotMatch(html, /<style\b|<script>(?!<)/);
  for (const id of [
    "network-configuration",
    "single-network-form",
    "single-hosts-table",
    "multiple-hosts-table-region",
    "network-configuration-actions"
  ]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
});

test("original page has no prototype-only visible commands or banners", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  assert.doesNotMatch(
    html,
    /配置预览|重置演示|原型说明|交互说明|save-status|prototype-tools/
  );
  const a = app();
  const single = a.run("renderSingleRows()");
  assert.doesNotMatch(single, /type="checkbox"|主网卡|扩展网卡/);
  a.click("multiple");
  assert.doesNotMatch(a.run("renderMultiple()"), /nic-label|prototype-tools/);
});

test("single NIC security group is a single selection, independent of multi-NIC groups", () => {
  const a = app();
  a.run(
    "updateField({dataset:{context:'single',host:'host-1',field:'singleGroup'},value:'sg-default',tagName:'SELECT'})"
  );
  assert.deepEqual(a.json("state.hosts['host-1'].single.groups"), [
    "sg-default"
  ]);
  assert.deepEqual(a.json("state.hosts['host-1'].nics[0].groups"), [
    "sg-proxy"
  ]);
});

test("creation scene starts at network step 5 with the two actual source hosts", () => {
  const a = app();
  a.run("setScene('create')");
  assert.equal(a.run("activeScene"), "create");
  assert.deepEqual(a.json("state.selected"), [
    "create-linux",
    "create-windows"
  ]);
  assert.equal(a.run("validateAll().length"), 0);
  assert.equal(a.run("validStoredState(state, 'create')"), true);
  assert.match(a.run("renderSingleRows()"), /ZhangTianJie-TestSync5/);
  assert.match(a.run("renderSingleRows()"), /ZhangTianJie-TestSync2/);
  assert.equal(
    (a.run("renderSingleRows()").match(/data-batch-select=/g) || []).length,
    2
  );
});

test("scene switching preserves independent forms, NIC counts and mode drafts", () => {
  const a = app();
  a.run("state.hosts['host-1'].single.privateIp='10.0.0.88'");
  a.run("setScene('create')");
  a.click("multiple");
  a.click("add", "create-windows");
  a.run(
    "state.hosts['create-linux'].single.groups=['sg-ray']; setScene('edit')"
  );
  assert.equal(a.run("state.mode"), "single");
  assert.equal(a.run("state.hosts['host-1'].single.privateIp"), "10.0.0.88");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 1);
  a.run("setScene('create')");
  assert.equal(a.run("state.mode"), "multiple");
  assert.equal(a.run("state.hosts['create-windows'].nics.length"), 2);
  assert.deepEqual(a.json("state.hosts['create-linux'].single.groups"), [
    "sg-ray"
  ]);
});

test("creation NIC limits are 12 for Linux and 2 for Windows, enforced per host", () => {
  const a = app();
  a.run("setScene('create')");
  for (let i = 0; i < 15; i++) {
    a.click("add", "create-linux");
    a.click("add", "create-windows");
  }
  assert.equal(a.run("state.hosts['create-linux'].nics.length"), 12);
  assert.equal(a.run("state.hosts['create-windows'].nics.length"), 2);
  const html = a.run("renderMultiple()");
  assert.match(html, /12 \/ 12/);
  assert.match(html, /2 \/ 2/);
  assert.match(html, /最多为 2个/);
  a.click("remove", "create-windows", 0);
  assert.equal(a.run("state.hosts['create-windows'].nics.length"), 2);
  a.click("remove", "create-windows", 1);
  assert.equal(a.run("state.hosts['create-windows'].nics.length"), 1);
});

test("stored creation configuration rejects a host with too many NICs", () => {
  const a = app();
  a.run(
    "setScene('create');state.hosts['create-windows'].nics.push(nicDefault(),nicDefault())"
  );
  assert.equal(a.run("validStoredState(state, 'create')"), false);
  assert.equal(a.run("validStoredState(state)"), false);
});

test("creation batch settings cannot open without selecting rows", () => {
  const a = app();
  a.run("setScene('create'); openBatchDialog('private')");
  assert.equal(a.run("overlay"), null);
  a.run(
    "updateBatchSelection({dataset:{batchSelect:'create-linux'},checked:true});openBatchDialog('security')"
  );
  assert.equal(a.run("overlay.kind"), "security");
  assert.deepEqual(a.json("overlay.targets"), ["create-linux"]);
});

test("batch security group and IP mode apply only to checked hosts", () => {
  const a = app();
  a.run(
    "setScene('create');batchSelection.add('create-linux');openBatchDialog('security');batchDraft.singleGroup='sg-ray';applyBatchSettings()"
  );
  assert.deepEqual(a.json("state.hosts['create-linux'].single.groups"), [
    "sg-ray"
  ]);
  assert.deepEqual(a.json("state.hosts['create-windows'].single.groups"), [
    "sg-proxy"
  ]);
  a.run(
    "openBatchDialog('private');batchDraft.privateMode='manual';applyBatchSettings()"
  );
  assert.equal(
    a.run("state.hosts['create-linux'].single.privateMode"),
    "manual"
  );
  assert.equal(a.run("state.hosts['create-linux'].single.privateIp"), "");
  assert.equal(
    a.run("state.hosts['create-windows'].single.privateMode"),
    "auto"
  );
});

test("select-all supports partial selection and clears when switching NIC mode", () => {
  const a = app();
  a.run(
    "setScene('create');updateBatchSelection({dataset:{batchSelect:'all'},checked:true})"
  );
  assert.equal(a.run("batchSelection.size"), 2);
  a.run(
    "updateBatchSelection({dataset:{batchSelect:'create-linux'},checked:false})"
  );
  assert.equal(a.run("batchSelection.size"), 1);
  assert.equal(a.run("batchSelection.has('create-windows')"), true);
  a.click("multiple");
  assert.equal(a.run("batchSelection.size"), 0);
});

test("batch EIP bandwidth validates before mutating either host", () => {
  const a = app();
  a.run(
    "setScene('create');batchSelection=new Set(state.selected);openBatchDialog('public');batchDraft.publicMode='new';batchDraft.bandwidth='301';applyBatchSettings()"
  );
  assert.equal(a.run("overlay.type"), "batch");
  assert.equal(a.run("state.hosts['create-linux'].single.publicMode"), "none");
  a.run("batchDraft.bandwidth='20';applyBatchSettings()");
  assert.equal(a.run("overlay"), null);
  for (const id of ["create-linux", "create-windows"]) {
    assert.equal(a.run(`state.hosts['${id}'].single.publicMode`), "new");
    assert.equal(a.run(`state.hosts['${id}'].single.bandwidth`), "20");
  }
  assert.equal(a.run("validateAll().length"), 0);
});

test("closing batch settings does not apply the temporary form", () => {
  const a = app();
  a.run(
    "setScene('create');batchSelection.add('create-linux');openBatchDialog('security');batchDraft.singleGroup='sg-ray'"
  );
  a.click("close");
  assert.deepEqual(a.json("state.hosts['create-linux'].single.groups"), [
    "sg-proxy"
  ]);
});

test("creation and editing persistence use different local-storage keys", () => {
  const a = app();
  a.click("save");
  const edit = a.storage.get("hyperbdr-network-prototype-v2");
  a.run("setScene('create')");
  a.click("validate-create");
  assert.equal(a.storage.get("hyperbdr-network-prototype-v2"), edit);
  const data = JSON.parse(a.storage.get("hyperbdr-network-creation-step5-v1"));
  assert.equal(data.plan.drill.selected.length, 2);
  assert.equal(data.plan.drill.selected[0], "create-linux");
});

test("step-boundary controls do not navigate or mutate the step-5 configuration", () => {
  const a = app();
  a.run("setScene('create')");
  const initial = a.run("JSON.stringify(state)");
  a.click("step-boundary");
  assert.equal(a.run("JSON.stringify(state)"), initial);
  assert.equal(a.run("activeScene"), "create");
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  assert.match(html, /id="creation-configuration-steps"/);
  assert.equal((html.match(/aria-current="step"/g) || []).length, 1);
  assert.doesNotMatch(html, /data-action="step-[1-467]"/);
});

test("direct creation links open step 5 and preserve the scene when reloaded", () => {
  const a = app(null, { hash: "#create" });
  assert.equal(a.run("activeScene"), "create");
  assert.equal(a.run("state.selected.length"), 2);
  a.run("setScene('edit')");
  assert.equal(a.run("location.hash"), "#edit");
  a.run("setScene('create')");
  assert.equal(a.run("location.hash"), "#create");
});

test("creation drafts restore from their own storage without replacing editing data", () => {
  const a = app();
  a.click("save");
  const edit = a.storage.get("hyperbdr-network-prototype-v2");
  a.run("setScene('create')");
  a.click("multiple");
  a.click("add", "create-windows");
  a.click("validate-create");
  const creation = a.storage.get("hyperbdr-network-creation-step5-v1");
  const restored = app(edit, { hash: "#create", createPersisted: creation });
  assert.equal(restored.run("activeScene"), "create");
  assert.equal(restored.run("state.hosts['create-windows'].nics.length"), 2);
  assert.equal(restored.run("state.mode"), "multiple");
  restored.run("setScene('edit')");
  assert.equal(restored.run("state.selected[0]"), "host-1");
  assert.equal(restored.run("state.mode"), "single");
});

test("both scenes default to drill with takeover inheriting and no independent draft", () => {
  const a = app();
  for (const scene of ["edit", "create"]) {
    a.run(`setScene('${scene}')`);
    assert.equal(a.run("activePurpose"), "drill");
    assert.equal(a.run("networkPlans[activeScene].inheritTakeover"), true);
    assert.equal(a.run("networkPlans[activeScene].takeover"), null);
  }
});

test("viewing inherited takeover does not create a copy or mark the plan dirty", () => {
  const a = app();
  a.run("setNetworkPurpose('takeover')");
  assert.equal(a.run("isTakeoverReadOnly()"), true);
  assert.equal(a.run("state === networkPlans.edit.drill"), true);
  assert.equal(a.run("networkPlans.edit.takeover"), null);
  assert.equal(a.run("dirty()"), false);
  a.run("setNetworkPurpose('drill')");
  assert.equal(a.run("dirty()"), false);
});

test("first uncheck takes a deep snapshot of the entire current drill configuration", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.run(
    "state.hosts['host-1'].nics[0].groups=['sg-ray'];setNetworkPurpose('takeover');setTakeoverInheritance(false)"
  );
  assert.equal(a.run("isTakeoverReadOnly()"), false);
  assert.equal(a.run("state.mode"), "multiple");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 2);
  assert.equal(a.run("state !== networkPlans.edit.drill"), true);
  assert.deepEqual(a.json("state.hosts['host-1'].nics[0].groups"), ["sg-ray"]);
  a.run(
    "state.hosts['host-1'].nics[0].groups.push('sg-default');state.hosts['host-1'].nics.pop()"
  );
  assert.deepEqual(
    a.json("networkPlans.edit.drill.hosts['host-1'].nics[0].groups"),
    ["sg-ray"]
  );
  assert.equal(a.run("networkPlans.edit.drill.hosts['host-1'].nics.length"), 2);
});

test("unchecked takeover has its own network, subnet, IP mode and NIC mode", () => {
  const a = app();
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  a.run(
    "updateField({dataset:{context:'common',field:'network'},value:'production',tagName:'SELECT'})"
  );
  a.click("multiple");
  a.click("add");
  a.run("setNetworkPurpose('drill')");
  assert.equal(a.run("state.network"), "ray");
  assert.equal(a.run("state.mode"), "single");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 1);
  a.run("setNetworkPurpose('takeover')");
  assert.equal(a.run("state.network"), "production");
  assert.equal(a.run("state.subnet"), "prod-web");
  assert.equal(a.run("state.mode"), "multiple");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 2);
});

test("rechecking preserves independent draft and unchecking restores it instead of recopying", () => {
  const a = app();
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  a.run(
    "state.hosts['host-1'].single.groups=['sg-ray'];setTakeoverInheritance(true)"
  );
  assert.equal(a.run("isTakeoverReadOnly()"), true);
  assert.deepEqual(a.json("state.hosts['host-1'].single.groups"), ["sg-proxy"]);
  a.run(
    "setNetworkPurpose('drill');state.hosts['host-1'].single.groups=['sg-default'];setNetworkPurpose('takeover')"
  );
  assert.deepEqual(a.json("state.hosts['host-1'].single.groups"), [
    "sg-default"
  ]);
  a.run("setTakeoverInheritance(false)");
  assert.deepEqual(a.json("state.hosts['host-1'].single.groups"), ["sg-ray"]);
});

test("inheritance follows drill changes to NIC count, mode and all NIC settings", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.run(
    "Object.assign(state.hosts['host-1'].nics[1],{network:'production',subnet:'prod-web',privateMode:'manual',privateIp:'172.16.10.12',publicMode:'shared',sharedBandwidth:'shared-business',groups:['sg-ray']});setNetworkPurpose('takeover')"
  );
  assert.equal(a.run("state.mode"), "multiple");
  const nic = a.json("state.hosts['host-1'].nics[1]");
  assert.equal(nic.network, "production");
  assert.equal(nic.subnet, "prod-web");
  assert.equal(nic.privateIp, "172.16.10.12");
  assert.equal(nic.sharedBandwidth, "shared-business");
  assert.deepEqual(nic.groups, ["sg-ray"]);
  a.run("setNetworkPurpose('drill')");
  a.click("add");
  a.run("setNetworkPurpose('takeover')");
  assert.equal(a.run("state.hosts['host-1'].nics.length"), 3);
});

test("read-only takeover guards forced mode, NIC edit/add/remove and form actions", () => {
  const a = app();
  a.click("multiple");
  a.click("add");
  a.run("setNetworkPurpose('takeover')");
  const before = a.run("JSON.stringify(networkPlans.edit)");
  for (const action of [
    "single",
    "multiple",
    "add",
    "edit",
    "remove",
    "apply-nic",
    "apply-batch",
    "batch-private"
  ])
    a.click(action, "host-1", 1);
  a.run(
    "updateField({dataset:{context:'common',field:'network'},value:'production',tagName:'SELECT'})"
  );
  a.run(
    "updateField({dataset:{context:'single',host:'host-1',field:'singleGroup'},value:'sg-ray',tagName:'SELECT'})"
  );
  assert.equal(a.run("JSON.stringify(networkPlans.edit)"), before);
  assert.equal(a.run("overlay"), null);
});

test("read-only takeover blocks batch selection and batch editor even via direct helpers", () => {
  const a = app(null, { hash: "#create" });
  a.run(
    "setNetworkPurpose('takeover');updateBatchSelection({dataset:{batchSelect:'all'},checked:true});openBatchDialog('security')"
  );
  assert.equal(a.run("batchSelection.size"), 0);
  assert.equal(a.run("overlay"), null);
  a.run("batchSelection=new Set(state.selected);openBatchDialog('public')");
  assert.equal(a.run("overlay"), null);
});

test("read-only takeover still supports host expansion and read-only detail drawers", () => {
  const a = app();
  a.click("multiple");
  a.run("setNetworkPurpose('takeover')");
  a.click("expand");
  assert.equal(a.run("expanded.has('host-1')"), false);
  a.click("hosts");
  assert.equal(a.run("overlay.type"), "hosts");
  a.click("close");
  a.click("rules");
  assert.equal(a.run("overlay.type"), "rules");
  assert.deepEqual(a.json("overlay.groups"), ["sg-proxy"]);
});

test("unchecking in inherited takeover makes its controls writable immediately", () => {
  const a = app();
  a.run("setNetworkPurpose('takeover');setTakeoverInheritance(false)");
  a.click("multiple");
  a.click("add");
  assert.equal(a.run("isTakeoverReadOnly()"), false);
  assert.equal(
    a.run("networkPlans.edit.takeover.hosts['host-1'].nics.length"),
    2
  );
  assert.equal(a.run("networkPlans.edit.drill.hosts['host-1'].nics.length"), 1);
});

test("mode and host expansion are retained per purpose, without reusing batch selection", () => {
  const a = app(null, { hash: "#create" });
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  a.click("multiple");
  a.click("expand", "create-linux");
  a.run(
    "setNetworkPurpose('drill');updateBatchSelection({dataset:{batchSelect:'all'},checked:true});setNetworkPurpose('takeover')"
  );
  assert.equal(a.run("state.mode"), "multiple");
  assert.equal(a.run("expanded.has('create-linux')"), false);
  assert.equal(a.run("batchSelection.size"), 0);
  a.run("setNetworkPurpose('drill')");
  assert.equal(a.run("state.mode"), "single");
  assert.equal(a.run("expanded.has('create-linux')"), true);
});

test("purpose selection, inheritance and independent drafts are isolated between product scenes", () => {
  const a = app();
  a.run(
    "setTakeoverInheritance(false);setNetworkPurpose('takeover');state.hosts['host-1'].single.groups=['sg-ray'];setScene('create')"
  );
  assert.equal(a.run("activePurpose"), "drill");
  assert.equal(a.run("networkPlans.create.inheritTakeover"), true);
  a.run("setNetworkPurpose('takeover')");
  assert.equal(a.run("isTakeoverReadOnly()"), true);
  a.run("setScene('edit')");
  assert.equal(a.run("activePurpose"), "takeover");
  assert.equal(a.run("isTakeoverReadOnly()"), false);
  assert.deepEqual(a.json("state.hosts['host-1'].single.groups"), ["sg-ray"]);
});

test("saving independent networks validates both purposes, not just the visible one", () => {
  const a = app();
  a.run(
    "setTakeoverInheritance(false);networkPlans.edit.takeover.hosts['host-1'].single.groups=[]"
  );
  assert.match(a.run("validateNetworkPlan().join()"), /接管网络.*安全组/);
  a.click("save");
  assert.equal(a.storage.size, 0);
  a.run(
    "networkPlans.edit.takeover.hosts['host-1'].single.groups=['sg-ray'];networkPlans.edit.drill.hosts['host-1'].single.groups=[];setNetworkPurpose('takeover')"
  );
  assert.match(a.run("validateNetworkPlan().join()"), /演练网络.*安全组/);
  a.click("save");
  assert.equal(a.storage.size, 0);
});

test("re-enabled inheritance validates drill only and keeps an incomplete independent draft", () => {
  const a = app();
  a.run(
    "setTakeoverInheritance(false);networkPlans.edit.takeover.hosts['host-1'].single.groups=[];setTakeoverInheritance(true);setNetworkPurpose('takeover')"
  );
  assert.equal(a.run("validateNetworkPlan().length"), 0);
  a.click("save");
  const stored = JSON.parse(a.storage.get("hyperbdr-network-prototype-v2"));
  assert.equal(stored.version, 2);
  assert.equal(stored.plan.inheritTakeover, true);
  assert.deepEqual(stored.plan.takeover.hosts["host-1"].single.groups, []);
});

test("identical IPs across different purposes do not create false duplicate errors", () => {
  const a = app();
  a.run(
    "Object.assign(state.hosts['host-1'].single,{privateMode:'manual',privateIp:'10.0.0.20',publicMode:'existing'});setTakeoverInheritance(false)"
  );
  assert.equal(a.run("validateNetworkPlan().length"), 0);
});

test("save and reload preserve independent takeover, inheritance state and both NIC modes", () => {
  const a = app();
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  a.click("multiple");
  a.click("add");
  a.click("save");
  const restored = app(a.storage.get("hyperbdr-network-prototype-v2"));
  assert.equal(restored.run("networkPlans.edit.inheritTakeover"), false);
  assert.equal(restored.run("state.mode"), "single");
  restored.run("setNetworkPurpose('takeover')");
  assert.equal(restored.run("state.mode"), "multiple");
  assert.equal(restored.run("state.hosts['host-1'].nics.length"), 2);
  assert.equal(restored.run("dirty()"), false);
});

test("a stashed takeover draft survives save/reload while inheritance is enabled", () => {
  const a = app();
  a.run(
    "setTakeoverInheritance(false);networkPlans.edit.takeover.hosts['host-1'].single.groups=['sg-ray'];setTakeoverInheritance(true)"
  );
  a.click("save");
  const restored = app(a.storage.get("hyperbdr-network-prototype-v2"));
  restored.run("setNetworkPurpose('takeover')");
  assert.equal(restored.run("isTakeoverReadOnly()"), true);
  restored.run("setTakeoverInheritance(false)");
  assert.deepEqual(restored.json("state.hosts['host-1'].single.groups"), [
    "sg-ray"
  ]);
});

test("edit cancel restores both networks and the checkbox together", () => {
  const a = app();
  a.click("save");
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  a.click("multiple");
  a.click("add");
  a.click("cancel");
  assert.equal(a.run("networkPlans.edit.inheritTakeover"), true);
  assert.equal(a.run("networkPlans.edit.takeover"), null);
  assert.equal(a.run("isTakeoverReadOnly()"), true);
  assert.equal(a.run("state.mode"), "single");
  assert.equal(a.run("dirty()"), false);
});

test("legacy single-network local data migrates losslessly into default drill inheritance", () => {
  const old = app();
  old.run("state.hosts['host-1'].single.groups=['sg-ray']");
  const legacy = JSON.stringify({ version: 1, state: old.json("state") });
  const migrated = app(legacy);
  assert.equal(migrated.run("networkPlans.edit.inheritTakeover"), true);
  assert.deepEqual(migrated.json("state.hosts['host-1'].single.groups"), [
    "sg-ray"
  ]);
  migrated.run("setNetworkPurpose('takeover')");
  assert.deepEqual(migrated.json("state.hosts['host-1'].single.groups"), [
    "sg-ray"
  ]);
  migrated.click("save");
  assert.equal(
    JSON.parse(migrated.storage.get("hyperbdr-network-prototype-v2")).version,
    2
  );
});

test("malformed new purpose envelopes fail safely instead of binding a missing takeover", () => {
  const a = app();
  const plan = a.json("networkPlans.edit");
  plan.inheritTakeover = false;
  const restored = app(JSON.stringify({ version: 2, plan }));
  assert.equal(restored.run("networkPlans.edit.inheritTakeover"), true);
  assert.equal(restored.run("state.selected.length"), 1);
});

test("creation takeover retains source-specific 12/2 NIC caps independently of drill", () => {
  const a = app(null, { hash: "#create" });
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  for (let i = 0; i < 15; i++) {
    a.click("add", "create-linux");
    a.click("add", "create-windows");
  }
  assert.equal(a.run("state.hosts['create-linux'].nics.length"), 12);
  assert.equal(a.run("state.hosts['create-windows'].nics.length"), 2);
  a.run("setNetworkPurpose('drill')");
  assert.equal(a.run("state.hosts['create-linux'].nics.length"), 1);
  assert.equal(a.run("state.hosts['create-windows'].nics.length"), 1);
});

test("purpose switcher wraps the complete existing network block and keeps inheritance outside it", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  assert.match(html, /id="network-purpose-tabs"/);
  assert.match(html, /id="takeover-use-drill-network"[^>]*checked/);
  assert.ok(
    html.indexOf('id="takeover-use-drill-network"') <
      html.indexOf('id="network-purpose-content"')
  );
  assert.ok(
    html.indexOf('id="network-purpose-content"') <
      html.indexOf('id="network-mode-tabs"')
  );
  assert.doesNotMatch(html, /容灾网络/);
});

test("bilingual catalogs share complete nonempty keys and preserve source attribution", () => {
  const a = app();
  const catalogs = a.json("UI_MESSAGES"),
    sources = a.json("UI_MESSAGE_SOURCES");
  assert.deepEqual(
    Object.keys(catalogs.zh).sort(),
    Object.keys(catalogs.en).sort()
  );
  assert.ok(Object.keys(sources).length >= 90);
  for (const key of Object.keys(catalogs.zh)) {
    assert.ok(catalogs.zh[key].trim(), key);
    assert.ok(catalogs.en[key].trim(), key);
    assert.ok(sources[key] === key || key.startsWith("prototype."), key);
  }
  assert.equal(catalogs.en["drConfig.netsConfig"], "Network Configuration");
  assert.equal(catalogs.en["drConfig.notSpecify"], "Not Specified");
});

test("all literal translation keys in static markup and application code exist", () => {
  const a = app();
  const messages = a.json("UI_MESSAGES.zh");
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const js = readFileSync(new URL("./app.js", import.meta.url), "utf8");
  const keys = [...html.matchAll(/data-i18n(?:-[\w-]+)?="([\w.]+)"/g)].map(
    m => m[1]
  );
  keys.push(...[...js.matchAll(/\bt\(\s*["']([\w.]+)["']/g)].map(m => m[1]));
  for (const key of keys) assert.equal(typeof messages[key], "string", key);
  assert.match(html, /src="translations\.js"/);
  assert.match(html, /src="i18n\.js"/);
  assert.ok(
    html.indexOf('src="translations.js"') < html.indexOf('src="i18n.js"')
  );
  assert.ok(html.indexOf('src="i18n.js"') < html.indexOf('src="app.js"'));
});

test("language preference defaults to Chinese and can persist independently", () => {
  const a = app();
  assert.equal(a.run("currentLanguage"), "zh");
  a.run("setLanguage('en')");
  assert.equal(a.run("currentLanguage"), "en");
  assert.equal(a.storage.get("hyperbdr-network-language-v1"), "en");
  assert.equal(a.storage.has("hyperbdr-network-prototype-v2"), false);
  const restored = app(null, {
    language: a.storage.get("hyperbdr-network-language-v1")
  });
  assert.equal(restored.run("t('drConfig.singleNic')"), "Single NIC");
});

test("unsupported stored and requested languages fail safely", () => {
  const a = app(null, { language: "fr" });
  assert.equal(a.run("currentLanguage"), "zh");
  assert.equal(a.run("setLanguage('fr')"), false);
  assert.equal(a.run("currentLanguage"), "zh");
});

test("switching language never changes plans, saved data, inheritance or NIC IDs", () => {
  const a = app(null, { hash: "#create" });
  a.run("setTakeoverInheritance(false);setNetworkPurpose('takeover')");
  a.click("multiple");
  a.click("add", "create-windows");
  const before = a.run(
    "JSON.stringify({networkPlans,savedNetworkPlans,activeScene,activePurpose})"
  );
  const wasDirty = a.run("dirty()");
  for (const language of ["en", "zh", "en"]) {
    a.run(`setLanguage('${language}')`);
    assert.equal(
      a.run(
        "JSON.stringify({networkPlans,savedNetworkPlans,activeScene,activePurpose})"
      ),
      before
    );
    assert.equal(a.run("dirty()"), wasDirty);
  }
});

test("English renderers cover both scenes, both purposes and both NIC modes", () => {
  const a = app();
  a.run("setLanguage('en')");
  for (const scene of ["edit", "create"])
    for (const purpose of ["drill", "takeover"]) {
      a.run(`setScene('${scene}');setNetworkPurpose('${purpose}')`);
      for (const expression of [
        "renderSingleRows()",
        "renderMultiple()",
        "selectedHostsTable()"
      ]) {
        const html = a.run(expression);
        assert.doesNotMatch(
          html,
          /[\u4e00-\u9fff]/,
          `${scene}/${purpose}/${expression}`
        );
        assert.doesNotMatch(html, /\$\{t\(/);
      }
    }
});

test("IP option labels and NIC summaries are localized at render time", () => {
  const a = app();
  assert.equal(
    a.run("ipSummary(state.hosts['host-1'].single,HOSTS[0])"),
    "不指定（自动分配）"
  );
  a.run("setLanguage('en')");
  assert.equal(
    a.run("ipSummary(state.hosts['host-1'].single,HOSTS[0])"),
    "Not Specified(Auto Assign)"
  );
  const options = a.json("localizedOptions(PUBLIC_MODES)");
  assert.deepEqual(options.map(item => item[0]), [
    "none",
    "existing",
    "new",
    "shared"
  ]);
  assert.deepEqual(options.map(item => item[1]), [
    "Not Allocated",
    "Allocate IP",
    "Request IP",
    "Shared Bandwidth"
  ]);
});

test("language changes preserve an open target NIC editor and uncommitted draft", () => {
  const a = app();
  a.click("edit");
  a.run(
    "Object.assign(draft,{network:'production',subnet:'prod-web',privateMode:'manual',privateIp:'172.16.10.12'})"
  );
  const draftBefore = a.run("JSON.stringify(draft)");
  const planBefore = a.run("JSON.stringify(networkPlans)");
  a.run("setLanguage('en')");
  assert.equal(a.run("overlay.type"), "edit");
  assert.equal(a.run("JSON.stringify(draft)"), draftBefore);
  assert.equal(a.run("JSON.stringify(networkPlans)"), planBefore);
  assert.match(a.run("drawerForm()"), /Private IP/);
  assert.doesNotMatch(a.run("drawerForm()"), /[\u4e00-\u9fff]/);
  a.run("setLanguage('zh')");
  assert.equal(a.run("JSON.stringify(draft)"), draftBefore);
  a.click("apply-nic");
  assert.equal(
    a.run("state.hosts['host-1'].nics[0].privateIp"),
    "172.16.10.12"
  );
});

test("English batch dialogs preserve selected hosts and their temporary input", () => {
  const a = app(null, { hash: "#create" });
  a.run(
    "batchSelection=new Set(state.selected);openBatchDialog('public');batchDraft.publicMode='new';batchDraft.bandwidth='20';setLanguage('en');renderBatchDialog()"
  );
  assert.match(a.run("layers.innerHTML"), /Bulk Set Public IP/);
  assert.match(a.run("layers.innerHTML"), /value="20"/);
  assert.doesNotMatch(a.run("layers.innerHTML"), /[\u4e00-\u9fff]/);
  assert.equal(a.run("batchSelection.size"), 2);
  assert.equal(a.run("overlay.targets.length"), 2);
  a.run("setLanguage('zh')");
  assert.equal(a.run("batchDraft.bandwidth"), "20");
});

test("English validation includes interpolated parameters without untranslated fragments", () => {
  const a = app();
  a.run(
    "Object.assign(state.hosts['host-1'].single,{privateMode:'manual',privateIp:'192.168.10.12',publicMode:'new',bandwidth:'999',groups:[]});setLanguage('en')"
  );
  const errors = a.json("validateNetworkPlan()");
  assert.ok(errors.length >= 3);
  assert.match(errors.join(" "), /Drill Network/);
  assert.match(errors.join(" "), /192\.168\.10\.12/);
  assert.match(errors.join(" "), /10\.0\.0\.0\/24/);
  assert.doesNotMatch(errors.join(" "), /[\u4e00-\u9fff]|\{\w+\}/);
});

test("inherited takeover remains read-only after either language switch", () => {
  const a = app();
  a.run("setNetworkPurpose('takeover')");
  const before = a.run("JSON.stringify(networkPlans)");
  for (const language of ["en", "zh"]) {
    a.run(`setLanguage('${language}')`);
    assert.equal(a.run("isTakeoverReadOnly()"), true);
    a.click("add");
    assert.equal(a.run("JSON.stringify(networkPlans)"), before);
  }
});

test("locale persists across product-scene and network-purpose switches", () => {
  const a = app();
  a.run("setLanguage('en');setScene('create');setNetworkPurpose('takeover')");
  assert.equal(a.run("currentLanguage"), "en");
  assert.equal(a.run("t('prototype.takeoverNetwork')"), "Takeover Network");
  a.run("setScene('edit');setNetworkPurpose('drill')");
  assert.equal(a.run("currentLanguage"), "en");
});

test("source multiline hints keep intended line breaks without double blank lines", () => {
  const a = app();
  for (const language of ["zh", "en"]) {
    a.run(`setLanguage('${language}')`);
    const html = a.run("messageMarkup('drConfig.floating_ip_tip')");
    assert.equal((html.match(/<br>/g) || []).length, 3);
    assert.doesNotMatch(html, /<br>\s*<br>/);
    assert.equal(
      (a.run("messageMarkup('drConfig.nic_name')").match(/<br>/g) || []).length,
      1
    );
  }
});

test("raw resource names and network IDs are never translated", () => {
  const a = app();
  a.run("GROUPS[0].name='自定义安全组';setLanguage('en')");
  assert.match(a.run("renderSingleRows()"), /自定义安全组/);
  assert.equal(a.run("state.hosts['host-1'].single.network"), "ray");
  assert.equal(a.run("state.hosts['host-1'].single.groups[0]"), "sg-proxy");
});

test("language menu is raised above an open modal and restores its normal layer when closed", () => {
  const classes = new Set(),
    attributes = {};
  const header = {
    classList: {
      toggle(name, on) {
        on ? classes.add(name) : classes.delete(name);
      },
      remove(name) {
        classes.delete(name);
      }
    }
  };
  const toggle = {
    setAttribute(name, value) {
      attributes[name] = value;
    },
    focus() {}
  };
  const menu = { hidden: true, querySelector: () => ({ focus() {} }) };
  const elements = {
    "product-header": header,
    "language-toggle": toggle,
    "language-menu": menu
  };
  const context = vm.createContext({
    document: { getElementById: id => elements[id] || null },
    localStorage: { getItem: () => null }
  });
  vm.runInContext(
    readFileSync(new URL("./translations.js", import.meta.url), "utf8"),
    context
  );
  vm.runInContext(
    readFileSync(new URL("./i18n.js", import.meta.url), "utf8"),
    context
  );
  vm.runInContext("toggleLanguageMenu()", context);
  assert.equal(menu.hidden, false);
  assert.equal(classes.has("language-menu-open"), true);
  assert.equal(attributes["aria-expanded"], "true");
  vm.runInContext("closeLanguageMenu()", context);
  assert.equal(menu.hidden, true);
  assert.equal(classes.has("language-menu-open"), false);
  assert.equal(attributes["aria-expanded"], "false");
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  assert.match(css, /\.topbar\.language-menu-open\s*\{\s*z-index:\s*70/);
});
