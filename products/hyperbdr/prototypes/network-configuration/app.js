"use strict";
// Standalone prototype: all options and configurations are local mock data.
const NETWORKS = [
  {
    id: "ray",
    name: "vpc-ray",
    cidr: "10.0.0.0/8",
    subnets: [
      { id: "ray-1", name: "subnet-ray", cidr: "10.0.0.0/24" },
      { id: "ray-2", name: "subnet-ray-business", cidr: "10.0.1.0/24" }
    ]
  },
  {
    id: "production",
    name: "vpc-production",
    cidr: "172.16.0.0/16",
    subnets: [
      { id: "prod-web", name: "subnet-web", cidr: "172.16.10.0/24" },
      { id: "prod-db", name: "subnet-database", cidr: "172.16.20.0/24" }
    ]
  },
  {
    id: "recovery",
    name: "vpc-recovery",
    cidr: "192.168.0.0/16",
    subnets: [
      { id: "dr-1", name: "subnet-dr", cidr: "192.168.10.0/24" },
      { id: "dr-2", name: "subnet-dr-backup", cidr: "192.168.20.0/24" }
    ]
  }
];
const GROUPS = [
  {
    id: "sg-proxy",
    name: "mhmceshiproxy",
    code: "010fd042-fc87-4206-a226-4db86a6947a3",
    created: "2023-12-12 18:14:35"
  },
  {
    id: "sg-sync",
    name: "CLOUD_SYNC_SG_20261019151815_ade538",
    code: "02254271-21fe-4b55-b0ed-88438364c0c2",
    created: "2026-10-19 15:18:16"
  },
  {
    id: "sg-july",
    name: "CLOUD_SYNC_SG_20260724171035_457e10",
    code: "0454e735-95ef-43aa-9a2b-8274204b42d0",
    created: "2026-07-24 17:10:41"
  },
  {
    id: "sg-march",
    name: "CLOUD_SYNC_SG_20260302160754_a95048",
    code: "209eff23-a3b5-4bd5-afb8-7c83984d8acc",
    created: "2026-03-02 16:07:55"
  },
  {
    id: "sg-october",
    name: "CLOUD_SYNC_SG_20261023110757_8b852e",
    code: "233ddd36-06ea-4196-8c7b-3f29cf4f2c58",
    created: "2026-10-23 11:07:59"
  },
  {
    id: "sg-proxy-1",
    name: "mhmceshiproxy1",
    code: "276a2e39-25b3-47e9-9207-7e88d1ed7aec",
    created: "2024-07-15 17:59:20"
  },
  {
    id: "sg-zhao",
    name: "sg-zhaoming-bj1",
    code: "2b8b43b4-05a6-48be-920c-fd3495283a22",
    created: "2023-04-21 11:17:32"
  },
  {
    id: "sg-trans",
    name: "TRANS_H_IMG_SG_20260724160437_431972",
    code: "3aaea4f5-b5ee-4d1e-a6b5-6ddedd57b3ee",
    created: "2026-07-24 16:04:41"
  },
  {
    id: "sg-ray",
    name: "ray-security-group",
    code: "cdc35d19-3d61-4823-886a-3ec3c690be06",
    created: "2024-04-03 20:49:12"
  },
  {
    id: "sg-web",
    name: "default-wordpress",
    code: "7b0501a0-609a-4e7d-a4e1-9f8c33af8594",
    created: "2025-11-24 16:04:12"
  },
  {
    id: "sg-default",
    name: "default",
    code: "d3c67111-883c-47e2-bf09-7df4362a7e3b",
    created: "2019-06-11 11:09:58"
  }
];
const HOSTS = [
  {
    id: "host-1",
    name: "ZhangTianJie-TestSync4",
    ip: "192.168.10.3",
    mac: "00:50:56:b0:45:90",
    source: [
      {
        name: "Nic-0",
        ip: "-",
        mask: "-",
        gateway: "-",
        mac: "00:50:56:b0:45:90"
      }
    ]
  },
  {
    id: "host-2",
    name: "Web-Server-02",
    ip: "192.168.10.12",
    mac: "00:50:56:b0:45:91",
    source: [
      {
        name: "eth0",
        ip: "192.168.10.12",
        mask: "255.255.255.0",
        gateway: "192.168.10.1",
        mac: "00:50:56:b0:45:91"
      },
      {
        name: "eth1",
        ip: "172.16.10.12",
        mask: "255.255.255.0",
        gateway: "-",
        mac: "00:50:56:b0:45:92"
      }
    ]
  },
  {
    id: "host-3",
    name: "Database-Server-03",
    ip: "192.168.10.23",
    mac: "00:50:56:b0:45:93",
    source: [
      {
        name: "eth0",
        ip: "192.168.10.23",
        mask: "255.255.255.0",
        gateway: "192.168.10.1",
        mac: "00:50:56:b0:45:93"
      }
    ]
  }
];
// Creation step 5 uses the two hosts currently selected on the source page.
const CREATE_HOSTS = [
  {
    id: "create-linux",
    name: "ZhangTianJie-TestSync5",
    ip: "192.168.10.3",
    mac: "00:50:56:b0:b5:20",
    os: "Linux",
    cpu: "4 CPU",
    memory: "6 GB",
    disks: 3,
    diskSize: "50.00 GB",
    maxNics: 12,
    source: [
      {
        name: "Nic-0",
        ip: "-",
        mask: "-",
        gateway: "-",
        mac: "00:50:56:b0:b5:20"
      }
    ]
  },
  {
    id: "create-windows",
    name: "ZhangTianJie-TestSync2",
    ip: "192.168.10.3",
    mac: "00:50:56:9a:ef:fe",
    os: "Windows",
    cpu: "4 CPU",
    memory: "4 GB",
    disks: 1,
    diskSize: "1.00 MB",
    maxNics: 2,
    source: [
      {
        name: "Nic-0",
        ip: "-",
        mask: "-",
        gateway: "-",
        mac: "00:50:56:9a:ef:fe"
      }
    ]
  }
];
const CREATE_STORAGE_KEY = "hyperbdr-network-creation-step5-v1";
const maxNics = host => host.maxNics || 12;
const PUBLIC_IPS = ["203.0.113.21", "203.0.113.22", "198.51.100.38"]; // RFC 5737 documentation addresses.
const PRIVATE_MODES = [
  ["original", "drConfig.original"],
  ["manual", "drConfig.specify"],
  ["auto", "drConfig.notSpecify"]
];
const PUBLIC_MODES = [
  ["none", "drConfig.notAllocation"],
  ["existing", "drConfig.allocation"],
  ["new", "drConfig.request"],
  ["shared", "drConfig.bandwidth"]
];
const STORAGE_KEY = "hyperbdr-network-prototype-v2";
const SUBNET_TIP = "drConfig.subnet_tip";
const clone = value => JSON.parse(JSON.stringify(value));
const esc = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
const byHost = id => [...HOSTS, ...CREATE_HOSTS].find(h => h.id === id);
const network = id => NETWORKS.find(n => n.id === id);
const subnet = nic =>
  network(nic.network)?.subnets.find(s => s.id === nic.subnet);
const groupName = id => GROUPS.find(g => g.id === id)?.name || "";
const nicDefault = () => ({
  id: uid(),
  network: "ray",
  subnet: "ray-1",
  privateMode: "auto",
  privateIp: "",
  originalIp: "",
  publicMode: "none",
  publicIp: PUBLIC_IPS[0],
  bandwidth: "",
  bandwidthType: "按带宽计费",
  sharedBandwidth: "shared-standard",
  groups: ["sg-proxy"]
});
function uid() {
  return (
    "nic-" +
    Math.random()
      .toString(36)
      .slice(2, 11)
  );
}
function initialState() {
  const hosts = {};
  HOSTS.forEach(h => {
    hosts[h.id] = { single: nicDefault(), nics: [nicDefault()] };
  });
  return {
    mode: "single",
    selected: ["host-1"],
    network: "ray",
    subnet: "ray-1",
    hosts
  };
}
function createInitialState() {
  const hosts = {};
  CREATE_HOSTS.forEach(host => {
    hosts[host.id] = { single: nicDefault(), nics: [nicDefault()] };
  });
  return {
    mode: "single",
    selected: CREATE_HOSTS.map(host => host.id),
    network: "ray",
    subnet: "ray-1",
    hosts
  };
}
function validStoredState(s, scene = "edit") {
  const sceneHosts = scene === "create" ? CREATE_HOSTS : HOSTS;
  return (
    s &&
    ["single", "multiple"].includes(s.mode) &&
    network(s.network) &&
    network(s.network).subnets.some(n => n.id === s.subnet) &&
    Array.isArray(s.selected) &&
    s.selected.length > 0 &&
    new Set(s.selected).size === s.selected.length &&
    s.selected.every(id => sceneHosts.some(host => host.id === id)) &&
    sceneHosts.every(h => {
      const d = s.hosts?.[h.id];
      return (
        d &&
        validStoredNic(d.single) &&
        Array.isArray(d.nics) &&
        d.nics.length >= 1 &&
        d.nics.length <= maxNics(h) &&
        d.nics.every(validStoredNic)
      );
    })
  );
}
function validStoredNic(n) {
  return (
    n &&
    typeof n.id === "string" &&
    network(n.network) &&
    subnet(n) &&
    PRIVATE_MODES.some(m => m[0] === n.privateMode) &&
    PUBLIC_MODES.some(m => m[0] === n.publicMode) &&
    Array.isArray(n.groups) &&
    n.groups.every(id => GROUPS.some(g => g.id === id)) &&
    [
      "privateIp",
      "originalIp",
      "publicIp",
      "bandwidthType",
      "sharedBandwidth"
    ].every(k => typeof n[k] === "string") &&
    Number.isFinite(Number(n.bandwidth))
  );
}
// Each product scene owns a drill network and an optional independent takeover draft.
// `state` remains the currently displayed effective network for the form renderers.
let activeScene = "edit",
  activePurpose = "drill";
