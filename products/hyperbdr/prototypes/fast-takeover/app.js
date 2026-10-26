const hosts = [
  {
    id: "host-a",
    name: "ZhangTianJie-Ubuntu-5G-D",
    ip: "192.168.8.23",
    ipType: "主机",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:04:20...",
    snapshot: "2026-07-15 11:04:20",
    launchState: "暂无任务",
    health: "正常",
  },
  {
    id: "host-b",
    name: "ZhangTianJie-Ubuntu-5G-B",
    ip: "192.168.10.3",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:04:30...",
    snapshot: "2026-07-15 11:04:30",
    launchState: "暂无任务",
    health: "正常",
  },
  {
    id: "host-c",
    name: "ZhangTianJie-Ubuntu-5G-C",
    ip: "192.168.10.3",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "[140000] We are sorry to inform...",
    taskState: "同步失败",
    syncErrorCode: "140000",
    snapshot: "2026-07-15 11:04:09",
    launchState: "暂无任务",
    health: "正常",
  },
  {
    id: "host-d",
    name: "ZhangTianJie-Ubuntu-5G-E",
    ip: "192.168.10.4",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步中...",
    syncProgress: 0,
    taskState: "上次快照：2026-07-15 11:05:12...",
    snapshot: "2026-07-15 11:05:12",
    launchState: "暂无任务",
    health: "正常",
  },
  {
    id: "host-e",
    name: "ZhangTianJie-Ubuntu-5G-F",
    ip: "192.168.10.5",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:06:08...",
    snapshot: "2026-07-15 11:06:08",
    launchState: "启动中...",
    takeoverMode: "snapshot",
    health: "正常",
  },
  {
    id: "host-f",
    name: "ZhangTianJie-Ubuntu-5G-G",
    ip: "192.168.10.6",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "[030013] Issue: Data...",
    taskState: "同步失败",
    syncErrorCode: "030013",
    snapshot: "2026-07-15 11:06:45",
    launchState: "启动中...",
    takeoverMode: "raw",
    health: "正常",
  },
  {
    id: "host-g",
    name: "ZhangTianJie-Ubuntu-5G-H",
    ip: "192.168.10.7",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:07:19...",
    snapshot: "2026-07-15 11:07:19",
    launchState: "启动失败",
    takeoverMode: "raw",
    health: "正常",
  },
  {
    id: "host-h",
    name: "ZhangTianJie-Ubuntu-5G-I",
    ip: "192.168.10.8",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:08:03...",
    snapshot: "2026-07-15 11:08:03",
    launchState: "启动成功",
    takeoverMode: "raw",
    health: "正常",
  },
  {
    id: "host-i",
    name: "ZhangTianJie-Ubuntu-5G-J",
    ip: "192.168.10.9",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:08:41...",
    snapshot: "2026-07-15 11:08:41",
    launchState: "启动成功",
    takeoverMode: "snapshot",
    health: "正常",
  },
  {
    id: "host-j",
    name: "ZhangTianJie-Ubuntu-5G-K",
    ip: "192.168.10.11",
    ipType: "ESXi",
    storage: "块存储",
    platform: "OpenStack",
    os: "Linux",
    hostState: "同步快照完成",
    taskState: "上次快照：2026-07-15 11:09:26...",
    snapshot: "2026-07-15 11:09:26",
    launchState: "启动失败",
    takeoverMode: "snapshot",
    health: "正常",
  },
];

hosts.forEach((host) => {
  if (typeof host.policyActive !== "boolean") {
    host.policyActive = host.takeoverMode !== "raw";
  }
});

const selectedIds = new Set();

const hostTableBody = document.querySelector("#hostTableBody");
const selectAll = document.querySelector("#selectAll");
const selectedCount = document.querySelector("#selectedCount");
const totalCount = document.querySelector("#totalCount");
const immediateSyncButton = document.querySelector("#immediateSyncButton");
const drillButton = document.querySelector("#drillButton");
const takeoverButton = document.querySelector("#takeoverButton");
const legacyTakeoverButton = document.querySelector("#legacyTakeoverButton");
const syncModalOverlay = document.querySelector("#syncModalOverlay");
const syncModalHostBody = document.querySelector("#syncModalHostBody");
const syncModalCount = document.querySelector("#syncModalCount");
const syncModalClose = document.querySelector("#syncModalClose");
const syncModalCancel = document.querySelector("#syncModalCancel");
const syncModalConfirm = document.querySelector("#syncModalConfirm");
const syncAdvancedToggle = document.querySelector("#syncAdvancedToggle");
const syncAdvancedContent = document.querySelector("#syncAdvancedContent");
const forceFullSyncCheckbox = document.querySelector("#forceFullSyncCheckbox");
const rawFullSyncNotice = document.querySelector("#rawFullSyncNotice");
const modalOverlay = document.querySelector("#modalOverlay");
const modalHostBody = document.querySelector("#modalHostBody");
const takeoverTableScroll = modalOverlay.querySelector(".modal-table-scroll");
const modalCount = document.querySelector("#modalCount");
const modalClose = document.querySelector("#modalClose");
const modalCancel = document.querySelector("#modalCancel");
const modalConfirm = document.querySelector("#modalConfirm");
const advancedToggle = document.querySelector("#advancedToggle");
const legacyTakeoverModalOverlay = document.querySelector("#legacyTakeoverModalOverlay");
const legacyTakeoverTableScrolls = [...legacyTakeoverModalOverlay.querySelectorAll(".quick-takeover-list-scroll")];
const quickTakeoverSummary = document.querySelector("#quickTakeoverSummary");
const legacyTakeoverModalClose = document.querySelector("#legacyTakeoverModalClose");
const legacyTakeoverModalCancel = document.querySelector("#legacyTakeoverModalCancel");
const legacyTakeoverModalConfirm = document.querySelector("#legacyTakeoverModalConfirm");
const quickPolicyStep = document.querySelector("#quickPolicyStep");
const quickTakeoverStep = document.querySelector("#quickTakeoverStep");
const quickPolicyStepIndicator = document.querySelector("#quickPolicyStepIndicator");
const quickTakeoverStepIndicator = document.querySelector("#quickTakeoverStepIndicator");
const quickPolicySummary = document.querySelector("#quickPolicySummary");
const quickPolicyHostBody = document.querySelector("#quickPolicyHostBody");
const quickUnbindPoliciesButton = document.querySelector("#quickUnbindPoliciesButton");
const quickTakeoverBack = document.querySelector("#quickTakeoverBack");
const quickTakeoverNext = document.querySelector("#quickTakeoverNext");
const quickTakeoverSelectAll = document.querySelector("#quickTakeoverSelectAll");
const quickTakeoverHostBody = document.querySelector("#quickTakeoverHostBody");
const quickTakeoverStatusHeader = document.querySelector("#quickTakeoverStatusHeader");
const quickTakeoverStatusSortButton = document.querySelector("#quickTakeoverStatusSortButton");
const drillModalOverlay = document.querySelector("#drillModalOverlay");
const drillModalHostBody = document.querySelector("#drillModalHostBody");
const drillModalCount = document.querySelector("#drillModalCount");
const drillModalClose = document.querySelector("#drillModalClose");
const drillModalCancel = document.querySelector("#drillModalCancel");
const drillModalConfirm = document.querySelector("#drillModalConfirm");
const drillAdvancedToggle = document.querySelector("#drillAdvancedToggle");
const drillExistingRawNotice = document.querySelector("#drillExistingRawNotice");
const moreMenuWrap = document.querySelector("#moreMenuWrap");
const moreButton = document.querySelector("#moreButton");
const moreMenu = document.querySelector("#moreMenu");
const unregisterButton = document.querySelector("#unregisterButton");
const cleanupButton = document.querySelector("#cleanupButton");
const cleanupConfirmOverlay = document.querySelector("#cleanupConfirmOverlay");
const cleanupConfirmHostBody = document.querySelector("#cleanupConfirmHostBody");
const cleanupConfirmCount = document.querySelector("#cleanupConfirmCount");
const cleanupConfirmClose = document.querySelector("#cleanupConfirmClose");
const cleanupConfirmCancel = document.querySelector("#cleanupConfirmCancel");
const cleanupConfirmSubmit = document.querySelector("#cleanupConfirmSubmit");
const cleanupConfirmAdvancedToggle = document.querySelector("#cleanupConfirmAdvancedToggle");
const cleanupConfirmAdvancedContent = document.querySelector("#cleanupConfirmAdvancedContent");
const cleanupConfirmAcknowledgement = document.querySelector("#cleanupConfirmAcknowledgement");
const cleanupRawTakeoverNotice = document.querySelector("#cleanupRawTakeoverNotice");
const unregisterConfirmOverlay = document.querySelector("#unregisterConfirmOverlay");
const unregisterConfirmHostBody = document.querySelector("#unregisterConfirmHostBody");
const unregisterConfirmCount = document.querySelector("#unregisterConfirmCount");
const unregisterConfirmClose = document.querySelector("#unregisterConfirmClose");
const unregisterConfirmCancel = document.querySelector("#unregisterConfirmCancel");
const unregisterConfirmSubmit = document.querySelector("#unregisterConfirmSubmit");
const unregisterConfirmAcknowledgement = document.querySelector("#unregisterConfirmAcknowledgement");
const taskDrawerOverlay = document.querySelector("#taskDrawerOverlay");
const taskDrawerClose = document.querySelector("#taskDrawerClose");
const drawerHostName = document.querySelector("#drawerHostName");
const drawerDescription = document.querySelector("#drawerDescription");
const drawerSnapshotSource = document.querySelector("#drawerSnapshotSource");
const drawerSnapshotTime = document.querySelector("#drawerSnapshotTime");
const drawerParameterStep = document.querySelector("#drawerParameterStep");
const drawerCancelPolicyStep = document.querySelector("#drawerCancelPolicyStep");
const drawerFinalStep = document.querySelector("#drawerFinalStep");
const drawerFinalResultText = document.querySelector("#drawerFinalResultText");
const standardTaskTimeline = document.querySelector("#standardTaskTimeline");
const errorTaskTimeline = document.querySelector("#errorTaskTimeline");

