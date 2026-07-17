# Product Prototypes

A static, framework-free repository for AI-generated product UI prototypes
(Codex, Claude Code, etc.), published to GitHub Pages behind a single
auto-discovering Portal.

- No Vue/React/Angular, no Vite, no `npm install` inside a prototype.
- Every prototype is a self-contained `index.html` you can also open directly from disk.
- Adding a prototype never requires touching Portal code — it's discovered automatically.

**If you are an AI coding tool working in this repo, read [AGENTS.md](AGENTS.md) first** —
it has the hard directory-isolation rules and the standard prototype workflow.
`CLAUDE.md` just points here so the two never drift apart.

## Live Portal

Once GitHub Pages is enabled (see below), the Portal is available at:

```
https://<organization>.github.io/<repository>/
```

For this repository that is:

```
https://hyperbdr.github.io/product-prototypes/
```

## Products

```
products/hyperbdr/         HyperBDR
products/sourcelens/       SourceLens
products/hyperfilelens/    HyperFileLens
products/devmind/          DevMind
products/hypercdr/         HyperCDR
```

Each product directory has a `product.json` (name/description/order/visible) and a
`prototypes/` folder. Each product currently ships one `example` prototype so you can
see the Portal auto-discovery working end to end — **these `example/` prototypes are
safe to delete** once you have real content; just remove the directory and re-run
`npm run generate`.

## Quick start

```bash
npm install
npm run generate   # builds portal/prototypes.generated.json from products/*
npm run serve       # http://localhost:8080/
```

No frontend framework is installed for prototype development — `npm install` only
pulls in the (empty) dependency set for the repo's own scripts.

## Adding a new prototype

```bash
npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign"
```

See [docs/adding-a-prototype.md](docs/adding-a-prototype.md) for the full guide
(manual creation, required files, update timestamps, deletion).

## Prompting an AI tool to generate a prototype

Paste this into Claude Code / Codex / etc., adjusting the product and prototype id:

```
请在 products/<product-id>/prototypes/<prototype-id>/ 下创建一个 UI 原型。

要求：
1. 默认生成 prototype.json、index.html 和 thumbnail.svg。
2. 默认使用单文件 HTML。
3. CSS 写在 style 标签中。
4. 交互使用原生 JavaScript。
5. 不使用 Vue、React、Vite 或 npm 构建。
6. 使用本地 Mock 数据。
7. 所有资源使用相对路径。
8. 不修改其他产品或原型目录。
9. 页面必须可以通过静态服务器直接访问。
10. 完成后运行 npm run validate 和 npm run generate。
```

## Metadata

Every product needs `product.json`; every prototype needs `prototype.json`. Full field
reference, defaults and the thumbnail resolution order: [docs/metadata-reference.md](docs/metadata-reference.md).

## Prototype status values

| Value | Portal label | Shown by default? |
|---|---|---|
| `draft` | Draft | yes |
| `review` | In Review | yes |
| `approved` | Approved | yes |
| `archived` | Archived | no — toggle the "Archived" chip in the Portal |

## Directory isolation

- A prototype may only reference files inside its own `products/<p>/prototypes/<id>/` directory.
- A prototype must be safely copyable, deletable, or movable without breaking any other prototype.
- Nothing in `portal/` or `scripts/` needs editing when a prototype is added, edited or removed.

## Validation & the generated manifest

```bash
npm run validate    # checks every product.json / prototype.json — exits non-zero on error
npm run generate     # (re)writes portal/prototypes.generated.json
npm run build         # validate && generate
```

`portal/prototypes.generated.json` is **machine-generated — never edit it by hand**.
It is rebuilt from `products/*/product.json` and `products/*/prototypes/*/prototype.json`
every time `npm run generate` runs (and on every CI build).

## Local preview

```bash
npm run serve
```

Serves the whole repository at `http://localhost:8080/`, so the root Portal, `portal/`,
and every `products/<p>/prototypes/<id>/` work exactly like they do on GitHub Pages
(relative paths, `fetch()` of local JSON, etc.). Most single-file prototypes that don't
`fetch()` anything can also still be opened directly by double-clicking `index.html`.

## Testing

```bash
npm test
```

Runs the Node.js built-in test runner (`node --test`) over `test/` — no test framework
dependency required.

## Publishing to GitHub Pages

Push to `main` (or trigger the workflow manually) and GitHub Actions
(`.github/workflows/deploy-pages.yml`) will validate, generate, build `dist/`, and
deploy it via the official `actions/deploy-pages` action. Pull requests only run
validation/build/tests — they never deploy.

### First-time repository setup

1. In GitHub: **Settings → Pages → Build and deployment → Source** → select **GitHub Actions**.
2. Push to `main` (or run the workflow manually from the **Actions** tab).
3. The workflow prints the published URL in its `deploy` job summary once it finishes.

## Repository layout

```
index.html                 Portal shell
404.html                   Not-found page, subpath-safe
portal/                    Portal JS/CSS + generated manifest (do not hand-edit the .json)
products/<id>/product.json + prototypes/<id>/{prototype.json,index.html,...}
templates/basic/           Starter template used by `npm run create`
scripts/                   generate/validate/create/serve/build-dist, Node stdlib only
docs/                      This documentation
test/                      node:test suite
.github/workflows/         CI + Pages deployment
```

## Design constraints (why things are the way they are)

- No database, no backend service, no auth — this is a static prototype gallery.
- No screenshot automation (Playwright/Puppeteer) in this version — thumbnails are either
  provided by the prototype author or auto-generated client-side as a placeholder.
- No monorepo tooling, no bundler. Node.js is only used to scan/validate/generate/serve —
  never by a prototype itself at runtime.
