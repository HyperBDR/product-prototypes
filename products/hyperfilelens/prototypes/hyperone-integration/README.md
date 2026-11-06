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
- Product overview pages preserve product-specific terminology and workflows.
- Professional pages retain product-specific menus and configuration flows.
- Dashboard metrics open matching existing resource or task menu pages, preserving
  the selected scope through reloads and offering a clear-filter action.
- Alerts/events, execution results and storage capacity retain a compact dashboard
  layout. Healthy connection badges are hidden; simulated unavailable statistics
  and unconnected capabilities have distinct explanations.

Source snapshot: `oneprolabs/hyperfilelens` commit `dce09074`
(`Refine HyperOne platform prototype`). Only prebuilt, directory-local static
assets are published here; no source build tooling or dependencies are added.

All data and operations are local fictional samples. The prototype does not
call a backend, store credentials, or represent a production integration.

Reference screenshots are stored separately at
`references/hyperfilelens/screenshots/` in the repository root.