const OPERATION_DELAY_MS = 15000;
const SYNC_OPERATION_DELAY_MS = 60000;
const SYNC_PROGRESS_INTERVAL_MS = 1000;
const QUICK_TAKEOVER_SYNC_DELAY_MS = 10000;
const QUICK_TAKEOVER_SYNC_HOST_ID = "host-b";
const SNAPSHOT_EXAMPLE_ID = "50db23f3-48a2-4c59-836f-921304b900ef";
const SYNC_SNAPSHOT_EXAMPLE_ID = "2e8afe3-63c6-4b42-a73e-0c561e72d7be";
const TAKEOVER_MODE_RAW = "raw";
const TAKEOVER_MODE_SNAPSHOT = "snapshot";
const TAKEOVER_SOURCE_CURRENT = "current";
const TAKEOVER_SOURCE_LEGACY = "legacy";
let activeDrawerHostId = null;
let activeDrawerTriggerClass = null;
let immediateSyncBatchIds = new Set();
let quickTakeoverBatchIds = new Set();
let activeQuickTakeoverStep = 1;
let quickTakeoverSyncTimer = null;
let quickTakeoverStatusSortDirection = "ascending";
let pendingCleanupIds = new Set();
let pendingUnregisterIds = new Set();

function svgIcon(name, className = "") {
  return `<svg class="icon ${className}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

function splitHostName(name) {
  const breakAt = name.indexOf("-");
  if (breakAt < 0) return [name, ""];
  return [name.slice(0, breakAt + 1), name.slice(breakAt + 1)];
}

function hostNameMarkup(host) {
  const [lineOne, lineTwo] = splitHostName(host.name);
  const primaryOs = host.os === "Windows" ? svgIcon("windows", "host-os-icon windows") : svgIcon("linux", "host-os-icon linux");
  return `
    <div class="host-name">
      <span class="os-stack" aria-hidden="true">
        ${primaryOs}
        ${svgIcon("vm", "host-os-icon vm")}
      </span>
      <span>${lineOne}<br>${lineTwo}</span>
    </div>`;
}

function cloudMarkup(host) {
  return `<span class="cloud-platform">${svgIcon("openstack", "openstack-icon")}${host.platform}</span>`;
}

function healthMarkup(host) {
  return `<span class="status-line"><span class="dot green"></span>${host.health}</span>`;
}

function isSyncInProgress(host) {
  return host.hostState === "同步中..." || host.hostState === "同步中(全量)...";
}

function isHostStateInProgress(host) {
  return isSyncInProgress(host) || host.hostState === "解除注册中...";
}

function isLaunchStateInProgress(host) {
  return host.launchState.startsWith("启动中") || host.launchState.startsWith("清理中");
}

function isRawTakeoverState(host) {
  return host.takeoverMode === TAKEOVER_MODE_RAW;
}

function hasActivePolicy(host) {
  return host.policyActive !== false;
}

function isRawCleanupComplete(host) {
  return isRawTakeoverState(host) && host.launchState === "清理完成";
}

function isSyncFailed(host) {
  return host.syncErrorCode === "030013" || host.syncErrorCode === "140000";
}

function canUseGatewayRawRecovery(host) {
  return !isSyncInProgress(host);
}

function getSyncProgress(host) {
  const progress = Number(host.syncProgress);
  return Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
}

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getSnapshotHistory(host) {
  if (Array.isArray(host.snapshotHistory) && host.snapshotHistory.length > 0) {
    return [...host.snapshotHistory];
  }
  const history = [host.snapshot];
  const earlierTime = new Date(host.snapshot.replace(" ", "T"));
  if (!Number.isNaN(earlierTime.getTime())) {
    earlierTime.setMinutes(earlierTime.getMinutes() - 5);
    history.push(formatTimestamp(earlierTime));
  }
  return history;
}

function addSnapshotToHistory(host, snapshotTime) {
  const previousSnapshots = getSnapshotHistory(host);
  host.snapshot = snapshotTime;
  host.snapshotHistory = [
    snapshotTime,
    ...previousSnapshots.filter((timePoint) => timePoint !== snapshotTime),
  ];
}

function isUnregistering(host) {
  return host.hostState === "解除注册中...";
}

function isCleanupState(host) {
  return host.launchState.startsWith("清理中") || host.launchState.startsWith("清理完成");
}

function canViewLaunchDetails(host) {
  return host.launchState !== "暂无任务" && !isCleanupState(host);
}

function hostStateOnlyMarkup(host) {
  const isError = host.hostState !== "同步快照完成" && !isHostStateInProgress(host);
  const dotClass = isError ? "red" : (isHostStateInProgress(host) ? "spinner" : "green");
  const displayState = isSyncFailed(host) ? "同步失败" : host.hostState;
  return `<div class="status-block${isError ? " error" : ""}"><span class="status-line"><span class="dot ${dotClass}"></span>${displayState}</span></div>`;
}

function renderHosts() {
  hostTableBody.innerHTML = hosts.map((host) => {
    const isNormalHostState = host.hostState === "同步快照完成" || isHostStateInProgress(host);
    const hostStateDot = isHostStateInProgress(host) ? "spinner" : "green";
    const canViewSyncDetails = host.hostState === "同步快照完成" || isSyncInProgress(host);
    const hostStatus = isNormalHostState
      ? `<div class="status-block"><span class="status-line"><span class="dot ${hostStateDot}"></span>${host.hostState}</span>${canViewSyncDetails ? `<button class="detail-link host-sync-detail-link" type="button" data-host-id="${host.id}">&gt;点击查看详情</button>` : ""}</div>`
      : `<div class="status-block error"><span class="status-line"><span class="dot red"></span>${host.hostState}</span><button class="detail-link host-error-detail-link" type="button" data-host-id="${host.id}">&gt;点击查看详情</button></div>`;
    const syncProgress = getSyncProgress(host);
    const taskStatus = isSyncInProgress(host)
      ? `<div class="status-block sync-task-progress">
          <div class="task-progress-row" aria-label="同步进度 ${syncProgress}%">
            <span class="task-progress-track"><span class="task-progress-fill" style="width: ${syncProgress}%"></span></span>
            <span class="task-progress-value">${syncProgress}%</span>
          </div>
          <button class="detail-link task-sync-progress-detail-link" type="button" data-host-id="${host.id}">&gt;点击查看详情</button>
        </div>`
      : (host.taskState === "同步失败"
        ? `<div class="status-block task-error"><span class="status-line"><span class="dot red"></span>${host.taskState}</span><button class="detail-link task-error-detail-link" type="button" data-host-id="${host.id}">&gt;点击查看详情</button></div>`
        : `<span class="status-line"><span class="dot green"></span>${host.taskState}</span>`);
    const launchDot = isLaunchStateInProgress(host)
      ? "spinner"
      : (host.launchState.startsWith("启动成功") || host.launchState.startsWith("清理完成")
        ? "green"
        : (host.launchState.startsWith("启动失败") ? "red" : "gray"));
    const policyActive = hasActivePolicy(host);
    const policyDot = policyActive ? "green" : "gray";
    const policyText = policyActive ? "5 小时" : "无策略";
    const osIcon = host.os === "Windows" ? svgIcon("windows", "windows-logo") : svgIcon("linux", "linux-logo");
    const launchStatus = `
      <div class="status-block">
        <span class="status-line"><span class="dot ${launchDot}"></span>${host.launchState}</span>
        ${canViewLaunchDetails(host) ? `<button class="detail-link launch-detail-link" type="button" data-host-id="${host.id}">&gt;点击查看详情</button>` : ""}
      </div>`;

    return `
      <tr data-host-id="${host.id}">
        <td><input class="row-checkbox" type="checkbox" aria-label="选择 ${host.name}" ${selectedIds.has(host.id) ? "checked" : ""}></td>
        <td>${hostNameMarkup(host)}</td>
        <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
        <td>${host.storage}</td>
        <td>${cloudMarkup(host)}</td>
        <td><span class="os-type">${osIcon}${host.os}</span></td>
        <td>${hostStatus}</td>
        <td>${taskStatus}</td>
        <td>${launchStatus}</td>
        <td>${healthMarkup(host)}</td>
        <td><span class="status-line"><span class="dot ${policyDot}"></span>${policyText}</span></td>
      </tr>`;
  }).join("");

  hostTableBody.querySelectorAll(".row-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const hostId = event.target.closest("tr").dataset.hostId;
      if (event.target.checked) selectedIds.add(hostId);
      else selectedIds.delete(hostId);
      updateSelectionUi();
    });
  });

  hostTableBody.querySelectorAll(".launch-detail-link").forEach((detailButton) => {
    detailButton.addEventListener("click", () => {
      const host = hosts.find((item) => item.id === detailButton.dataset.hostId);
      if (!host || !canViewLaunchDetails(host)) return;
      if (host.launchState === "启动失败" && isRawTakeoverState(host)) {
        openRawTakeoverErrorDrawer(host, "launch-detail-link");
      } else {
        openTaskDrawer(host, "launch-detail-link");
      }
    });
  });

  hostTableBody.querySelectorAll(".host-sync-detail-link").forEach((detailButton) => {
    detailButton.addEventListener("click", () => {
      const host = hosts.find((item) => item.id === detailButton.dataset.hostId);
      if (!host) return;
      if (isSyncInProgress(host)) openSyncProgressDrawer(host, "host-sync-detail-link");
      else if (host.hostState === "同步快照完成") openSnapshotCompleteDrawer(host, "host-sync-detail-link");
    });
  });

  hostTableBody.querySelectorAll(".task-sync-progress-detail-link").forEach((detailButton) => {
    detailButton.addEventListener("click", () => {
      const host = hosts.find((item) => item.id === detailButton.dataset.hostId);
      if (host && isSyncInProgress(host)) openSyncProgressDrawer(host, "task-sync-progress-detail-link");
    });
  });

  hostTableBody.querySelectorAll(".host-error-detail-link, .task-error-detail-link").forEach((detailButton) => {
    detailButton.addEventListener("click", () => {
      const host = hosts.find((item) => item.id === detailButton.dataset.hostId);
      if (!host) return;
      const triggerClass = detailButton.classList.contains("host-error-detail-link")
        ? "host-error-detail-link"
        : "task-error-detail-link";
      openSyncErrorDrawer(host, triggerClass);
    });
  });

  updateSelectionUi();
}

function getSelectedHosts() {
  return hosts.filter((host) => selectedIds.has(host.id));
}

function getImmediateSyncBatchHosts() {
  return hosts.filter((host) => immediateSyncBatchIds.has(host.id));
}

function getQuickTakeoverBatchHosts() {
  return hosts.filter((host) => quickTakeoverBatchIds.has(host.id));
}

function canTakeOver() {
  const selectedHosts = getSelectedHosts();
  return selectedHosts.length > 0 && selectedHosts.every((host) => (
    (host.hostState === "同步快照完成" || isSyncInProgress(host) || isSyncFailed(host))
    && !isLaunchStateInProgress(host)
  ));
}

function canQuickTakeOver() {
  return canTakeOver() && getSelectedHosts().every(canUseGatewayRawRecovery);
}

function canSyncImmediately() {
  const selectedHosts = getSelectedHosts();
  return selectedHosts.length > 0 && selectedHosts.every((host) => (
    !isSyncInProgress(host)
    && !isUnregistering(host)
    && (!isRawTakeoverState(host) || isRawCleanupComplete(host))
  ));
}

function canUnregisterHosts() {
  const selectedHosts = getSelectedHosts();
  return selectedHosts.length > 0 && selectedHosts.every((host) => (
    !isHostStateInProgress(host) && !isLaunchStateInProgress(host)
  ));
}

function canCleanupHosts() {
  const selectedHosts = getSelectedHosts();
  return selectedHosts.length > 0 && selectedHosts.every((host) => host.launchState === "启动成功");
}

function closeMoreMenu() {
  moreMenu.hidden = true;
  moreButton.setAttribute("aria-expanded", "false");
}

function showTaskDrawer(host, triggerClass) {
  closeMoreMenu();
  activeDrawerHostId = host.id;
  activeDrawerTriggerClass = triggerClass;
  drawerHostName.textContent = host.name;
  taskDrawerOverlay.hidden = false;
  document.body.classList.add("drawer-open");
  taskDrawerClose.focus();
}

function openTaskDrawer(host, triggerClass) {
  drawerDescription.textContent = "开始构建实例";
  standardTaskTimeline.hidden = false;
  errorTaskTimeline.hidden = true;
  errorTaskTimeline.innerHTML = "";
  delete errorTaskTimeline.dataset.mode;
  drawerSnapshotTime.textContent = host.takeoverRecoveryPoint || host.snapshot;
  drawerSnapshotSource.textContent = isRawTakeoverState(host)
    ? "使用云同步网关目标盘接管"
    : `使用的快照ID是${SNAPSHOT_EXAMPLE_ID}`;
  const showCancelPolicyStep = isRawTakeoverState(host);
  drawerCancelPolicyStep.hidden = !showCancelPolicyStep;
  drawerParameterStep.classList.toggle("has-cancel-policy", showCancelPolicyStep);

  drawerFinalStep.classList.remove("loading", "completed", "failed");
  if (host.launchState.startsWith("启动成功")) {
    drawerFinalStep.classList.add("completed");
    drawerFinalResultText.textContent = "系统启动完成";
  } else if (host.launchState.startsWith("启动失败")) {
    drawerFinalStep.classList.add("failed");
    drawerFinalResultText.textContent = "系统启动失败";
  } else {
    drawerFinalStep.classList.add("loading");
    drawerFinalResultText.textContent = "等待系统启动";
  }

  showTaskDrawer(host, triggerClass);
}

function errorDetailsMarkup(code, message, reason, solution, showSupport = true) {
  return `
    <div class="error-details">
      <div class="error-code-row">
        <span class="error-mini-marker">×</span>
        <div class="error-message">
          <p class="error-code">[${code}] Issue:</p>
          <p class="error-copy">${message}</p>
          <p class="error-label">Possible reasons:</p>
          <p class="error-copy">${reason}</p>
          <p class="error-label">Solution:</p>
          <p>${solution}</p>
        </div>
      </div>
      ${showSupport ? `<div class="error-support">
        <strong>失败原因参考：</strong>
        <p>如果需要任何协助，请访问 https://support.oneprocloud.com，注册或登录后提交工单获取支持，我们将尽快处理您的问题。提交工单时，请提供您的基础环境信息，附上完整的错误页面截图，并点击“查看日志信息”按钮，将完整的错误日志粘贴到问题描述中，以便我们更快地定位并解决问题。</p>
      </div>` : ""}
    </div>`;
}

function completedErrorPreludeMarkup() {
  return `
    <section class="timeline-step completed error-prelude">
      <span class="timeline-marker">${svgIcon("check-circle")}</span>
      <div class="timeline-content">
        <div class="timeline-line"><time>2026-07-15 16:53:43 GMT+08:00</time><span>00:00:00</span></div>
        <p class="timeline-title">开始构建实例</p>
      </div>
    </section>`;
}

function failedErrorStepMarkup({ timestamp, duration, title, code, message, reason, solution, showSupport = true }) {
  return `
    <section class="timeline-step error-failed-step">
      <span class="timeline-marker">${svgIcon("x-circle")}</span>
      <div class="timeline-content">
        <div class="timeline-line"><time>${timestamp}</time><span>${duration}</span></div>
        <p class="timeline-title">${title}</p>
        ${errorDetailsMarkup(code, message, reason, solution, showSupport)}
      </div>
    </section>`;
}

function syncDrawerActionsMarkup(extraClass = "") {
  return `
    <div class="drawer-static-actions sync-drawer-actions ${extraClass}">
      <span>查看详情 <svg class="icon"><use href="#icon-chevron-right" /></svg></span>
      <span><svg class="icon"><use href="#icon-copy" /></svg>复制</span>
    </div>`;
}

function syncCompletedStepMarkup({ timestamp, duration, title, childText = "", className = "" }) {
  return `
    <section class="timeline-step completed sync-detail-step ${childText ? "has-sync-child" : ""} ${className}">
      <span class="timeline-marker">${svgIcon("check-circle")}</span>
      <div class="timeline-content">
        <div class="timeline-line"><time>${timestamp}</time><span>${duration}</span></div>
        <p class="timeline-title">${title}</p>
        ${childText ? `<div class="timeline-children sync-detail-children"><div class="timeline-child"><span class="child-check">✓</span><p>${childText}</p></div></div>` : ""}
      </div>
    </section>`;
}

function openDynamicSyncDrawer(host, triggerClass, description, mode, markup) {
  drawerDescription.textContent = description;
  standardTaskTimeline.hidden = true;
  errorTaskTimeline.hidden = false;
  errorTaskTimeline.dataset.mode = mode;
  errorTaskTimeline.innerHTML = markup;
  showTaskDrawer(host, triggerClass);
}

function openSyncProgressDrawer(host, triggerClass) {
  const markup = [
    syncCompletedStepMarkup({
      timestamp: "2026-07-17 16:37:53 GMT+08:00",
      duration: "00:00:01",
      title: "开始同步数据",
    }),
    syncCompletedStepMarkup({
      timestamp: "2026-07-17 16:37:54 GMT+08:00",
      duration: "00:00:10",
      title: "获取主机最新信息",
      childText: "成功获取主机信息",
    }),
    syncCompletedStepMarkup({
      timestamp: "2026-07-17 16:38:04 GMT+08:00",
      duration: "00:00:01",
      title: "同步数据",
    }),
    `<section class="timeline-step final-step loading sync-notify-step">
      <span class="timeline-marker"></span>
      <div class="timeline-content">
        <div class="timeline-line"><time>2026-07-17 16:38:05 GMT+08:00</time><span>00:00:00</span></div>
        <p class="timeline-title">通知proxy同步数据</p>
        <div class="final-result sync-notify-result"><span class="result-icon"></span><span>通知成功，等待proxy同步数据</span></div>
        ${syncDrawerActionsMarkup()}
      </div>
    </section>`,
  ].join("");
  openDynamicSyncDrawer(host, triggerClass, "同步中", "sync-progress", markup);
}

function openSnapshotCompleteDrawer(host, triggerClass) {
  const markup = syncCompletedStepMarkup({
    timestamp: "2026-07-17 16:40:14 GMT+08:00",
    duration: "00:00:01",
    title: "准备创建目标快照",
  }) + `
    <section class="timeline-step completed snapshot-create-step">
      <span class="timeline-marker">${svgIcon("check-circle")}</span>
      <div class="timeline-content">
        <div class="timeline-line"><time>2026-07-17 16:40:15 GMT+08:00</time><span>00:00:50</span></div>
        <p class="timeline-title">开始创建目标快照</p>
        <div class="timeline-children snapshot-create-children">
          <div class="timeline-child"><span class="child-check">✓</span><p>等待快照创建完成</p></div>
          ${syncDrawerActionsMarkup("snapshot-actions")}
          <div class="timeline-child"><span class="child-check">✓</span><p>快照(${SYNC_SNAPSHOT_EXAMPLE_ID})创建完成</p></div>
        </div>
      </div>
    </section>`;
  openDynamicSyncDrawer(host, triggerClass, "同步快照完成", "snapshot-complete", markup);
}

function sync140000ErrorDetailsMarkup() {
  return `
    <div class="sync-140000-details">
      <div class="sync-140000-error-row">
        <span class="error-mini-marker">×</span>
        <div class="sync-140000-message">
          <p>[140000] We are sorry to inform you that you have encountered an unprocessed exception. In order to obtain the reason for the error and a solution, please send the error message and the program log to the administrator. The error message is as follows: (vim.fault.InvalidLogin) {</p>
          <p>dynamicType = &lt;unset&gt;,</p>
          <p>dynamicProperty = (vmodl.DynamicProperty) [],</p>
          <p>msg = 'Cannot complete login due to an incorrect user name or password.',</p>
          <p>faultCause = &lt;unset&gt;,</p>
          <p>faultMessage = (vmodl.LocalizableMessage) []</p>
          <p>}</p>
        </div>
      </div>
      <p class="sync-log-note">注：如需查看更详细的日志信息，请点击“<span class="sync-log-link">${svgIcon("clipboard")} 日志管理</span>”，跳转至运维管理-日志管理-容灾，在该页面您可以下载相关的日志文件。</p>
      <div class="sync-log-action">查看日志信息 <svg class="icon"><use href="#icon-chevron-right" /></svg></div>
    </div>`;
}

function openSync140000ErrorDrawer(host, triggerClass) {
  const markup = [
    syncCompletedStepMarkup({
      timestamp: "2026-07-13 17:03:21 GMT+08:00",
      duration: "00:00:00",
      title: "开始同步数据",
    }),
    syncCompletedStepMarkup({
      timestamp: "2026-07-13 17:03:21 GMT+08:00",
      duration: "00:00:11",
      title: "获取主机最新信息",
      childText: "成功获取主机信息",
    }),
    syncCompletedStepMarkup({
      timestamp: "2026-07-13 17:03:32 GMT+08:00",
      duration: "00:00:00",
      title: "同步数据",
    }),
    `<section class="timeline-step sync-proxy-failed-step">
      <span class="timeline-marker">${svgIcon("x-circle")}</span>
      <div class="timeline-content">
        <div class="timeline-line"><time>2026-07-13 17:03:32 GMT+08:00</time><span>00:00:13</span></div>
        <p class="timeline-title">通知proxy同步数据</p>
        <div class="timeline-children sync-detail-children">
          <div class="timeline-child"><span class="child-check">✓</span><p>通知成功，等待proxy同步数据</p></div>
        </div>
        ${syncDrawerActionsMarkup("failed-sync-actions")}
        ${sync140000ErrorDetailsMarkup()}
      </div>
    </section>`,
  ].join("");
  openDynamicSyncDrawer(host, triggerClass, "同步数据", "sync-error-140000", markup);
}

function openSyncConflictErrorDrawer(host, triggerClass) {
  drawerDescription.textContent = "同步数据";
  standardTaskTimeline.hidden = true;
  errorTaskTimeline.hidden = false;
  errorTaskTimeline.dataset.mode = "sync-error-030013";
  errorTaskTimeline.innerHTML = failedErrorStepMarkup({
    timestamp: "2026-07-15 16:52:44 GMT+08:00",
    duration: "00:00:01",
    title: "开始同步数据",
    code: "030013",
    message: "Data synchronization cannot be performed while a takeover using cloud sync gateway disks is in progress.",
    reason: "A data synchronization task was initiated while a takeover using cloud sync gateway disks was in progress.",
    solution: "Wait for the cloud sync gateway disk takeover task to complete. To resume synchronization, clean up the takeover resources first, and then retry data synchronization.",
    showSupport: false,
  });
  showTaskDrawer(host, triggerClass);
}

function openSyncErrorDrawer(host, triggerClass) {
  if (host.syncErrorCode === "140000") {
    openSync140000ErrorDrawer(host, triggerClass);
    return;
  }
  if (host.syncErrorCode === "030013") openSyncConflictErrorDrawer(host, triggerClass);
}

function openRawTakeoverErrorDrawer(host, triggerClass) {
  drawerDescription.textContent = "创建实例";
  standardTaskTimeline.hidden = true;
  errorTaskTimeline.hidden = false;
  errorTaskTimeline.dataset.mode = "raw-takeover-error-030012";
  errorTaskTimeline.innerHTML = completedErrorPreludeMarkup() + failedErrorStepMarkup({
    timestamp: "2026-07-15 16:53:43 GMT+08:00",
    duration: "00:00:00",
    title: "准备启动参数",
    code: "030012",
    message: "Takeover using cloud sync gateway disks cannot be performed while the host is synchronizing data.",
    reason: "A takeover using cloud sync gateway disks was initiated while a data synchronization task was in progress.",
    solution: "Wait for the current data synchronization task to complete, or stop it, and then retry the takeover using cloud sync gateway disks.",
    showSupport: false,
  });
  showTaskDrawer(host, triggerClass);
}

function closeTaskDrawer() {
  if (taskDrawerOverlay.hidden) return;
  taskDrawerOverlay.hidden = true;
  document.body.classList.remove("drawer-open");
  const trigger = activeDrawerHostId && activeDrawerTriggerClass
    ? document.querySelector(`.${activeDrawerTriggerClass}[data-host-id="${activeDrawerHostId}"]`)
    : null;
  const fallbackTrigger = !trigger && activeDrawerHostId && activeDrawerTriggerClass === "task-sync-progress-detail-link"
    ? document.querySelector(`.host-sync-detail-link[data-host-id="${activeDrawerHostId}"]`)
    : null;
  activeDrawerHostId = null;
  activeDrawerTriggerClass = null;
  if (trigger) trigger.focus();
  else if (fallbackTrigger) fallbackTrigger.focus();
}

function updateSelectionUi() {
  const count = selectedIds.size;
  const selectedHosts = getSelectedHosts();
  selectedCount.textContent = `已选 ${count} 条`;
  totalCount.textContent = `共 ${hosts.length} 条`;
  selectAll.checked = count === hosts.length;
  selectAll.indeterminate = count > 0 && count < hosts.length;
  immediateSyncButton.disabled = !canSyncImmediately();
  takeoverButton.disabled = !canTakeOver();
  legacyTakeoverButton.disabled = !canQuickTakeOver();
  drillButton.disabled = !canTakeOver();
  unregisterButton.disabled = !canUnregisterHosts();
  cleanupButton.disabled = !canCleanupHosts();
  moreButton.disabled = selectedHosts.some(isUnregistering);
  if (moreButton.disabled) closeMoreMenu();
}

function renderQuickTakeoverLocalizedCopy() {
  const batchHosts = getQuickTakeoverBatchHosts();
  const boundCount = batchHosts.filter(hasActivePolicy).length;
  const format = window.prototypeI18n?.format;
  if (!format) return;

  quickPolicySummary.innerHTML = format("quick-policy-summary", {
    total: `<strong>${batchHosts.length}</strong>`,
    bound: `<strong>${boundCount}</strong>`,
  });
  if (activeQuickTakeoverStep === 2) {
    renderQuickTakeoverSummary();
    updateQuickTakeoverStatusSortControl();
  }
}

function getModalRecoverySelections() {
  return new Map([...modalHostBody.querySelectorAll(".recovery-select")]
    .map((select) => [select.dataset.hostId, select.value]));
}

function updateTableScrollEdges(tableScroll) {
  const maxScrollLeft = Math.max(0, tableScroll.scrollWidth - tableScroll.clientWidth);
  const edgeTolerance = 1;
  tableScroll.classList.toggle("has-scroll-left", tableScroll.scrollLeft > edgeTolerance);
  tableScroll.classList.toggle(
    "has-scroll-right",
    tableScroll.scrollLeft < maxScrollLeft - edgeTolerance,
  );
}

function updateTakeoverTableScrollEdges() {
  updateTableScrollEdges(takeoverTableScroll);
}

function updateLegacyTakeoverTableScrollEdges() {
  legacyTakeoverTableScrolls.forEach(updateTableScrollEdges);
}

function renderModalHosts(recoverySelections = new Map()) {
  const selectedHosts = getSelectedHosts();
  modalCount.textContent = selectedHosts.length;
  modalHostBody.innerHTML = selectedHosts.map((host) => {
    const snapshotHistory = getSnapshotHistory(host);
    const requestedRecovery = recoverySelections.get(host.id);
    const selectedRecovery = snapshotHistory.includes(requestedRecovery)
      ? requestedRecovery
      : snapshotHistory[0];
    const recoveryOptions = snapshotHistory
      .map((timePoint) => `<option value="${timePoint}" ${selectedRecovery === timePoint ? "selected" : ""}>${timePoint}</option>`)
      .join("");

    return `
      <tr data-host-id="${host.id}">
        <td>${hostNameMarkup(host)}</td>
        <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
        <td>${host.storage}</td>
        <td>${cloudMarkup(host)}</td>
        <td>${hostStateOnlyMarkup(host)}</td>
        <td>${healthMarkup(host)}</td>
        <td>
          <select class="recovery-select" data-host-id="${host.id}" aria-label="${host.name} 恢复时间点">
            ${recoveryOptions}
          </select>
        </td>
      </tr>`;
  }).join("");
}

function getLegacyTakeoverModalRecoverySelections() {
  return new Map([...quickTakeoverStep.querySelectorAll(".latest-recovery-point")]
    .map((timePoint) => [timePoint.dataset.hostId, timePoint.dataset.recoveryPoint]));
}

function isQuickTakeoverRiskHost(host) {
  return isSyncFailed(host);
}

function isQuickTakeoverBlockedHost(host) {
  return isSyncInProgress(host);
}

function getQuickTakeoverHostKind(host) {
  if (isQuickTakeoverBlockedHost(host)) return "blocked";
  if (isQuickTakeoverRiskHost(host)) return "risk";
  return "ready";
}

function getQuickTakeoverHostSortRank(host) {
  const kind = getQuickTakeoverHostKind(host);
  if (kind === "ready") return 0;
  if (kind === "risk") return 1;
  return 2;
}

function getQuickTakeoverSelectionSnapshot() {
  return new Map([...quickTakeoverHostBody.querySelectorAll("tr[data-host-id]")].map((row) => {
    const checkbox = row.querySelector(".quick-takeover-host-checkbox");
    return [row.dataset.hostId, {
      checked: Boolean(checkbox?.checked),
      kind: row.dataset.hostKind,
    }];
  }));
}

function sortQuickTakeoverHosts(batchHosts) {
  const direction = quickTakeoverStatusSortDirection === "ascending" ? 1 : -1;
  return [...batchHosts].sort((left, right) => {
    const rankDifference = getQuickTakeoverHostSortRank(left) - getQuickTakeoverHostSortRank(right);
    if (rankDifference !== 0) return rankDifference * direction;
    return left.name.localeCompare(right.name, "zh-CN") * direction;
  });
}

function quickTakeoverHostRowMarkup(host, checked = false) {
  const kind = getQuickTakeoverHostKind(host);
  const blocked = kind === "blocked";
  const risk = kind === "risk";
  const latestRecoveryPoint = getSnapshotHistory(host)[0];
  return `
    <tr data-host-id="${host.id}" data-host-kind="${kind}" class="quick-takeover-${kind}-row">
      <td class="quick-takeover-selection-column">
        <input
          class="quick-takeover-host-checkbox"
          type="checkbox"
          data-host-id="${host.id}"
          aria-label="${risk ? `确认 ${host.name} 使用快速接管的风险` : `选择 ${host.name}`}"
          ${checked ? "checked" : ""}
          ${blocked ? "disabled" : ""}
        />
      </td>
      <td>${hostNameMarkup(host)}</td>
      <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
      <td>${cloudMarkup(host)}</td>
      <td>${hostStateOnlyMarkup(host)}</td>
      <td>
        <span class="latest-recovery-point" data-host-id="${host.id}" data-recovery-point="${latestRecoveryPoint}">${latestRecoveryPoint}</span>
      </td>
    </tr>`;
}

function getQuickTakeoverConfirmedHostIds() {
  const batchHostIds = new Set(getQuickTakeoverBatchHosts().map((host) => host.id));
  return new Set([...quickTakeoverHostBody.querySelectorAll(".quick-takeover-host-checkbox:checked:not(:disabled)")]
    .map((checkbox) => checkbox.dataset.hostId)
    .filter((hostId) => batchHostIds.has(hostId)));
}

function updateQuickTakeoverSelectAllState() {
  const selectableCheckboxes = [...quickTakeoverHostBody.querySelectorAll(
    ".quick-takeover-host-checkbox:not(:disabled)",
  )];
  const checkedCount = selectableCheckboxes.filter((checkbox) => checkbox.checked).length;
  quickTakeoverSelectAll.disabled = selectableCheckboxes.length === 0;
  quickTakeoverSelectAll.checked = selectableCheckboxes.length > 0
    && checkedCount === selectableCheckboxes.length;
  quickTakeoverSelectAll.indeterminate = checkedCount > 0
    && checkedCount < selectableCheckboxes.length;
}

function renderQuickTakeoverSummary() {
  const batchHosts = getQuickTakeoverBatchHosts();
  const confirmedHostIds = getQuickTakeoverConfirmedHostIds();
  const unavailableCount = batchHosts.filter(isQuickTakeoverBlockedHost).length;
  const skippedCount = Math.max(0, batchHosts.length - confirmedHostIds.size - unavailableCount);
  const format = window.prototypeI18n?.format;
  if (!format) return;
  quickTakeoverSummary.innerHTML = format("quick-risk-summary", {
    total: `<strong>${batchHosts.length}</strong>`,
    selected: `<strong>${confirmedHostIds.size}</strong>`,
    skipped: `<strong>${skippedCount}</strong>`,
    unavailable: `<strong>${unavailableCount}</strong>`,
  });
}

function updateQuickTakeoverConfirmState() {
  updateQuickTakeoverSelectAllState();
  legacyTakeoverModalConfirm.disabled = getQuickTakeoverConfirmedHostIds().size === 0;
  renderQuickTakeoverSummary();
}

function resetQuickTakeoverRiskConfirmations() {
  quickTakeoverHostBody.querySelectorAll(".quick-takeover-host-checkbox").forEach((checkbox) => {
    const host = hosts.find((candidate) => candidate.id === checkbox.dataset.hostId);
    checkbox.checked = Boolean(host) && getQuickTakeoverHostKind(host) === "ready";
  });
  updateQuickTakeoverConfirmState();
}

function updateQuickTakeoverStatusSortControl() {
  const ascending = quickTakeoverStatusSortDirection === "ascending";
  const nextDirection = ascending ? "descending" : "ascending";
  const sortTitleKey = `quick-status-sort-${nextDirection}`;
  const localizedSortTitle = window.prototypeI18n?.catalog?.entries?.[sortTitleKey]?.[
    window.prototypeI18n.locale
  ];
  quickTakeoverStatusHeader.setAttribute("aria-sort", quickTakeoverStatusSortDirection);
  quickTakeoverStatusSortButton.title = localizedSortTitle || (ascending
    ? "按主机状态降序排列"
    : "按主机状态升序排列");
}

function renderLegacyTakeoverModalHosts() {
  const batchHosts = getQuickTakeoverBatchHosts();
  const previousSelections = getQuickTakeoverSelectionSnapshot();
  const sortedHosts = sortQuickTakeoverHosts(batchHosts);

  renderQuickTakeoverLocalizedCopy();
  quickTakeoverHostBody.innerHTML = sortedHosts
    .map((host) => {
      const kind = getQuickTakeoverHostKind(host);
      const previousSelection = previousSelections.get(host.id);
      const checked = previousSelection?.kind === kind
        ? previousSelection.checked
        : kind === "ready";
      return quickTakeoverHostRowMarkup(host, checked);
    })
    .join("");
  quickTakeoverHostBody.querySelectorAll(".quick-takeover-host-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", updateQuickTakeoverConfirmState);
  });
  updateQuickTakeoverStatusSortControl();
  updateQuickTakeoverConfirmState();
  requestAnimationFrame(updateLegacyTakeoverTableScrollEdges);
}

function refreshQuickTakeoverModalHosts() {
  if (legacyTakeoverModalOverlay.hidden) return;
  if (activeQuickTakeoverStep === 1) renderQuickPolicyStep();
  else renderLegacyTakeoverModalHosts();
}

function isQuickPolicyStepComplete() {
  const batchHosts = getQuickTakeoverBatchHosts();
  return batchHosts.length > 0 && batchHosts.every((host) => !hasActivePolicy(host));
}

function renderQuickPolicyStep() {
  const batchHosts = getQuickTakeoverBatchHosts();
  const stepComplete = isQuickPolicyStepComplete();
  renderQuickTakeoverLocalizedCopy();
  quickPolicyHostBody.innerHTML = batchHosts.map((host) => {
    const policyActive = hasActivePolicy(host);
    return `
      <tr data-host-id="${host.id}">
        <td>${hostNameMarkup(host)}</td>
        <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
        <td>${hostStateOnlyMarkup(host)}</td>
        <td>${healthMarkup(host)}</td>
        <td><span class="status-line"><span class="dot ${policyActive ? "green" : "gray"}"></span>${policyActive ? "5 小时" : "无策略"}</span></td>
      </tr>`;
  }).join("");
  quickUnbindPoliciesButton.disabled = stepComplete;
  quickTakeoverNext.disabled = !stepComplete;
  quickPolicyStepIndicator.classList.toggle("is-complete", stepComplete);
}

function setQuickTakeoverStep(step) {
  activeQuickTakeoverStep = step;
  const showPolicyStep = step === 1;
  quickPolicyStep.hidden = !showPolicyStep;
  quickTakeoverStep.hidden = showPolicyStep;
  quickPolicyStepIndicator.classList.toggle("is-active", showPolicyStep);
  if (showPolicyStep) quickPolicyStepIndicator.setAttribute("aria-current", "step");
  else quickPolicyStepIndicator.removeAttribute("aria-current");
  quickTakeoverStepIndicator.classList.toggle("is-active", !showPolicyStep);
  if (showPolicyStep) quickTakeoverStepIndicator.removeAttribute("aria-current");
  else quickTakeoverStepIndicator.setAttribute("aria-current", "step");
  quickTakeoverBack.hidden = showPolicyStep;
  quickUnbindPoliciesButton.hidden = !showPolicyStep;
  quickTakeoverNext.hidden = !showPolicyStep;
  legacyTakeoverModalConfirm.hidden = showPolicyStep;
  resetQuickTakeoverRiskConfirmations();
  renderQuickPolicyStep();
  if (!showPolicyStep) {
    renderLegacyTakeoverModalHosts();
    legacyTakeoverTableScrolls.forEach((tableScroll) => {
      tableScroll.scrollLeft = 0;
    });
    requestAnimationFrame(updateLegacyTakeoverTableScrollEdges);
  }
}

function getDrillModalRecoverySelections() {
  return new Map([...drillModalHostBody.querySelectorAll(".recovery-select")]
    .map((select) => [select.dataset.hostId, select.value]));
}

function renderDrillModalHosts(recoverySelections = new Map()) {
  const selectedHosts = getSelectedHosts();
  drillModalCount.textContent = selectedHosts.length;
  drillExistingRawNotice.hidden = !selectedHosts.some(isRawTakeoverState);
  drillModalHostBody.innerHTML = selectedHosts.map((host) => {
    const snapshotHistory = getSnapshotHistory(host);
    const requestedRecovery = recoverySelections.get(host.id);
    const selectedRecovery = snapshotHistory.includes(requestedRecovery)
      ? requestedRecovery
      : host.snapshot;
    const recoveryOptions = snapshotHistory
      .map((timePoint) => `<option value="${timePoint}" ${selectedRecovery === timePoint ? "selected" : ""}>${timePoint}</option>`)
      .join("");

    return `
      <tr data-host-id="${host.id}">
        <td>${hostNameMarkup(host)}</td>
        <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
        <td>${host.storage}</td>
        <td>${cloudMarkup(host)}</td>
        <td>${healthMarkup(host)}</td>
        <td>
          <select class="recovery-select" data-host-id="${host.id}" aria-label="${host.name} 演练恢复时间点">
            ${recoveryOptions}
          </select>
        </td>
      </tr>`;
  }).join("");
}

function launchStateOnlyMarkup(host) {
  const dotClass = isLaunchStateInProgress(host)
    ? "spinner"
    : (host.launchState.startsWith("启动成功") || host.launchState.startsWith("清理完成")
      ? "green"
      : (host.launchState.startsWith("启动失败") ? "red" : "gray"));
  return `<div class="host-action-launch-state"><span class="status-line"><span class="dot ${dotClass}"></span>${host.launchState}</span></div>`;
}

function getHostsByIds(hostIds) {
  return hosts.filter((host) => hostIds.has(host.id));
}

function renderCleanupConfirmHosts() {
  const batchHosts = getHostsByIds(pendingCleanupIds);
  cleanupConfirmCount.textContent = batchHosts.length;
  cleanupRawTakeoverNotice.hidden = !batchHosts.some(isRawTakeoverState);
  cleanupConfirmHostBody.innerHTML = batchHosts.map((host) => `
    <tr data-host-id="${host.id}">
      <td>${hostNameMarkup(host)}</td>
      <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
      <td>${launchStateOnlyMarkup(host)}</td>
      <td>${healthMarkup(host)}</td>
      <td>${host.storage}</td>
      <td>${cloudMarkup(host)}</td>
    </tr>`).join("");
}

function renderUnregisterConfirmHosts() {
  const batchHosts = getHostsByIds(pendingUnregisterIds);
  unregisterConfirmCount.textContent = batchHosts.length;
  unregisterConfirmHostBody.innerHTML = batchHosts.map((host) => `
    <tr data-host-id="${host.id}">
      <td>${hostNameMarkup(host)}</td>
      <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
      <td>${host.storage}</td>
      <td>${cloudMarkup(host)}</td>
      <td>${healthMarkup(host)}</td>
      <td>2 CPU</td>
    </tr>`).join("");
}

function renderSyncModalHosts() {
  const batchHosts = getImmediateSyncBatchHosts();
  syncModalCount.textContent = batchHosts.length;
  syncModalHostBody.innerHTML = batchHosts.map((host) => `
    <tr>
      <td>${hostNameMarkup(host)}</td>
      <td>${host.ip}<span class="subtle">(${host.ipType})</span></td>
      <td>${host.storage}</td>
      <td>${cloudMarkup(host)}</td>
      <td>${healthMarkup(host)}</td>
      <td>2 CPU</td>
    </tr>`).join("");
}

function openSyncModal() {
  if (!canSyncImmediately()) return;
  immediateSyncBatchIds = new Set(selectedIds);
  renderSyncModalHosts();
  syncAdvancedToggle.setAttribute("aria-expanded", "true");
  syncAdvancedContent.hidden = false;
  const batchHosts = getImmediateSyncBatchHosts();
  rawFullSyncNotice.hidden = !batchHosts.some(isRawCleanupComplete);
  const allHostsRequireFullSync = batchHosts.length > 0 && batchHosts.every(isRawCleanupComplete);
  forceFullSyncCheckbox.checked = allHostsRequireFullSync;
  forceFullSyncCheckbox.disabled = allHostsRequireFullSync;
  forceFullSyncCheckbox.title = allHostsRequireFullSync
    ? "清理完成的快速接管主机必须执行全量同步"
    : "";
  closeMoreMenu();
  syncModalOverlay.hidden = false;
  document.body.classList.add("modal-open");
  syncModalClose.focus();
}

function closeSyncModal(restoreFocus = true) {
  syncModalOverlay.hidden = true;
  immediateSyncBatchIds.clear();
  document.body.classList.remove("modal-open");
  if (restoreFocus) immediateSyncButton.focus();
}

function openModal() {
  if (!canTakeOver()) return;
  renderModalHosts();
  advancedToggle.setAttribute("aria-expanded", "false");
  closeMoreMenu();
  modalOverlay.hidden = false;
  takeoverTableScroll.scrollLeft = 0;
  updateTakeoverTableScrollEdges();
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.classList.remove("modal-open");
  takeoverButton.focus();
}

function scheduleQuickTakeoverSync() {
  if (!quickTakeoverBatchIds.has(QUICK_TAKEOVER_SYNC_HOST_ID)) return;
  if (quickTakeoverSyncTimer !== null) clearTimeout(quickTakeoverSyncTimer);
  quickTakeoverSyncTimer = setTimeout(() => {
    quickTakeoverSyncTimer = null;
    startImmediateSync(new Set([QUICK_TAKEOVER_SYNC_HOST_ID]));
  }, QUICK_TAKEOVER_SYNC_DELAY_MS);
}

function openLegacyTakeoverModal() {
  if (!canQuickTakeOver()) return;
  quickTakeoverBatchIds = new Set(selectedIds);
  scheduleQuickTakeoverSync();
  activeQuickTakeoverStep = 1;
  quickTakeoverStatusSortDirection = "ascending";
  delete quickTakeoverStep.dataset.hostStateSignature;
  renderQuickPolicyStep();
  closeMoreMenu();
  legacyTakeoverModalOverlay.hidden = false;
  setQuickTakeoverStep(1);
  document.body.classList.add("modal-open");
  legacyTakeoverModalClose.focus();
}

function closeLegacyTakeoverModal() {
  legacyTakeoverModalOverlay.hidden = true;
  quickTakeoverBatchIds.clear();
  activeQuickTakeoverStep = 1;
  delete quickTakeoverStep.dataset.hostStateSignature;
  resetQuickTakeoverRiskConfirmations();
  document.body.classList.remove("modal-open");
  legacyTakeoverButton.focus();
}

function openDrillModal() {
  if (!canTakeOver()) return;
  renderDrillModalHosts();
  drillAdvancedToggle.setAttribute("aria-expanded", "false");
  closeMoreMenu();
  drillModalOverlay.hidden = false;
  document.body.classList.add("modal-open");
  drillModalClose.focus();
}

function closeDrillModal() {
  drillModalOverlay.hidden = true;
  drillExistingRawNotice.hidden = true;
  document.body.classList.remove("modal-open");
  drillButton.focus();
}

function openCleanupConfirmModal() {
  if (!canCleanupHosts()) return;
  pendingCleanupIds = new Set(selectedIds);
  cleanupConfirmAcknowledgement.checked = false;
  cleanupConfirmSubmit.disabled = true;
  cleanupConfirmAdvancedToggle.setAttribute("aria-expanded", "true");
  cleanupConfirmAdvancedContent.hidden = false;
  renderCleanupConfirmHosts();
  closeMoreMenu();
  cleanupConfirmOverlay.hidden = false;
  document.body.classList.add("modal-open");
  cleanupConfirmClose.focus();
}

function closeCleanupConfirmModal(restoreFocus = true) {
  cleanupConfirmOverlay.hidden = true;
  pendingCleanupIds.clear();
  cleanupRawTakeoverNotice.hidden = true;
  cleanupConfirmAcknowledgement.checked = false;
  cleanupConfirmSubmit.disabled = true;
  document.body.classList.remove("modal-open");
  if (restoreFocus) moreButton.focus();
}

function openUnregisterConfirmModal() {
  if (!canUnregisterHosts()) return;
  pendingUnregisterIds = new Set(selectedIds);
  unregisterConfirmAcknowledgement.checked = false;
  unregisterConfirmSubmit.disabled = true;
  renderUnregisterConfirmHosts();
  closeMoreMenu();
  unregisterConfirmOverlay.hidden = false;
  document.body.classList.add("modal-open");
  unregisterConfirmClose.focus();
}

function closeUnregisterConfirmModal(restoreFocus = true) {
  unregisterConfirmOverlay.hidden = true;
  pendingUnregisterIds.clear();
  unregisterConfirmAcknowledgement.checked = false;
  unregisterConfirmSubmit.disabled = true;
  document.body.classList.remove("modal-open");
  if (restoreFocus) moreButton.focus();
}

selectAll.addEventListener("change", () => {
  if (selectAll.checked) hosts.forEach((host) => selectedIds.add(host.id));
  else selectedIds.clear();
  renderHosts();
});

moreButton.addEventListener("click", () => {
  if (moreButton.disabled) return;
  const willOpen = moreMenu.hidden;
  moreMenu.hidden = !willOpen;
  moreButton.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    const firstEnabledItem = moreMenu.querySelector(".more-menu-item:not(:disabled)");
    if (firstEnabledItem) firstEnabledItem.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!moreMenuWrap.contains(event.target)) closeMoreMenu();
});

function executeUnregisterHosts(unregisteringIds) {
  hosts.forEach((host) => {
    if (unregisteringIds.has(host.id)) host.hostState = "解除注册中...";
  });
  selectedIds.clear();
  closeMoreMenu();
  renderHosts();

  setTimeout(() => {
    for (let index = hosts.length - 1; index >= 0; index -= 1) {
      const host = hosts[index];
      if (unregisteringIds.has(host.id) && isUnregistering(host)) {
        selectedIds.delete(host.id);
        hosts.splice(index, 1);
      }
    }
    renderHosts();
  }, OPERATION_DELAY_MS);
}

function executeCleanupHosts(cleanupIds) {
  hosts.forEach((host) => {
    if (!cleanupIds.has(host.id)) return;
    host.launchState = "清理中...";
  });
  selectedIds.clear();
  closeMoreMenu();
  renderHosts();

  setTimeout(() => {
    hosts.forEach((host) => {
      if (!cleanupIds.has(host.id)) return;
      if (host.launchState === "清理中...") host.launchState = "清理完成";
    });
    renderHosts();
  }, OPERATION_DELAY_MS);
}

unregisterButton.addEventListener("click", openUnregisterConfirmModal);
cleanupButton.addEventListener("click", openCleanupConfirmModal);

immediateSyncButton.addEventListener("click", openSyncModal);
syncModalClose.addEventListener("click", closeSyncModal);
syncModalCancel.addEventListener("click", closeSyncModal);

syncModalOverlay.addEventListener("click", (event) => {
  if (event.target === syncModalOverlay) closeSyncModal();
});

function scheduleSyncCompletion(syncingIds) {
  if (syncingIds.size === 0) return;
  const startedAt = Date.now();
  const progressTimer = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    const progress = Math.min(99, Math.max(1, Math.round((elapsed / SYNC_OPERATION_DELAY_MS) * 100)));
    let changed = false;
    hosts.forEach((host) => {
      if (!syncingIds.has(host.id) || !isSyncInProgress(host)) return;
      if (getSyncProgress(host) === progress) return;
      host.syncProgress = progress;
      changed = true;
    });
    if (changed) renderHosts();
  }, SYNC_PROGRESS_INTERVAL_MS);

  setTimeout(() => {
    clearInterval(progressTimer);
    const snapshotTime = formatTimestamp(new Date());
    const recoverySelections = modalOverlay.hidden ? null : getModalRecoverySelections();
    const drillRecoverySelections = drillModalOverlay.hidden ? null : getDrillModalRecoverySelections();
    hosts.forEach((host) => {
      if (!syncingIds.has(host.id) || !isSyncInProgress(host)) return;
      host.syncProgress = 100;
      host.hostState = "同步快照完成";
      addSnapshotToHistory(host, snapshotTime);
      host.taskState = `上次快照：${snapshotTime}...`;
      if (recoverySelections?.has(host.id)) recoverySelections.set(host.id, snapshotTime);
      if (drillRecoverySelections?.has(host.id)) drillRecoverySelections.set(host.id, snapshotTime);
    });
    renderHosts();
    if (recoverySelections) renderModalHosts(recoverySelections);
    refreshQuickTakeoverModalHosts();
    if (drillRecoverySelections) renderDrillModalHosts(drillRecoverySelections);
  }, SYNC_OPERATION_DELAY_MS);
}

function startImmediateSync(syncingIds, forceFullSync = false) {
  const startedSyncIds = new Set();
  hosts.forEach((host) => {
    if (!syncingIds.has(host.id)) return;
    if (isSyncInProgress(host) || isUnregistering(host)) return;
    if (isRawTakeoverState(host) && !isRawCleanupComplete(host)) return;
    host.hostState = forceFullSync || isRawCleanupComplete(host)
      ? "同步中(全量)..."
      : "同步中...";
    host.syncProgress = 0;
    host.syncErrorCode = null;
    startedSyncIds.add(host.id);
  });
  if (startedSyncIds.size === 0) return;
  scheduleSyncCompletion(startedSyncIds);
  renderHosts();
  refreshQuickTakeoverModalHosts();
}

syncModalConfirm.addEventListener("click", () => {
  const syncingIds = new Set(immediateSyncBatchIds);
  const forceFullSync = forceFullSyncCheckbox.checked;
  startImmediateSync(syncingIds, forceFullSync);
  selectedIds.clear();
  closeSyncModal(false);
});

takeoverButton.addEventListener("click", openModal);
legacyTakeoverButton.addEventListener("click", openLegacyTakeoverModal);
drillButton.addEventListener("click", openDrillModal);
takeoverTableScroll.addEventListener("scroll", updateTakeoverTableScrollEdges, { passive: true });
legacyTakeoverTableScrolls.forEach((tableScroll) => {
  tableScroll.addEventListener("scroll", updateLegacyTakeoverTableScrollEdges, { passive: true });
});
window.addEventListener("resize", updateTakeoverTableScrollEdges);
window.addEventListener("resize", updateLegacyTakeoverTableScrollEdges);
modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);
legacyTakeoverModalClose.addEventListener("click", closeLegacyTakeoverModal);
legacyTakeoverModalCancel.addEventListener("click", closeLegacyTakeoverModal);
quickUnbindPoliciesButton.addEventListener("click", () => {
  getQuickTakeoverBatchHosts().forEach((host) => {
    host.policyActive = false;
  });
  renderHosts();
  renderQuickPolicyStep();
  quickTakeoverNext.focus();
});
quickTakeoverNext.addEventListener("click", () => {
  if (!isQuickPolicyStepComplete()) return;
  setQuickTakeoverStep(2);
  quickTakeoverBack.focus();
});
quickTakeoverBack.addEventListener("click", () => {
  setQuickTakeoverStep(1);
  quickTakeoverNext.focus();
});
quickTakeoverSelectAll.addEventListener("change", () => {
  quickTakeoverHostBody.querySelectorAll(".quick-takeover-host-checkbox:not(:disabled)").forEach((checkbox) => {
    checkbox.checked = quickTakeoverSelectAll.checked;
  });
  updateQuickTakeoverConfirmState();
});
quickTakeoverStatusSortButton.addEventListener("click", () => {
  quickTakeoverStatusSortDirection = quickTakeoverStatusSortDirection === "ascending"
    ? "descending"
    : "ascending";
  renderLegacyTakeoverModalHosts();
  quickTakeoverStatusSortButton.focus();
});
drillModalClose.addEventListener("click", closeDrillModal);
drillModalCancel.addEventListener("click", closeDrillModal);
cleanupConfirmClose.addEventListener("click", closeCleanupConfirmModal);
cleanupConfirmCancel.addEventListener("click", closeCleanupConfirmModal);
unregisterConfirmClose.addEventListener("click", closeUnregisterConfirmModal);
unregisterConfirmCancel.addEventListener("click", closeUnregisterConfirmModal);

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

legacyTakeoverModalOverlay.addEventListener("click", (event) => {
  if (event.target === legacyTakeoverModalOverlay) closeLegacyTakeoverModal();
});

drillModalOverlay.addEventListener("click", (event) => {
  if (event.target === drillModalOverlay) closeDrillModal();
});

cleanupConfirmOverlay.addEventListener("click", (event) => {
  if (event.target === cleanupConfirmOverlay) closeCleanupConfirmModal();
});

unregisterConfirmOverlay.addEventListener("click", (event) => {
  if (event.target === unregisterConfirmOverlay) closeUnregisterConfirmModal();
});

taskDrawerClose.addEventListener("click", closeTaskDrawer);

taskDrawerOverlay.addEventListener("click", (event) => {
  if (event.target === taskDrawerOverlay) closeTaskDrawer();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!cleanupConfirmOverlay.hidden) {
    closeCleanupConfirmModal();
    return;
  }
  if (!unregisterConfirmOverlay.hidden) {
    closeUnregisterConfirmModal();
    return;
  }
  closeMoreMenu();
  closeTaskDrawer();
  if (!syncModalOverlay.hidden) closeSyncModal();
  if (!modalOverlay.hidden) closeModal();
  if (!legacyTakeoverModalOverlay.hidden) closeLegacyTakeoverModal();
  if (!drillModalOverlay.hidden) closeDrillModal();
});

syncAdvancedToggle.addEventListener("click", () => {
  const expanded = syncAdvancedToggle.getAttribute("aria-expanded") === "true";
  syncAdvancedToggle.setAttribute("aria-expanded", String(!expanded));
  syncAdvancedContent.hidden = expanded;
});

cleanupConfirmAcknowledgement.addEventListener("change", () => {
  cleanupConfirmSubmit.disabled = !cleanupConfirmAcknowledgement.checked;
});

unregisterConfirmAcknowledgement.addEventListener("change", () => {
  unregisterConfirmSubmit.disabled = !unregisterConfirmAcknowledgement.checked;
});

cleanupConfirmAdvancedToggle.addEventListener("click", () => {
  const expanded = cleanupConfirmAdvancedToggle.getAttribute("aria-expanded") === "true";
  cleanupConfirmAdvancedToggle.setAttribute("aria-expanded", String(!expanded));
  cleanupConfirmAdvancedContent.hidden = expanded;
});

cleanupConfirmSubmit.addEventListener("click", () => {
  if (cleanupConfirmSubmit.disabled || !cleanupConfirmAcknowledgement.checked) return;
  const cleanupIds = new Set(pendingCleanupIds);
  closeCleanupConfirmModal(false);
  executeCleanupHosts(cleanupIds);
});

unregisterConfirmSubmit.addEventListener("click", () => {
  if (unregisterConfirmSubmit.disabled || !unregisterConfirmAcknowledgement.checked) return;
  const unregisteringIds = new Set(pendingUnregisterIds);
  closeUnregisterConfirmModal(false);
  executeUnregisterHosts(unregisteringIds);
});

function scheduleTakeoverCompletion(takeoverIds) {
  if (takeoverIds.size === 0) return;
  setTimeout(() => {
    hosts.forEach((host) => {
      if (!takeoverIds.has(host.id)) return;
      if (host.launchState === "启动中...") host.launchState = "启动成功";
    });
    renderHosts();
  }, OPERATION_DELAY_MS);
}

function executeTakeover(confirmedIds, recoverySelections, source) {
  const waitingCompletionIds = new Set();
  hosts.forEach((host) => {
    if (!confirmedIds.has(host.id)) return;
    const useGatewayDisk = source === TAKEOVER_SOURCE_LEGACY;
    host.takeoverMode = useGatewayDisk ? TAKEOVER_MODE_RAW : TAKEOVER_MODE_SNAPSHOT;
    if (useGatewayDisk) host.policyActive = false;
    host.takeoverRecoveryPoint = recoverySelections.get(host.id) || host.snapshot;
    if (useGatewayDisk && isSyncInProgress(host)) {
      host.launchState = "启动失败";
      return;
    }
    host.launchState = "启动中...";
    waitingCompletionIds.add(host.id);
  });
  scheduleTakeoverCompletion(waitingCompletionIds);
  selectedIds.clear();
  if (source === TAKEOVER_SOURCE_LEGACY) closeLegacyTakeoverModal();
  else closeModal();
  renderHosts();
}

modalConfirm.addEventListener("click", () => {
  const confirmedIds = new Set(selectedIds);
  const recoverySelections = getModalRecoverySelections();
  executeTakeover(confirmedIds, recoverySelections, TAKEOVER_SOURCE_CURRENT);
});

legacyTakeoverModalConfirm.addEventListener("click", () => {
  if (
    activeQuickTakeoverStep !== 2
    || !isQuickPolicyStepComplete()
  ) return;
  const confirmedIds = getQuickTakeoverConfirmedHostIds();
  const recoverySelections = getLegacyTakeoverModalRecoverySelections();
  executeTakeover(confirmedIds, recoverySelections, TAKEOVER_SOURCE_LEGACY);
});

drillModalConfirm.addEventListener("click", () => {
  const confirmedIds = new Set(selectedIds);
  const waitingCompletionIds = new Set();
  hosts.forEach((host) => {
    if (!confirmedIds.has(host.id)) return;
    host.takeoverMode = TAKEOVER_MODE_SNAPSHOT;
    host.launchState = "启动中...";
    waitingCompletionIds.add(host.id);
  });
  scheduleTakeoverCompletion(waitingCompletionIds);
  selectedIds.clear();
  closeDrillModal();
  renderHosts();
});

window.addEventListener("prototype:locale-change", renderQuickTakeoverLocalizedCopy);
renderHosts();
