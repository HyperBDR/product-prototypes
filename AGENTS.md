# AGENTS.md

Instructions for any AI coding tool (Claude Code, Codex, or otherwise) working in this
repository. This is a static gallery of framework-free HTML pages, not a product
codebase — read this before creating or editing anything.

## What this repo is

- A collection of independent, framework-free HTML "prototypes," grouped by product,
  published to GitHub Pages behind an auto-discovering Portal (`index.html` + `portal/`).
  "Prototype" is used loosely here: it covers UI mockups as well as anything else that
  can be expressed in HTML — architecture diagrams, module/structure diagrams, business
  flowcharts, state diagrams, design write-ups. Same directory shape, same rules, same
  publish flow, regardless of what kind of content it is.
- Node.js exists only to scan/validate/generate/serve. It is never a runtime dependency
  of a prototype itself.

Full rules: [docs/adding-a-prototype.md](docs/adding-a-prototype.md) and
[docs/metadata-reference.md](docs/metadata-reference.md). This file is the summary you
should follow by default; read those two for anything not covered here.

## Hard isolation rules — do not violate these

1. **A prototype lives entirely inside its own directory**:
   `products/<product-id>/prototypes/<prototype-id>/`. Never reference, import, or
   read a file from a different prototype's directory, and never write into one unless
   that prototype is explicitly the task.
2. **Never edit `portal/prototypes.generated.json` by hand.** It is machine-generated
   by `scripts/generate-portal.mjs`. Edit the relevant `product.json` / `prototype.json`
   instead, then run `npm run generate`.
3. **Never edit files under `scripts/`, `portal/app.js`, `portal/styles.css`,
   `portal/repo-info.js`, `templates/`, or `.github/workflows/`** unless the user's task
   is explicitly about the Portal or the build/deploy tooling itself. The default task
   ("add/update a prototype") never requires touching these.
4. **No frameworks, no build step, no `npm install` inside a prototype.** No Vue,
   React, Angular, Vite, webpack, or any bundler. Plain HTML5 + `<style>` + native
   JavaScript only.
5. **Only relative paths.** Never start an asset path with `/`. A prototype must work
   whether the repo is served at `/` or under a GitHub Pages subpath.
6. **Mock data only.** No calls to real backends or external APIs from a prototype.
   CDNs are allowed but should be minimized, version-pinned, and non-essential to core
   navigation (the page should still be legible if a CDN fails to load).
7. **Directory name, `id` in `prototype.json`, and the URL are always identical.** If
   you rename one, rename all three together.
8. **To keep an old version viewable, don't overwrite it — version the directory.**
   If a redesign should keep the previous round visible/shareable (not just in git
   history), copy it to a new directory (`dashboard-redesign-v1` → `-v2`) instead of
   editing in place, and set the old one's `status` to `archived`. Never edit an old
   version's files to "update" it into the new one — that defeats the point of keeping it.

## Standard workflow for "add a prototype"

1. Create `products/<product-id>/prototypes/<prototype-id>/` (or use
   `npm run create -- --product <id> --id <id> --name "..."`).
2. Add `prototype.json` (required fields: `id`, `name`, `description`, `status`).
3. Add `index.html` — single file, inline `<style>`, native JS, local mock data.
4. Optionally add `thumbnail.svg` (or `.png`/`.jpg`/`.webp`).
5. Run, in order:
   ```bash
   npm run validate
   npm run generate
   ```
   Both must pass before you consider the task done. `npm run validate` will fail loudly
   (non-zero exit, specific file + reason) if metadata is malformed — fix and re-run
   rather than working around it.

## Commands reference

| Command | Purpose |
|---|---|
| `npm run validate` | Checks every `product.json` / `prototype.json`. Must pass before publishing. |
| `npm run generate` | Rebuilds `portal/prototypes.generated.json` from the current tree. |
| `npm run build` | `validate && generate`. |
| `npm run dist` | Assembles the GitHub Pages publish artifact into `dist/`. |
| `npm run serve` | Local static server at `http://localhost:8080/` for previewing. |
| `npm run create -- --product <id> --id <id> --name "..."` | Scaffolds a new prototype from `templates/basic`. |
| `npm test` | Runs `node --test` over `test/`. |

## When in doubt

If a task seems to require touching Portal code, generation scripts, or CI config,
confirm that's really what was asked before doing it — the overwhelmingly common task
in this repo is "add/edit one prototype directory," which never needs any of that.
