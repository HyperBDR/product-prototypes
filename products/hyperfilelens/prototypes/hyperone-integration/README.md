# HyperOne Integration Depth

This static build presents the HyperOne integration prototype for combining
HyperFileLens, HyperBDR and HyperCDR under one product workspace.

- The platform overview separates protection configuration coverage, scheduled
  recovery-point updates and host DR RPO compliance.
- Recovery and drill success rates count completed successful, failed and partial
  tasks over seven UTC calendar days; cancellations are separate. Task success
  does not prove recovery validation or business availability.
- The product workspace switches between all capabilities and a focused
  HyperFileLens, HyperBDR or HyperCDR experience.
- Capability entries open protection workspaces directly; standalone product
  overview pages preserve product-specific terminology and workflows.
- The top-level Platform overview label stays consistent across capabilities.
- The protection menu exposes host failback as a peer business entry, without
  repeated HyperOne capability subtitles or a duplicate nested failback link.
- Host failback follows the current HyperBDR `breakBack` three-stage workflow:
  Register hosts → Failback configuration → Start failback. Synchronization is
  part of the final stage, not the second stage of the legacy workflow.
- Configuration reconstructs four fictional sample branches: OpenStack and
  general-storage, each with block/object storage. Other providers are not claimed.
  Verification remains a draft-only preview; production takeover is unavailable.
- Container backup/recovery tasks remain in Operations rather than duplicating
  their entry under container protection.
- Source and node configuration share the configuration center, with enrollment
  actions in the first protection step and legacy entry filters preserved.
- Professional pages retain product-specific menus and configuration flows.
- Dashboard metrics open matching existing resource or task menu pages, preserving
  the selected scope through reloads and offering a clear-filter action.
- Unresolved-alert drilldowns include firing and acknowledged alerts only, using
  the same available-capability scope as the overview. Reset restores all alerts.
- Source, storage, task and alert lists expose consistent scope filters; reset
  clears both local conditions and inherited dashboard filters.
- Coverage metrics open the matching capability configuration step. Resource
  attention and storage checks preserve the metric's assessment scope.
- Runtime events, tasks, execution logs and operation audits offer related-record
  navigation with resource, correlation and time-window context in the URL.
- Recovery-point assessments distinguish observed evidence from unknown status;
  execution success is not presented as proof of recovery validation.
- Alerts/events, execution results and storage capacity retain a compact dashboard
  layout. Healthy connection badges are hidden; simulated unavailable statistics
  and unconnected capabilities have distinct explanations.

## Protection workspace update

- Unified protection navigation groups file backup/restore, host DR, host failback,
  container protection and shared resource catalogs in one persistent sidebar.
- File protection reuses shared stage-card styles; host DR and failback retain
  their product-specific step visuals and fullscreen configuration structure.
- Container application protection provides selection, configuration and execution
  stages, with overview coverage scopes preserved and resettable.
- Host details use product-specific information, storage, network and monitoring
  tabs. Lists share compact inline filters and a single reset action.
- Native workflow reconstruction remains partial: provider inventories are local
  fixtures, DR configuration covers bounded OpenStack block/object cases, and
  several original disk/NIC editors and recovery dialogs are not reconstructed.
  A successful local task is not proof of production recovery or validation.
- The manually-complete-failback action is removed; local clicks cannot create
  completed synchronization or verification evidence.

Source snapshot: `oneprolabs/hyperfilelens` commit `da6c0a57425e0749ca774df2e4c40f98901f9abd`
(`Restore native HyperOne protection workspaces`), including `43772683`
(`Extract shared backup workflow step styles`). Only prebuilt, directory-local static
assets are published here; no source build tooling or dependencies are added.

All data and operations are local fictional samples. The prototype does not
call a backend, store credentials, or represent a production integration.

Reference screenshots are stored separately at
`references/hyperfilelens/screenshots/` in the repository root.