const networkPlans = {
  edit: loadNetworkPlan(STORAGE_KEY, "edit", initialState()),
  create: loadNetworkPlan(CREATE_STORAGE_KEY, "create", createInitialState())
};
const savedNetworkPlans = clone(networkPlans);
const purposeViews = { edit: "drill", create: "drill" };
const expandedViews = {
  edit: {
    drill: new Set(networkPlans.edit.drill.selected),
    takeover: new Set(networkPlans.edit.drill.selected)
  },
  create: {
    drill: new Set(networkPlans.create.drill.selected),
    takeover: new Set(networkPlans.create.drill.selected)
  }
};
let state = networkPlans.edit.drill,
  saved = savedNetworkPlans.edit.drill,
  expanded = expandedViews.edit.drill,
  overlay = null,
  errors = [],
  draft = null,
  toastTimer,
  lastFocus = null;
let batchSelection = new Set();
const main = document.getElementById("network-configuration"),
  layers = document.getElementById("network-drawer-layer");
function dirty() {
  return (
    JSON.stringify(networkPlans[activeScene]) !==
    JSON.stringify(savedNetworkPlans[activeScene])
  );
}

function ipv4(s) {
  const parts = String(s).split(".");
  return (
    parts.length === 4 &&
    parts.every(p => /^(0|[1-9]\d{0,2})$/.test(p) && Number(p) <= 255)
  );
}
function ipNumber(ip) {
  return ip.split(".").reduce((n, p) => n * 256 + Number(p), 0);
}
function usableIp(ip, cidr) {
  if (!ipv4(ip)) return false;
  const [base, prefix] = cidr.split("/"),
    size = 2 ** (32 - Number(prefix)),
    start = Math.floor(ipNumber(base) / size) * size,
    num = ipNumber(ip);
  return num > start && num < start + size - 1;
}
function privateValue(n, h) {
  return n.privateMode === "auto"
    ? ""
    : n.privateMode === "original"
    ? n.originalIp || h.ip
    : n.privateIp.trim();
}
function validateNic(n, h) {
  const result = [];
  if (!network(n.network) || !subnet(n))
    return [t("prototype.validNetworkRequired")];
  const ip = privateValue(n, h);
  if (n.privateMode !== "auto" && !ipv4(ip))
    result.push(t("prototype.invalidPrivateIp"));
  else if (n.privateMode !== "auto" && !usableIp(ip, subnet(n).cidr))
    result.push(t("prototype.ipOutsideSubnet", { ip, cidr: subnet(n).cidr }));
  if (!n.groups.length) result.push(t("prototype.securityGroupRequired"));
  if (n.publicMode === "existing" && !PUBLIC_IPS.includes(n.publicIp))
    result.push(t("prototype.existingIpRequired"));
  if (
    n.publicMode === "new" &&
    (!Number.isInteger(Number(n.bandwidth)) ||
      Number(n.bandwidth) < 1 ||
      Number(n.bandwidth) > 300)
  )
    result.push(t("prototype.bandwidthRangeError"));
  if (
    n.publicMode === "shared" &&
    !["shared-standard", "shared-business"].includes(n.sharedBandwidth)
  )
    result.push(t("prototype.sharedBandwidthRequired"));
  return result;
}
function validateNetworkState(configuration) {
  const result = [],
    privateSeen = new Map(),
    publicSeen = new Set();
  configuration.selected.forEach(id => {
    const host = byHost(id),
      nics =
        configuration.mode === "single"
          ? [configuration.hosts[id].single]
          : configuration.hosts[id].nics;
    nics.forEach((nic, index) => {
      const name =
        host.name +
        (configuration.mode === "multiple"
          ? t("prototype.nicLabel", { index: index + 1 })
          : "");
      validateNic(nic, host).forEach(error =>
        result.push(name + t("symbol.colon") + error)
      );
      const ip = privateValue(nic, host),
        key = nic.network + "|" + ip;
      if (ip && privateSeen.has(key))
        result.push(
          t("prototype.duplicatePrivateIp", {
            name,
            ip,
            other: privateSeen.get(key)
          })
        );
      else if (ip) privateSeen.set(key, name);
      if (nic.publicMode === "existing") {
        if (publicSeen.has(nic.publicIp))
          result.push(
            t("prototype.duplicatePublicIp", { name, ip: nic.publicIp })
          );
        publicSeen.add(nic.publicIp);
      }
    });
  });
  return result;
}
function validateAll() {
  return validateNetworkState(state);
}
function validateNetworkPlan() {
  const plan = networkPlans[activeScene];
  const errors = validateNetworkState(plan.drill).map(
    message => t("prototype.drillNetwork") + t("symbol.colon") + message
  );
  if (!plan.inheritTakeover) {
    if (!plan.takeover)
      errors.push(
        t("prototype.takeoverNetwork") +
          t("symbol.colon") +
          t("prototype.takeoverRequired")
      );
    else
      errors.push(
        ...validateNetworkState(plan.takeover).map(
          message =>
            t("prototype.takeoverNetwork") + t("symbol.colon") + message
        )
      );
  }
  return errors;
}
function configPayload() {
  return {
    prototype: true,
    mode: state.mode,
    cloud: "HuaweiCloud",
    hosts: state.selected.map(id => ({
      id,
      name: byHost(id).name,
      sourceIp: byHost(id).ip,
      nics: (state.mode === "single"
        ? [state.hosts[id].single]
        : state.hosts[id].nics
      ).map((n, i) => ({
        primary: i === 0,
        network: n.network,
        subnet: n.subnet,
        privateIp: {
          mode: n.privateMode,
          value: privateValue(n, byHost(id)) || null
        },
        publicIp: {
          mode: n.publicMode,
          value: n.publicMode === "existing" ? n.publicIp : null,
          ...(n.publicMode === "new"
            ? { bandwidth: Number(n.bandwidth), billing: n.bandwidthType }
            : {}),
          ...(n.publicMode === "shared"
            ? { sharedBandwidth: n.sharedBandwidth }
            : {})
        },
        securityGroups: n.groups
      }))
    }))
  };
}

