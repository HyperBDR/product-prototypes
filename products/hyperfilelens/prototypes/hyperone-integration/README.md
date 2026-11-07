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
- Alerts/events, execution results and storage capacity retain a compact dashboard
  layout. Healthy connection badges are hidden; simulated unavailable statistics
  and unconnected capabilities have distinct explanations.

Source snapshot: `oneprolabs/hyperfilelens` commit `5bbb2441`
(`Restore the current host failback workflow`), including `add8cd43`
(`Keep container tasks in operations navigation`). Only prebuilt, directory-local static
assets are published here; no source build tooling or dependencies are added.

All data and operations are local fictional samples. The prototype does not
call a backend, store credentials, or represent a production integration.

Reference screenshots are stored separately at
`references/hyperfilelens/screenshots/` in the repository root.
