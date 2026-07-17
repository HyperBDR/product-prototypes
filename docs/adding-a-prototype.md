# Adding a prototype

## Option A: the CLI

```bash
npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign"

# optional flags:
npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign" \
  --description "HyperBDR dashboard redesign proposal" \
  --owner "Ray" \
  --status review
```

This copies `templates/basic/` into
`products/hyperbdr/prototypes/dashboard-redesign/`, fills in `prototype.json`, and
substitutes the title placeholders in `index.html`. It refuses to overwrite an
existing directory.

## Option B: by hand (or via an AI coding tool)

1. Create `products/<product-id>/prototypes/<prototype-id>/`.
2. Add `prototype.json` (see [metadata-reference.md](./metadata-reference.md)).
3. Add `index.html` — single file, HTML5, inline `<style>`, native JavaScript, local mock data.
4. Optionally add `thumbnail.svg` (or `.png`/`.jpg`/`.webp`).
5. Run:
   ```bash
   npm run validate
   npm run generate
   ```

## Rules every prototype must follow

- One prototype = one directory. Don't reference files in another prototype's directory.
- Only relative paths (`./`, `assets/...`) — never a leading `/`.
- No `npm install`, no build step, no dev server requirement. It must open as a static file.
- Mock data only — no real backend calls.
- Directory name, `id` in `prototype.json`, and the final Portal URL are always identical.

## Update timestamps

You never set an "updated at" field. `scripts/generate-portal.mjs` resolves it automatically, in this order:

1. `git log -1 --format=%cI -- <prototype-directory>` (last commit touching the directory).
2. `prototype.json`'s file modification time, if git history isn't available.
3. The most recently modified file inside the prototype directory, as a last resort.

A failure at any step is logged as a warning — it never stops the build.

## Keeping old versions (V1, V2, ...)

If a redesign doesn't need its previous round to stay independently viewable, just edit
`index.html` in place — git history is your record.

If it does (a stakeholder wants to keep comparing V1 and V2 side by side), don't
overwrite the old directory. Copy it to a new, fully independent directory instead:

```
products/hyperbdr/prototypes/dashboard-redesign-v1/
products/hyperbdr/prototypes/dashboard-redesign-v2/
```

Set the old version's `status` to `archived` in its `prototype.json` (hidden from the
Portal's default view, still reachable via the "Archived" filter or its direct URL) and
keep iterating in the new directory. This makes version history browsable from the
Portal itself, not just `git log`.

## Removing a prototype

Delete its directory, then run `npm run validate && npm run generate`. Nothing else
references it — the Portal listing is fully auto-discovered.