// Shared form controls retain the product's existing Element-style appearance.
function contextAttrs(ctx, field, suffix = "") {
  return `data-context="${ctx.type}" data-host="${ctx.host ||
    ""}" data-field="${field}" data-control="${ctx.type}-${ctx.host ||
    ""}-${field}${suffix}"`;
}
function selectField(ctx, field, value, options, label, extra = "") {
  const key = `${ctx.type}-${ctx.host || "network"}-${field}`;
  const selected = options.find(option => option[0] === value);
  const id = ctx.type === "common" ? `single-${field}-select` : `${key}-select`;
  return `<div class="select-field ${extra}" data-select-field="${key}">
    <button id="${id}" class="control select-control" type="button" role="combobox" aria-label="${esc(
    label
  )}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${key}-options" ${contextAttrs(
    ctx,
    field
  )} data-action="toggle-select">
      <span>${esc(
        selected?.[1] || t("placeholder.choose")
      )}</span><svg class="select-caret"><use href="#icon-chevron" /></svg>
    </button>
    <div id="${key}-options" class="select-menu" role="listbox" aria-label="${esc(
    t("prototype.options", { label })
  )}" hidden>
      ${options
        .map(
          ([id, name]) =>
            `<button class="select-option" type="button" role="option" aria-selected="${id ===
              value}" ${contextAttrs(
              ctx,
              field
            )} data-action="select-option" data-value="${esc(id)}">${esc(
              name
            )}</button>`
        )
        .join("")}
    </div>
  </div>`;
}
function textField(
  ctx,
  field,
  value,
  label,
  placeholder = "",
  disabled = false,
  extra = ""
) {
  return `<input class="control ${extra}" aria-label="${esc(
    label
  )}" ${contextAttrs(ctx, field)} value="${esc(value)}" placeholder="${esc(
    placeholder
  )}" ${disabled ? "disabled" : ""}>`;
}
function networkSelect(ctx, value) {
  return selectField(
    ctx,
    "network",
    value,
    NETWORKS.map(n => [n.id, `${n.name}(${n.cidr})`]),
    t("drConfig.network")
  );
}
function subnetSelect(ctx, nic) {
  return selectField(
    ctx,
    "subnet",
    nic.subnet,
    network(nic.network).subnets.map(s => [s.id, `${s.name}(${s.cidr})`]),
    t("host.subnets")
  );
}
function originalOptions(host) {
  return [
    ...new Set([
      host.ip,
      ...host.source.map(n => n.ip).filter(ip => ip !== "-")
    ])
  ];
}
function manualIpFields(nic, ctx, host) {
  const prefix = subnet(nic)
    .cidr.split(".")
    .slice(0, 3);
  const last =
    nic.privateIp.split(".").length === 4 ? nic.privateIp.split(".")[3] : "";
  return `<div class="manual-ip value" aria-label="${t("drConfig.private_ip")}">
    ${prefix
      .map(
        (part, i) =>
          `<input class="ip-segment" aria-label="${t("prototype.ipSegment", {
            index: i + 1
          })}" value="${part}" disabled><span>.</span>`
      )
      .join("")}
    <input class="ip-segment" inputmode="numeric" maxlength="3" aria-label="${esc(
      t("prototype.manualPrivateIp", { host: host.name })
    )}" ${contextAttrs(ctx, "privateIp")} data-ip-prefix="${prefix.join(
    "."
  )}" value="${esc(last)}">
  </div>`;
}
function ipFields(nic, ctx, kind) {
  const host = byHost(ctx.host),
    isPrivate = kind === "private";
  const mode = isPrivate ? nic.privateMode : nic.publicMode;
  let value = "";
  if (isPrivate) {
    if (mode === "auto")
      value = textField(
        ctx,
        "autoIp",
        t("drConfig.autoAssign"),
        t("prototype.autoPrivateIp", { host: host.name }),
        "",
        true,
        "value"
      );
    if (mode === "manual") value = manualIpFields(nic, ctx, host);
    if (mode === "original")
      value = selectField(
        ctx,
        "originalIp",
        nic.originalIp || host.ip,
        originalOptions(host).map(ip => [ip, ip]),
        t("prototype.originalIp", { host: host.name }),
        "value"
      );
  } else {
    if (mode === "none")
      value = textField(
        ctx,
        "noneIp",
        "-",
        t("prototype.unallocatedPublicIp", { host: host.name }),
        "",
        true,
        "value"
      );
    if (mode === "existing")
      value = selectField(
        ctx,
        "publicIp",
        nic.publicIp,
        PUBLIC_IPS.map(ip => [ip, ip]),
        t("prototype.existingPublicIp", { host: host.name }),
        "value"
      );
    if (mode === "new")
      value = textField(
        ctx,
        "bandwidth",
        nic.bandwidth,
        t("prototype.publicBandwidth", { host: host.name }),
        t("prototype.bandwidthPlaceholder"),
        false,
        "value bandwidth-input"
      );
    if (mode === "shared")
      value = selectField(
        ctx,
        "sharedBandwidth",
        nic.sharedBandwidth,
        [
          ["shared-standard", t("drConfig.bandwidth") + "-standard"],
          ["shared-business", t("drConfig.bandwidth") + "-business"]
        ],
        t("prototype.sharedBandwidth", { host: host.name }),
        "value"
      );
  }
  return `<div class="ip-control ${
    isPrivate ? "private-ip-control" : "public-ip-control"
  }">${selectField(
    ctx,
    isPrivate ? "privateMode" : "publicMode",
    mode,
    localizedOptions(isPrivate ? PRIVATE_MODES : PUBLIC_MODES),
    t(
      isPrivate ? "prototype.privateAssignment" : "prototype.publicAssignment",
      { host: host.name }
    ),
    "mode"
  )}${value}</div>`;
}
function groupSelect(nic, ctx) {
  return (
    '<div class="single-security-group-select">' +
    selectField(
      ctx,
      "singleGroup",
      nic.groups[0],
      GROUPS.map(group => [group.id, group.name]),
      byHost(ctx.host).name + " " + t("drConfig.securityGroup")
    ) +
    "</div>"
  );
}
function sortIcon() {
  return '<svg class="sort-icon" aria-hidden="true"><use href="#icon-sort" /></svg>';
}
function renderSingleRows() {
  return state.selected
    .map(id => {
      const host = byHost(id),
        nic = state.hosts[id].single,
        ctx = { type: "single", host: id };
      return `<tr id="single-host-${id}" data-host-id="${id}">
      ${
        activeScene === "create"
          ? `<td class="selection-cell"><input type="checkbox" aria-label="${esc(
              t("prototype.selectHost", { host: host.name })
            )}" data-batch-select="${id}" ${
              batchSelection.has(id) ? "checked" : ""
            }></td>`
          : ""
      }
      <td class="host-name-cell">${esc(host.name)}</td><td>${
        host.ip
      }<span>(ESXi)</span></td>
      <td class="private-ip-cell">${ipFields(nic, ctx, "private")}</td>
      <td class="public-ip-cell">${ipFields(nic, ctx, "public")}</td>
      <td class="mac-address-cell">${host.mac}</td>
      <td class="security-group-cell">${groupSelect(nic, ctx)}</td>
    </tr>`;
    })
    .join("");
}
function ipSummary(nic, host) {
  return nic.privateMode === "auto"
    ? parenthesized(t("drConfig.notSpecify"), t("drConfig.autoAssign"))
    : parenthesized(
        t(
          nic.privateMode === "manual"
            ? "drConfig.specify"
            : "drConfig.original"
        ),
        nic.privateMode === "manual" ? nic.privateIp : nic.originalIp || host.ip
      );
}
function publicSummary(nic) {
  const key = {
    none: "drConfig.notAllocation",
    existing: "drConfig.allocation",
    new: "drConfig.request",
    shared: "drConfig.bandwidth"
  }[nic.publicMode];
  const value =
    nic.publicMode === "none"
      ? "-"
      : nic.publicMode === "existing"
      ? nic.publicIp
      : nic.publicMode === "new"
      ? nic.bandwidth
      : nic.sharedBandwidth === "shared-standard"
      ? "standard"
      : "business";
  return parenthesized(t(key), value);
}
function renderSourceNics(host) {
  return `<section id="source-nics-${host.id}" class="source-nics-section">
    <h3 class="section-title">${t("drConfig.nic_source")} </h3>
    <table class="data-table source-table"><thead><tr><th>${messageMarkup(
      "drConfig.nic_name"
    )} ${sortIcon()}</th><th>${messageMarkup(
    "drConfig.mask_gateway"
  )} ${sortIcon()}</th><th>${t("drConfig.mac")} ${sortIcon()}</th></tr></thead>
    <tbody>${host.source
      .map(
        (nic, i) =>
          `<tr id="source-nic-${host.id}-${i}"><td>${
            nic.name
          }<span class="source-sub">${nic.ip}</span></td><td>${
            nic.mask
          }<span class="source-sub">${nic.gateway}</span></td><td>${
            nic.mac
          }</td></tr>`
      )
      .join("")}</tbody></table>
  </section>`;
}
function renderTargetNics(host, nics) {
  return `<section id="target-nics-${host.id}" class="target-nics-section">
    <div class="section-title"><h3>${t(
      "drConfig.nic_target"
    )} </h3><p class="nic-limit-tip"><span class="info">!</span>${t(
    "drConfig.nic_target_tip_1"
  )} ${maxNics(host)}${t(
    "drConfig.nic_target_tip_2"
  )}</p><button class="link" type="button" data-action="add" data-host="${
    host.id
  }" ${nics.length >= maxNics(host) ? "disabled" : ""}>+ ${t(
    "drConfig.add_nic"
  )}</button></div>
    <div class="table-scroll"><table id="target-nic-table-${
      host.id
    }" class="data-table target-table"><thead><tr><th>${t(
    "drConfig.network"
  )} ${sortIcon()}</th><th>${t("host.subnets")} ${sortIcon()}</th><th>${t(
    "drConfig.private_ip"
  )} ${sortIcon()}</th><th>${t("drConfig.public_ip")} ${sortIcon()}</th><th>${t(
    "drConfig.securityGroup"
  )} ${sortIcon()}</th><th>${t("table.handle")} </th></tr></thead>
    <tbody>${nics
      .map(
        (nic, i) => `<tr id="target-nic-${host.id}-${i}" data-nic-id="${
          nic.id
        }" data-primary="${i === 0}">
      <td>${esc(network(nic.network).name)}(${
          network(nic.network).cidr
        })</td><td>${esc(subnet(nic).name)}(${subnet(nic).cidr})</td><td>${esc(
          ipSummary(nic, host)
        )}</td><td>${esc(publicSummary(nic))}</td>
      <td><span>${nic.groups
        .map(g => esc(groupName(g)))
        .join(
          "<br>"
        )}</span><br><button class="link rules-detail-link" type="button" data-action="rules" data-host="${
          host.id
        }" data-index="${i}">${esc(t("prototype.viewDetails"))}</button></td>
      <td><div class="actions"><button class="link" type="button" data-action="edit" data-host="${
        host.id
      }" data-index="${i}">${t(
          "table.modify"
        )} </button><button class="link" type="button" data-action="remove" data-host="${
          host.id
        }" data-index="${i}" ${i === 0 ? "disabled" : ""}>${t(
          "table.remove"
        )} </button></div></td>
    </tr>`
      )
      .join("")}</tbody></table></div>
  </section>`;
}
function renderMultiple() {
  return `<table id="multiple-hosts-table" class="data-table host-table">
    <colgroup><col class="expand-column"><col class="name-column"><col class="ip-column"><col class="source-count-column"><col class="target-count-column"><col class="operation-column"></colgroup>
    <thead><tr><th></th><th>${t("drConfig.hostName")} ${sortIcon()}</th><th>${t(
    "unprotected.host_machine"
  )} </th><th class="center">${t(
    "drConfig.nic_num_source"
  )} </th><th class="center">${t("drConfig.nic_num_target")} </th><th>${t(
    "table.handle"
  )} </th></tr></thead>
    <tbody>${state.selected
      .map(id => {
        const host = byHost(id),
          nics = state.hosts[id].nics,
          open = expanded.has(id);
        return `<tr id="multiple-host-${id}" class="host-summary-row"><td><button class="expand-toggle" type="button" data-action="expand" data-host="${id}" aria-label="${
          open ? t("agent.hide") : t("agent.show")
        } ${esc(host.name)}" aria-expanded="${open}">${
          open ? "⌄" : "›"
        }</button></td><td>${esc(host.name)}</td><td>${
          host.ip
        }<span>(ESXi)</span></td><td class="center">${
          host.source.length
        }</td><td class="center" data-count="${id}">${nics.length} / ${maxNics(
          host
        )}</td><td><button class="link" type="button" data-action="expand" data-host="${id}">${t(
          "drConfig.nic_handle"
        )}</button></td></tr>
      ${
        open
          ? `<tr id="expanded-nics-${id}"><td colspan="6" class="expanded-cell"><div class="nic-layout">${renderSourceNics(
              host
            )}${renderTargetNics(host, nics)}</div></td></tr>`
          : ""
      }`;
      })
      .join("")}</tbody>
  </table>`;
}
function render() {
  renderSceneChrome();
  renderNetworkPurpose();
  const opened = [...document.querySelectorAll(".group-select[open]")].map(
    el => el.id
  );
  const focus = document.activeElement?.dataset.control;
  for (const mode of ["single", "multiple"]) {
    const active = state.mode === mode,
      tab = document.getElementById("tab-" + mode);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById("pane-" + mode).hidden = !active;
  }
  document.getElementById("selected-host-count").textContent =
    state.selected.length;
  document.getElementById("single-network-field").innerHTML = networkSelect(
    { type: "common" },
    state.network
  );
  document.getElementById("single-subnet-field").innerHTML = subnetSelect(
    { type: "common" },
    state
  );
  document.getElementById("single-host-rows").innerHTML = renderSingleRows();
  document.getElementById(
    "multiple-hosts-table-region"
  ).innerHTML = renderMultiple();
  renderOverlay();
  opened.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.open = true;
  });
  positionGroupMenus();
  applyStaticTranslations();
  applyNetworkReadOnly();
  if (focus) document.querySelector(`[data-control="${focus}"]`)?.focus();
}

function groupTable(nic) {
  return `<table id="nic-security-group-table" class="data-table sg-table"><thead><tr><th><input type="checkbox" aria-label="${t(
    "prototype.selectAllGroups"
  )}" data-context="drawer" data-field="allGroups" ${
    nic.groups.length === GROUPS.length ? "checked" : ""
  }></th><th>${t(
    "unprotected.name"
  )} ${sortIcon()}</th><th>ID${sortIcon()}</th><th>${t(
    "unprotected.created_at"
  )} ${sortIcon()}</th></tr></thead>
    <tbody>${GROUPS.map(
      group =>
        `<tr><td><input type="checkbox" ${contextAttrs(
          { type: "drawer", host: overlay.host },
          "groups",
          "-" + group.id
        )} aria-label="${esc(group.name)}" value="${group.id}" ${
          nic.groups.includes(group.id) ? "checked" : ""
        }></td><td><button class="link security-group-name" type="button" data-action="group-rules" data-group="${
          group.id
        }">${esc(group.name)}</button></td><td>${
          group.code
        }</td><td>${group.created.replace(" ", "<br>")}</td></tr>`
    ).join("")}</tbody></table>`;
}
function drawerForm() {
  const ctx = { type: "drawer", host: overlay.host };
  return `<form id="target-nic-form" autocomplete="off" novalidate>
    <div id="nic-network-row" class="form-line"><label for="drawer-${
      overlay.host
    }-network-select">${t("drConfig.network")}${t(
    "symbol.colon"
  )}</label><div class="field">${networkSelect(ctx, draft.network)}</div></div>
    <div id="nic-subnet-row" class="form-line"><label for="drawer-${
      overlay.host
    }-subnet-select">${t("host.subnets")}${t(
    "symbol.colon"
  )}</label><div class="field">${subnetSelect(ctx, draft)}<p class="hint">${t(
    SUBNET_TIP
  )}</p></div></div>
    <div id="nic-private-ip-row" class="form-line"><label>${t(
      "drConfig.private_ip"
    )}${t("symbol.colon")}</label><div class="field">${ipFields(
    draft,
    ctx,
    "private"
  )}<p class="hint">${messageMarkup("drConfig.fixed_ip_tip")}</p></div></div>
    <div id="nic-public-ip-row" class="form-line"><label>${t(
      "drConfig.public_ip"
    )}${t("symbol.colon")}</label><div class="field">${ipFields(
    draft,
    ctx,
    "public"
  )}<p class="hint">${messageMarkup("drConfig.floating_ip_tip")}</p></div></div>
    <div id="nic-security-groups-row" class="form-line"><label>${t(
      "drConfig.securityGroup"
    )}${t("symbol.colon")}</label><div class="field">${groupTable(
    draft
  )}</div></div>
  </form>`;
}
function selectedHostsTable() {
  return `<div class="table-scroll"><table id="selected-hosts-table" class="data-table selected-hosts-table"><thead><tr><th>${t(
    "unprotected.name"
  )} ${sortIcon()}</th><th>${t("unprotected.host_machine")} </th><th>${t(
    "unprotected.os_type"
  )} </th><th>${t("host.cpu_num")} </th><th>${t(
    "unprotected.ram"
  )} </th><th>${t("unprotected.disk")} </th><th>${t(
    "host.disks_size_gb"
  )} </th></tr></thead><tbody>${state.selected
    .map(id => {
      const host = byHost(id);
      return `<tr><td>${esc(host.name)}</td><td>${
        host.ip
      }(ESXi)</td><td>${host.os || "Linux"}</td><td>${host.cpu ||
        "2 CPU"}</td><td>${host.memory || "4 GB"}</td><td>${host.disks ||
        3}</td><td>${host.diskSize || "100.00 GB"}</td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}
function rulesTable() {
  return `<table id="security-groups-detail-table" class="data-table rules-groups-table"><thead><tr><th>${t(
    "drConfig.security_group_name"
  )} ${sortIcon()}</th><th>${t(
    "drConfig.security_group_id"
  )} ${sortIcon()}</th><th>${t(
    "unprotected.created_at"
  )} ${sortIcon()}</th><th>${t(
    "table.handle"
  )} </th></tr></thead><tbody>${overlay.groups
    .map(id => {
      const group = GROUPS.find(g => g.id === id),
        expanded = overlay.expanded?.includes(id);
      return `<tr><td>${esc(group.name)}</td><td>${group.code}</td><td>${
        group.created
      }</td><td><button class="link" type="button" data-action="expand-rules" data-group="${id}">${
        expanded ? t("drConfig.rule_collapse") : t("drConfig.rule_expand")
      }</button></td></tr>${
        expanded
          ? `<tr><td colspan="4" class="rules-expanded-cell"><div class="tabs"><button class="tab" type="button" aria-selected="${overlay.direction !==
              "out"}" data-action="inbound-rules">${t(
              "prototype.inbound"
            )} </button><button class="tab" type="button" aria-selected="${overlay.direction ===
              "out"}" data-action="outbound-rules">${t(
              "prototype.outbound"
            )} </button></div><table class="data-table"><thead><tr><th>${t(
              "drConfig.priority"
            )} </th><th>${t("drConfig.action")} </th><th>${t(
              "drConfig.ether_type"
            )} </th><th>${t("drConfig.protocol")} </th><th>${t(
              "prototype.portRange"
            )} </th><th>${t(
              overlay.direction === "out"
                ? "drConfig.cidr_out"
                : "drConfig.cidr_in"
            )}</th></tr></thead><tbody><tr><td>-</td><td>${t(
              "drConfig.allow"
            )} </td><td>IPv4</td><td>${
              overlay.direction === "out" ? t("resourceGroup.all") : "TCP"
            }</td><td>${
              overlay.direction === "out" ? t("resourceGroup.all") : "22, 443"
            }</td><td>${
              overlay.direction === "out" ? "0.0.0.0/0" : "10.0.0.0/8"
            }</td></tr></tbody></table></td></tr>`
          : ""
      }`;
    })
    .join("")}</tbody></table>`;
}
function renderOverlay() {
  main.inert = Boolean(overlay);
  document.getElementById("network-configuration-actions").inert = Boolean(
    overlay
  );
  if (!overlay) {
    layers.innerHTML = "";
    document.body.style.overflow = "";
    return;
  }
  document.body.style.overflow = "hidden";
  if (overlay.type === "batch") {
    renderBatchDialog();
    return;
  }
  const editing = overlay.type === "edit";
  const title = editing
    ? t("drConfig.nic_config")
    : overlay.type === "hosts"
    ? t("drConfig.selectedHost")
    : overlay.type === "group-rules"
    ? t("drConfig.rules_detail")
    : t("drConfig.securityGroup");
  const content = editing
    ? drawerForm()
    : overlay.type === "hosts"
    ? selectedHostsTable()
    : rulesTable();
  layers.innerHTML = `<div class="overlay" data-dismiss-drawer="true"><section id="${
    editing
      ? "target-nic-editor"
      : overlay.type === "hosts"
      ? "selected-hosts-drawer"
      : "security-group-drawer"
  }" class="drawer ${
    editing ? "nic-config-drawer" : ""
  }" role="dialog" aria-modal="true" aria-labelledby="network-drawer-title">
    <header class="overlay-title"><h2 id="network-drawer-title">${title}</h2><button class="close" type="button" data-action="close" aria-label="${t(
    "common.close"
  )}">×</button></header>
    <div id="drawer-scroll" class="overlay-body">${content}</div>
    ${
      editing
        ? `<footer class="overlay-footer"><button id="apply-nic-button" class="btn primary" type="button" data-action="apply-nic">${t(
            "table.submit"
          )} </button><button id="cancel-nic-button" class="btn" type="button" data-action="close">${t(
            "table.cancel"
          )} </button></footer>`
        : ""
    }
  </section></div>`;
  const all = layers.querySelector('[data-field="allGroups"]');
  if (all)
    all.indeterminate =
      draft.groups.length > 0 && draft.groups.length < GROUPS.length;
}
function openOverlay(value) {
  if (isTakeoverReadOnly() && ["edit", "batch"].includes(value.type)) return;
  closeSelectMenus();
  lastFocus = document.activeElement;
  overlay = value;
  renderOverlay();
  layers.querySelector("button")?.focus();
}
function closeOverlay() {
  if (overlay?.previous) {
    overlay = overlay.previous;
    renderOverlay();
    return;
  }
  overlay = null;
  draft = null;
  renderOverlay();
  if (lastFocus?.isConnected) lastFocus.focus();
}
function toast(input, warnOrType = false) {
  clearTimeout(toastTimer);
  const container = document.getElementById("network-notification");
  if (!container) return;

  let type = "success";
  if (warnOrType === true || warnOrType === "error") {
    type = "error";
  } else if (warnOrType === "warn" || warnOrType === "warning") {
    type = "warning";
  } else if (typeof warnOrType === "string") {
    type = warnOrType;
  }

  const errorIcon = `<svg viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.1l-99.3 118.8-66 .3c-4.4 0-8-3.6-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66 .3L512 464.9l99.3-118.8 66-.3c4.4 0 8 3.6 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130.1 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"/></svg>`;
  const successIcon = `<svg viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-264 316.8c-11.8 14.1-32.9 14.6-45.3 1.1l-144-156.4c-12.1-13.1-11.5-33.8 1.6-45.9 13.1-12.1 33.8-11.5 45.9 1.6l120.4 130.8 241.6-289.9c12.2-14.7 33.7-16.7 48.4-4.5 14.7 12.2 16.7 33.7 4.5 48.4z"/></svg>`;
  const warnIcon = `<svg viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 224c26.5 0 48 21.5 48 48v224c0 26.5-21.5 48-48 48s-48-21.5-48-48V336c0-26.5 21.5-48 48-48zm0 416c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48z"/></svg>`;
  const closeIcon = `<svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor"><path d="M576 512l277.3-277.3c17.7-17.7 17.7-46.3 0-64s-46.3-17.7-64 0L512 448 234.7 170.7c-17.7-17.7-46.3-17.7-64 0s-17.7 46.3 0 64L448 512 170.7 789.3c-17.7 17.7-17.7 46.3 0 64 8.8 8.8 20.4 13.3 32 13.3s23.2-4.4 32-13.3L512 576l277.3 277.3c8.8 8.8 20.4 13.3 32 13.3s23.2-4.4 32-13.3c17.7-17.7 17.7-46.3 0-64L576 512z"/></svg>`;

  const iconSvg = type === "error" ? errorIcon : (type === "warning" ? warnIcon : successIcon);

  let contentHtml = "";
  const colon = t("symbol.colon");
  const hostLabel = t("prototype.host") || "主机";

  function resolveField(msg) {
    if (/公网|带宽|EIP|bandwidth|Public IP/i.test(msg)) return t("drConfig.public_ip");
    if (/私网|内网|子网|subnet|Private IP/i.test(msg)) return t("drConfig.private_ip");
    if (/安全组|Security Group|security group/i.test(msg)) return t("drConfig.securityGroup");
    if (/MAC|mac/i.test(msg)) return t("drConfig.mac");
    if (/网络|Network/i.test(msg)) return t("drConfig.network");
    return "";
  }

  const items = Array.isArray(input) ? input : [input];
  const hostErrors = new Map();
  const flatErrors = [];

  items.forEach(rawItem => {
    if (typeof rawItem !== "string") return;
    const str = rawItem.trim();
    const parts = str.split(/：|:s*/);
    if (parts.length >= 3) {
      const purpose = parts[0].trim();
      const hostName = parts[1].trim();
      const errorMsg = parts.slice(2).join("：").trim();
      const hostKey = `${purpose} · ${hostLabel}${colon}${hostName}`;
      if (!hostErrors.has(hostKey)) hostErrors.set(hostKey, []);
      hostErrors.get(hostKey).push(errorMsg);
    } else if (parts.length === 2 && byHost(parts[0].trim())) {
      const hostName = parts[0].trim();
      const errorMsg = parts[1].trim();
      const hostKey = `${hostLabel}${colon}${hostName}`;
      if (!hostErrors.has(hostKey)) hostErrors.set(hostKey, []);
      hostErrors.get(hostKey).push(errorMsg);
    } else {
      flatErrors.push(str);
    }
  });

  if (hostErrors.size > 0) {
    let listHtml = "<ul>";
    for (const [hostKey, msgs] of hostErrors.entries()) {
      listHtml += `<li>${esc(hostKey)}<ul>`;
      msgs.forEach(msg => {
        const field = resolveField(msg);
        let rowText = esc(msg);
        if (field && !msg.startsWith(field)) {
          rowText = `${esc(field)}${colon}${esc(msg)}`;
        }
        listHtml += `<li>${rowText}</li>`;
      });
      listHtml += "</ul></li>";
    }
    listHtml += "</ul>";
    contentHtml = listHtml;
  } else if (flatErrors.length > 0) {
    contentHtml = `<p class="el-message__content">${flatErrors.map(esc).join("<br>")}</p>`;
  } else {
    contentHtml = `<p class="el-message__content">${esc(String(input))}</p>`;
  }

  // 15 seconds for errors (matching Element-UI 5 * 3000ms), 3 seconds for success
  const duration = type === "error" ? 15000 : 3000;

  container.innerHTML = `
    <div role="alert" class="el-message el-message--${esc(type)} is-closable toast ${type === "error" ? "warn error" : type}">
      <i class="el-message__icon el-icon-${esc(type)}">${iconSvg}</i>
      <div class="el-message__content">${contentHtml}</div>
      <button class="el-message__closeBtn el-icon-close" type="button" aria-label="${t("common.close") || "Close"}">${closeIcon}</button>
    </div>
  `;

  const closeBtn = container.querySelector(".el-message__closeBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      clearTimeout(toastTimer);
      container.innerHTML = "";
    });
  }

  toastTimer = setTimeout(() => {
    container.innerHTML = "";
  }, duration);
}
function closeSelectMenus() {
  document
    .querySelectorAll(".select-menu:not([hidden])")
    .forEach(menu => (menu.hidden = true));
  document
    .querySelectorAll('.select-control[aria-expanded="true"]')
    .forEach(control => control.setAttribute("aria-expanded", "false"));
}
function openSelectMenu(button) {
  const menu = button.parentElement.querySelector(".select-menu"),
    opened = !menu.hidden;
  closeSelectMenus();
  if (opened) return;
  menu.hidden = false;
  button.setAttribute("aria-expanded", "true");
  const rect = button.getBoundingClientRect();
  const menuWidth =
    button.dataset.field === "singleGroup"
      ? Math.max(rect.width, 258)
      : rect.width;
  menu.style.width = menuWidth + "px";
  menu.style.left = Math.min(rect.left, innerWidth - menuWidth - 8) + "px";
  menu.style.top = rect.bottom + 10 + "px";
  const available = innerHeight - rect.bottom - 75;
  menu.style.maxHeight = Math.max(100, Math.min(274, available)) + "px";
  if (available < 120) {
    menu.style.top = "auto";
    menu.style.bottom = innerHeight - rect.top + 10 + "px";
  } else menu.style.bottom = "auto";
}
function positionGroupMenus() {
  document.querySelectorAll(".group-select[open]").forEach(details => {
    const rect = details.querySelector("summary").getBoundingClientRect(),
      menu = details.querySelector(".group-menu");
    menu.style.position = "fixed";
    menu.style.left = Math.max(8, Math.min(rect.left, innerWidth - 300)) + "px";
    menu.style.right = "auto";
    menu.style.top = rect.bottom + 10 + "px";
    menu.style.width = Math.max(rect.width, 280) + "px";
  });
}
function updateField(element) {
  if (isTakeoverReadOnly()) return;
  const { context, host, field } = element.dataset;
  if (!context) return;
  const nic =
    context === "batch"
      ? batchDraft
      : context === "common"
      ? state
      : context === "single"
      ? state.hosts[host].single
      : draft;
  if (!nic) return;
  if (context === "batch") {
    batchDraft[field] = element.value.trim();
    if (element.tagName !== "INPUT") renderOverlay();
    return;
  }
  if (field === "groups")
    nic.groups = element.checked
      ? [...new Set([...nic.groups, element.value])]
      : nic.groups.filter(id => id !== element.value);
  else if (field === "singleGroup") nic.groups = [element.value];
  else if (field === "allGroups")
    nic.groups = element.checked ? GROUPS.map(group => group.id) : [];
  else
    nic[field] = element.dataset.ipPrefix
      ? element.dataset.ipPrefix + "." + element.value.trim()
      : element.value.trim();
  if (field === "network") {
    nic.subnet = network(nic.network).subnets[0].id;
    if (context !== "common") nic.privateIp = "";
  }
  if (field === "subnet" && context !== "common") nic.privateIp = "";
  if (context === "common")
    state.selected.forEach(id => {
      const item = state.hosts[id].single;
      item.network = state.network;
      item.subnet = state.subnet;
      item.privateIp = "";
    });
  errors = [];
  if (context === "drawer") overlay.errors = [];
  if (element.tagName === "INPUT") {
    if (element.type === "checkbox" && context === "single")
      element.closest("details").querySelector("summary span").textContent =
        nic.groups.map(groupName).join("、") || t("placeholder.choose");
    if (element.type === "checkbox" && context === "drawer") {
      layers
        .querySelectorAll('[data-field="groups"]')
        .forEach(box => (box.checked = nic.groups.includes(box.value)));
      const all = layers.querySelector('[data-field="allGroups"]');
      all.checked = nic.groups.length === GROUPS.length;
      all.indeterminate =
        nic.groups.length > 0 && nic.groups.length < GROUPS.length;
    }
    return;
  }
  const scroll = document.getElementById("drawer-scroll")?.scrollTop || 0;
  render();
  if (context === "drawer")
    document.getElementById("drawer-scroll").scrollTop = scroll;
}
document.addEventListener("submit", event => event.preventDefault());
document.addEventListener("change", event => {
  if (event.target.id === "takeover-use-drill-network") {
    handleNetworkInheritanceToggle(event.target.checked);
    return;
  }
  if (event.target.dataset.batchSelect) {
    updateBatchSelection(event.target);
    return;
  }
  updateField(event.target);
});
document.addEventListener("input", event => {
  if (event.target.matches('input[data-context]:not([type="checkbox"])'))
    updateField(event.target);
});
document.addEventListener(
  "toggle",
  event => {
    if (event.target.matches(".group-select")) positionGroupMenus();
  },
  true
);
window.addEventListener("resize", () => {
  closeSelectMenus();
  positionGroupMenus();
});
document.addEventListener(
  "scroll",
  event => {
    if (!event.target.closest?.(".select-menu")) closeSelectMenus();
    positionGroupMenus();
  },
  true
);
document.addEventListener("click", event => {
  const help = event.target.closest("[data-purpose-help]");
  if (help) {
    const purpose = help.dataset.purposeHelp;
    if (activePurposeHelp === purpose && purposeHelpPinned) closePurposeHelp();
    else showPurposeHelp(purpose, true);
    return;
  }
  if (!event.target.closest("[data-purpose-help-item]")) closePurposeHelp();
  if (event.target.closest("[data-navigation]")) event.preventDefault();
  if (event.target.matches("[data-dismiss-drawer]")) {
    closeOverlay();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!event.target.closest(".language-switcher")) closeLanguageMenu();
  if (!event.target.closest(".select-field")) closeSelectMenus();
  if (!event.target.closest(".group-select"))
    document
      .querySelectorAll(".group-select[open]")
      .forEach(details => (details.open = false));
  if (!button || button.disabled) return;
  const { action, host } = button.dataset,
    index = Number(button.dataset.index);
  if (action === "toggle-language") {
    closeSelectMenus();
    toggleLanguageMenu();
    return;
  }
  if (action === "set-language") {
    setLanguage(button.dataset.language);
    return;
  }
  if (action === "purpose-drill" || action === "purpose-takeover") {
    setNetworkPurpose(action === "purpose-drill" ? "drill" : "takeover");
    return;
  }
  if (
    isTakeoverReadOnly() &&
    ([
      "single",
      "multiple",
      "add",
      "edit",
      "remove",
      "apply-nic",
      "apply-batch",
      "toggle-select",
      "select-option"
    ].includes(action) ||
      action.startsWith("batch-"))
  )
    return;

  if (action === "scene-create" || action === "scene-edit") {
    setScene(action === "scene-create" ? "create" : "edit");
    return;
  }
  if (action === "step-boundary") return;
  if (action.startsWith("batch-")) {
    openBatchDialog(action.slice(6));
    return;
  }
  if (action === "apply-batch") {
    applyBatchSettings();
    return;
  }
  if (action === "toggle-select") {
    openSelectMenu(button);
    return;
  }
  if (action === "select-option") {
    updateField({
      dataset: button.dataset,
      value: button.dataset.value,
      tagName: "SELECT"
    });
    return;
  }
  if (action === "single" || action === "multiple") {
    state.mode = action;
    batchSelection.clear();
    errors = [];
    render();
    document.getElementById("tab-" + action)?.focus();
    return;
  }
  if (action === "expand") {
    expanded.has(host) ? expanded.delete(host) : expanded.add(host);
    render();
    return;
  }
  if (action === "hosts") {
    openOverlay({ type: "hosts" });
    return;
  }
  if (action === "add") {
    const nics = state.hosts[host].nics;
    if (nics.length >= maxNics(byHost(host))) return;
    const nic = clone(nics[0]);
    Object.assign(nic, {
      id: uid(),
      privateMode: "auto",
      privateIp: "",
      originalIp: "",
      publicMode: "none"
    });
    nics.push(nic);
    errors = [];
    render();
    return;
  }
  if (action === "edit") {
    draft = clone(state.hosts[host].nics[index]);
    openOverlay({ type: "edit", host, index, errors: [] });
    return;
  }
  if (action === "apply-nic") {
    const messages = validateNic(draft, byHost(overlay.host));
    if (messages.length) {
      overlay.errors = messages;
      toast(messages[0], true);
      return;
    }
    state.hosts[overlay.host].nics[overlay.index] = clone(draft);
    closeOverlay();
    errors = [];
    render();
    return;
  }
  if (action === "remove") {
    if (index === 0) return;
    state.hosts[host].nics.splice(index, 1);
    errors = [];
    render();
    return;
  }
  if (action === "rules") {
    openOverlay({
      type: "rules",
      groups: [...state.hosts[host].nics[index].groups],
      expanded: [],
      direction: "in"
    });
    return;
  }
  if (action === "group-rules") {
    const previous = overlay;
    openOverlay({
      type: "group-rules",
      groups: [button.dataset.group],
      expanded: [button.dataset.group],
      direction: "in",
      previous
    });
    return;
  }
  if (action === "expand-rules") {
    const id = button.dataset.group;
    overlay.expanded = overlay.expanded.includes(id)
      ? overlay.expanded.filter(g => g !== id)
      : [...overlay.expanded, id];
    renderOverlay();
    return;
  }
  if (action === "inbound-rules" || action === "outbound-rules") {
    overlay.direction = action === "outbound-rules" ? "out" : "in";
    renderOverlay();
    return;
  }
  if (action === "save" || action === "validate-create") {
    errors = validateNetworkPlan();
    if (errors.length) {
      toast(errors, true);
      return;
    }
    try {
      localStorage.setItem(
        activeScene === "create" ? CREATE_STORAGE_KEY : STORAGE_KEY,
        JSON.stringify({ version: 2, plan: networkPlans[activeScene] })
      );
    } catch (error) {
      toast(t("prototype.storageUnavailable"), true);
      return;
    }
    savedNetworkPlans[activeScene] = clone(networkPlans[activeScene]);
    bindNetworkState();
    toast(t("prototype.operationSuccess"));
    return;
  }
  if (action === "cancel") {
    networkPlans[activeScene] = clone(savedNetworkPlans[activeScene]);
    const ids = networkPlans[activeScene].drill.selected;
    expandedViews[activeScene] = {
      drill: new Set(ids),
      takeover: new Set(ids)
    };
    bindNetworkState();
    batchSelection.clear();
    errors = [];
    dismissNetworkOverlays();
    render();
    return;
  }
  if (action === "close") closeOverlay();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && activePurposeHelp) {
    event.preventDefault();
    closePurposeHelp();
    return;
  }
  const languageMenu = document.getElementById("language-menu");
  if (event.key === "Escape" && languageMenu && !languageMenu.hidden) {
    event.preventDefault();
    closeLanguageMenu();
    document.getElementById("language-toggle")?.focus();
    return;
  }
  if (
    event.target.dataset.language &&
    ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
  ) {
    event.preventDefault();
    const options = [...languageMenu.querySelectorAll("[data-language]")];
    const index = options.indexOf(event.target);
    options[
      event.key === "Home"
        ? 0
        : event.key === "End"
        ? options.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
          options.length
    ]?.focus();
    return;
  }

  if (event.key === "Escape") {
    closeSelectMenus();
    if (overlay) closeOverlay();
    return;
  }
  if (
    !overlay &&
    event.target.dataset.purpose &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  ) {
    event.preventDefault();
    const purpose =
      event.key === "Home"
        ? "drill"
        : event.key === "End"
        ? "takeover"
        : activePurpose === "drill"
        ? "takeover"
        : "drill";
    if (purpose === "takeover" && networkPlans[activeScene].inheritTakeover)
      return;
    setNetworkPurpose(purpose);
    document.getElementById("purpose-tab-" + purpose).focus();
    return;
  }
  if (
    !overlay &&
    !isTakeoverReadOnly() &&
    ["tab-single", "tab-multiple"].includes(event.target.id) &&
    event.target.getAttribute("role") === "tab" &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  ) {
    event.preventDefault();
    batchSelection.clear();
    state.mode =
      event.key === "Home"
        ? "single"
        : event.key === "End"
        ? "multiple"
        : state.mode === "single"
        ? "multiple"
        : "single";
    render();
    document.getElementById("tab-" + state.mode).focus();
    return;
  }
  if (event.key === "Tab" && overlay) {
    const items = [
      ...layers.querySelectorAll(
        "button:not(:disabled),input:not(:disabled),summary"
      )
    ].filter(el => !el.closest("[hidden]"));
    const first = items[0],
      last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// Context switching changes only the prototype surface, never a workflow step.
function setScene(scene) {
  if (!["edit", "create"].includes(scene) || scene === activeScene) return;
  dismissNetworkOverlays();
  activeScene = scene;
  if (typeof history !== "undefined")
    history.replaceState(null, "", "#" + scene);
  bindNetworkState();
  batchSelection.clear();
  errors = [];
  render();
}
function renderSceneChrome() {
  const creating = activeScene === "create";
  document.body.classList.toggle("scene-create", creating);
  document.body.classList.toggle("scene-edit", !creating);
  document
    .querySelectorAll("[data-scene-only]")
    .forEach(
      element => (element.hidden = element.dataset.sceneOnly !== activeScene)
    );
  document.getElementById("configuration-page-title").textContent = creating
    ? t("drConfig.index")
    : t("drConfig.netsConfig");
  document.title =
    "HyperBDR - " + (creating ? t("drConfig.index") : t("drConfig.netsConfig"));
  document.getElementById("back-to-hosts-button").dataset.action = creating
    ? "step-boundary"
    : "cancel";
  for (const scene of ["edit", "create"]) {
    const link = document.getElementById(
      scene === "create" ? "creation-scene-link" : "editing-scene-link"
    );
    link.classList.toggle("active", activeScene === scene);
    if (activeScene === scene) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.getElementById("single-host-selection-col").hidden = !creating;
  document.getElementById("single-host-selection-header").hidden = !creating;
  document.getElementById("creation-batch-actions").hidden =
    !creating || state.mode !== "single";
  refreshBatchSelectionControls();
}
function refreshBatchSelectionControls() {
  const checked = state.selected.filter(id => batchSelection.has(id));
  const header = document.getElementById("select-all-configuration-hosts");
  header.checked =
    checked.length === state.selected.length && checked.length > 0;
  header.indeterminate =
    checked.length > 0 && checked.length < state.selected.length;
  document
    .querySelectorAll('[data-batch-select]:not([data-batch-select="all"])')
    .forEach(
      box => (box.checked = batchSelection.has(box.dataset.batchSelect))
    );
  for (const id of [
    "batch-private-ip-button",
    "batch-public-ip-button",
    "batch-security-group-button"
  ])
    document.getElementById(id).disabled =
      isTakeoverReadOnly() || checked.length === 0;
}
function updateBatchSelection(element) {
  if (isTakeoverReadOnly()) return;
  if (activeScene !== "create" || state.mode !== "single") return;
  const id = element.dataset.batchSelect;
  if (id === "all")
    batchSelection = element.checked ? new Set(state.selected) : new Set();
  else if (state.selected.includes(id))
    element.checked ? batchSelection.add(id) : batchSelection.delete(id);
  refreshBatchSelectionControls();
}
let batchDraft = null;
const BATCH_TITLES = {
  private: "drConfig.batchPrivateIp",
  public: "drConfig.batchPublicIp",
  security: "drConfig.batchSecurityGroup"
};
const BATCH_TIPS = {
  private: "drConfig.batchPrivateIpTip",
  public: "drConfig.batchPublicIpTip"
};
function openBatchDialog(kind) {
  if (isTakeoverReadOnly()) return;
  const targets = state.selected.filter(id => batchSelection.has(id));
  if (
    activeScene !== "create" ||
    state.mode !== "single" ||
    !targets.length ||
    !BATCH_TITLES[kind]
  )
    return;
  batchDraft = {
    privateMode: "original",
    publicMode: "none",
    singleGroup: GROUPS[0].id,
    bandwidth: ""
  };
  openOverlay({ type: "batch", kind, targets });
}
function renderBatchDialog() {
  const ctx = { type: "batch" },
    kind = overlay.kind;
  let form = "";
  if (kind === "private")
    form = `<div class="form-line"><label class="required">${t(
      "drConfig.private_ip"
    )}${t("symbol.colon")}</label><div class="field">${selectField(
      ctx,
      "privateMode",
      batchDraft.privateMode,
      localizedOptions(PRIVATE_MODES),
      t("prototype.batchPrivateAssignment")
    )}<p class="hint">${t(BATCH_TIPS.private)}</p></div></div>`;
  if (kind === "public")
    form = `<div class="form-line"><label class="required">${t(
      "drConfig.public_ip"
    )}${t("symbol.colon")}</label><div class="field">${selectField(
      ctx,
      "publicMode",
      batchDraft.publicMode,
      localizedOptions(PUBLIC_MODES),
      t("prototype.batchPublicAssignment")
    )}<p class="hint">${t(BATCH_TIPS.public)}</p></div></div>${
      batchDraft.publicMode === "new"
        ? `<div class="form-line"><label class="required">${t(
            "drConfig.request"
          )}${t("symbol.colon")}</label><div class="field">${textField(
            ctx,
            "bandwidth",
            batchDraft.bandwidth,
            t("prototype.batchBandwidth"),
            t("prototype.bandwidthPlaceholder")
          )}</div></div>`
        : ""
    }`;
  if (kind === "security")
    form = `<div class="form-line"><label class="required">${t(
      "drConfig.securityGroup"
    )}${t("symbol.colon")}</label><div class="field">${selectField(
      ctx,
      "singleGroup",
      batchDraft.singleGroup,
      GROUPS.map(g => [g.id, g.name]),
      t("prototype.batchSecurityGroup")
    )}</div></div>`;
  layers.innerHTML = `<div class="batch-dialog-backdrop"><section id="batch-network-dialog" class="batch-dialog" role="dialog" aria-modal="true" aria-labelledby="batch-network-title">
    <header class="batch-dialog-header"><h2 id="batch-network-title">${t(
      BATCH_TITLES[kind]
    )}</h2><button class="close" type="button" data-action="close" aria-label="${t(
    "common.close"
  )}">×</button></header>
    <div class="batch-dialog-body"><p class="batch-warning">${t(
      "drConfig.batchPolicyTip"
    )}</p>
    <div class="form-line batch-host-summary"><label>${t("drConfig.hosts")}${t(
    "symbol.colon"
  )}</label><div class="field">${selectedHostsSummary(
    overlay.targets.length
  )}${t("symbol.period")}</div></div>
    <form id="batch-network-form" autocomplete="off" novalidate>${form}</form></div>
    <footer class="batch-dialog-footer"><button class="btn" type="button" data-action="close">${t(
      "table.cancel"
    )} </button><button id="apply-batch-network-button" class="btn primary" type="button" data-action="apply-batch">${t(
    "table.submit"
  )} </button></footer>
  </section></div>`;
}
function applyBatchSettings() {
  if (isTakeoverReadOnly()) return;
  if (overlay?.type !== "batch" || activeScene !== "create" || !batchDraft)
    return;
  const { kind, targets } = overlay;
  if (
    kind === "private" &&
    !PRIVATE_MODES.some(mode => mode[0] === batchDraft.privateMode)
  )
    return;
  if (kind === "public") {
    if (!PUBLIC_MODES.some(mode => mode[0] === batchDraft.publicMode)) return;
    if (
      batchDraft.publicMode === "new" &&
      (!Number.isInteger(Number(batchDraft.bandwidth)) ||
        Number(batchDraft.bandwidth) < 1 ||
        Number(batchDraft.bandwidth) > 300)
    ) {
      toast(t("prototype.bandwidthRangeError"), true);
      return;
    }
  }
  if (
    kind === "security" &&
    !GROUPS.some(group => group.id === batchDraft.singleGroup)
  )
    return;
  targets
    .filter(id => state.selected.includes(id))
    .forEach(id => {
      const nic = state.hosts[id].single;
      if (kind === "private") {
        nic.privateMode = batchDraft.privateMode;
        nic.privateIp = "";
        nic.originalIp = "";
      }
      if (kind === "public") {
        nic.publicMode = batchDraft.publicMode;
        if (batchDraft.publicMode === "new")
          nic.bandwidth = batchDraft.bandwidth;
      }
      if (kind === "security") nic.groups = [batchDraft.singleGroup];
    });
  closeOverlay();
  batchDraft = null;
  errors = [];
  render();
}

// Network-purpose state is data-only; visible read-only controls are a second defense.
function wrapLegacyNetwork(configuration) {
  return { inheritTakeover: true, drill: configuration, takeover: null };
}
function validStoredPlan(plan, scene) {
  if (
    !plan ||
    typeof plan.inheritTakeover !== "boolean" ||
    !validStoredState(plan.drill, scene)
  )
    return false;
  if (plan.takeover !== null && !validStoredState(plan.takeover, scene))
    return false;
  if (!plan.inheritTakeover && !plan.takeover) return false;
  return (
    plan.takeover === null ||
    JSON.stringify(plan.takeover.selected) ===
      JSON.stringify(plan.drill.selected)
  );
}
function loadNetworkPlan(key, scene, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    if (stored?.version === 2 && validStoredPlan(stored.plan, scene))
      return stored.plan;
    // Existing single-network drafts become the drill network without losing values.
    if (stored?.version === 1 && validStoredState(stored.state, scene))
      return wrapLegacyNetwork(stored.state);
  } catch (error) {
    /* Storage being unavailable must not prevent editing the prototype. */
  }
  return wrapLegacyNetwork(fallback);
}
function isTakeoverReadOnly() {
  return (
    activePurpose === "takeover" && networkPlans[activeScene].inheritTakeover
  );
}
function bindNetworkState() {
  activePurpose = purposeViews[activeScene];
  const key =
    activePurpose === "takeover" && !networkPlans[activeScene].inheritTakeover
      ? "takeover"
      : "drill";
  state = networkPlans[activeScene][key];
  saved = savedNetworkPlans[activeScene][key] || clone(state);
  expanded = expandedViews[activeScene][activePurpose];
}
// Independent help triggers remain usable even when their network tab is disabled.
let activePurposeHelp = null;
let purposeHelpPinned = false;
let purposeHelpHideTimer;
function closePurposeHelp() {
  clearTimeout(purposeHelpHideTimer);
  if (activePurposeHelp) {
    document.getElementById("purpose-tooltip-" + activePurposeHelp).hidden = true;
    document.getElementById("purpose-help-" + activePurposeHelp)
      .setAttribute("aria-expanded", "false");
  }
  activePurposeHelp = null;
  purposeHelpPinned = false;
}
function showPurposeHelp(purpose, pinned = false) {
  if (!["drill", "takeover"].includes(purpose)) return;
  if (activePurposeHelp !== purpose) closePurposeHelp();
  clearTimeout(purposeHelpHideTimer);
  activePurposeHelp = purpose;
  purposeHelpPinned = purposeHelpPinned || pinned;
  document.getElementById("purpose-tooltip-" + purpose).hidden = false;
  document.getElementById("purpose-help-" + purpose)
    .setAttribute("aria-expanded", "true");
}
document.addEventListener("mouseover", event => {
  const help = event.target.closest("[data-purpose-help]");
  if (help) showPurposeHelp(help.dataset.purposeHelp);
  const item = event.target.closest("[data-purpose-help-item]");
  if (item?.dataset.purposeHelpItem === activePurposeHelp)
    clearTimeout(purposeHelpHideTimer);
});
document.addEventListener("mouseout", event => {
  const item = event.target.closest("[data-purpose-help-item]");
  if (!item || item.dataset.purposeHelpItem !== activePurposeHelp ||
      item.contains(event.relatedTarget) || purposeHelpPinned ||
      item.contains(document.activeElement)) return;
  // Allow crossing the arrow gap to read/hover the tooltip without dismissing it.
  purposeHelpHideTimer = setTimeout(closePurposeHelp, 150);
});
document.addEventListener("focusin", event => {
  const help = event.target.closest("[data-purpose-help]");
  if (help) showPurposeHelp(help.dataset.purposeHelp);
});
document.addEventListener("focusout", event => {
  const item = event.target.closest("[data-purpose-help-item]");
  if (item?.dataset.purposeHelpItem === activePurposeHelp &&
      !item.contains(event.relatedTarget)) closePurposeHelp();
});
function dismissNetworkOverlays() {
  closePurposeHelp();
  closeSelectMenus();
  overlay = null;
  draft = null;
  batchDraft = null;
  lastFocus = null;
  renderOverlay();
}
function setNetworkPurpose(purpose) {
  if (!["drill", "takeover"].includes(purpose) || purpose === activePurpose)
    return;
  dismissNetworkOverlays();
  purposeViews[activeScene] = purpose;
  bindNetworkState();
  batchSelection.clear();
  errors = [];
  render();
}
function setTakeoverInheritance(inherit) {
  if (typeof inherit !== "boolean") return;
  const plan = networkPlans[activeScene];
  if (plan.inheritTakeover === inherit) return;
  dismissNetworkOverlays();
  if (!inherit && plan.takeover === null) plan.takeover = clone(plan.drill);
  // Re-enabling inheritance never discards or overwrites the independent draft.
  plan.inheritTakeover = inherit;
  bindNetworkState();
  batchSelection.clear();
  errors = [];
  render();
}
function handleNetworkInheritanceToggle(inherit) {
  setTakeoverInheritance(inherit);
  if (inherit && activePurpose === "takeover") setNetworkPurpose("drill");
}
function renderNetworkPurpose() {
  const inherit = networkPlans[activeScene].inheritTakeover;
  const panel = document.getElementById("network-purpose-content");
  panel.setAttribute("aria-labelledby", "purpose-tab-" + activePurpose);
  document.getElementById("network-purpose-switcher").dataset.inherit = String(
    inherit
  );
  for (const purpose of ["drill", "takeover"]) {
    const tab = document.getElementById("purpose-tab-" + purpose);
    const disabled = purpose === "takeover" && inherit;
    tab.setAttribute("aria-selected", String(purpose === activePurpose));
    tab.setAttribute("aria-disabled", String(disabled));
    tab.disabled = disabled;
    tab.tabIndex = purpose === activePurpose && !disabled ? 0 : -1;
    tab.title = disabled ? t("prototype.takeoverNetworkLockedHint") : "";
  }
  document.getElementById("takeover-use-drill-network").checked = inherit;
}
function applyNetworkReadOnly() {
  const readOnly = isTakeoverReadOnly();
  const panel = document.getElementById("network-purpose-content");
  panel.dataset.readOnly = String(readOnly);
  document.getElementById("tab-single").disabled = readOnly;
  document.getElementById("tab-multiple").disabled = readOnly;
  panel
    .querySelectorAll("[data-batch-select]")
    .forEach(control => (control.disabled = readOnly));
  if (readOnly) {
    panel
      .querySelectorAll(
        'input[data-context],button[data-context],[data-action="add"],[data-action="edit"],[data-action="remove"]'
      )
      .forEach(control => (control.disabled = true));
  }
}

function messageMarkup(key) {
  return esc(t(key))
    .replace(/&lt;br\s*\/?&gt;\s*/gi, "<br>")
    .replace(/\n/g, "<br>");
}
function onLanguageChange() {
  const scroll = document.getElementById("drawer-scroll")?.scrollTop || 0;
  const batchScroll =
    document.querySelector(".batch-dialog-body")?.scrollTop || 0;
  clearTimeout(toastTimer);
  const notification = document.getElementById("network-notification");
  if (notification) notification.innerHTML = "";
  render();
  const drawer = document.getElementById("drawer-scroll");
  if (drawer) drawer.scrollTop = scroll;
  const batchBody = document.querySelector(".batch-dialog-body");
  if (batchBody) batchBody.scrollTop = batchScroll;
}

// Direct links can open either surface without introducing another page.
if (typeof location !== "undefined" && location.hash === "#create") {
  activeScene = "create";
  bindNetworkState();
}

render();
