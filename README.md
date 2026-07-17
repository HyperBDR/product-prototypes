# Product Prototypes

[![Deploy Pages](https://github.com/HyperBDR/product-prototypes/actions/workflows/deploy-pages.yml/badge.svg?branch=main)](https://github.com/HyperBDR/product-prototypes/actions/workflows/deploy-pages.yml)
[![Portal](https://img.shields.io/badge/Portal-Live-2f5fdc)](https://hyperbdr.github.io/product-prototypes/)

**中文** ・ [English](README.en.md)

用纯 HTML 页面搭建产品 UI 原型的仓库：把原型目录放到指定位置，推送后自动构建发布，
线上就能直接打开一个链接看效果 —— 不需要前端框架，不需要后端，不需要等排期。

**在线 Portal：https://hyperbdr.github.io/product-prototypes/**

## 目录

- [🧩 给原型制作者（先看这部分）](#for-authors)
- [🖥️ 本地预览（开发时可选）](#local-preview)
- [🛠️ 项目维护](#maintenance)

---

<a id="for-authors"></a>

## 🧩 一、给原型制作者（先看这部分）

### 这是什么

- 一个原型 = 一个独立的 HTML 页面（可以带自己的 CSS / JS / Mock 数据）。
- 放进指定目录、推到 `main`，几十秒后就能在线上打开，直接甩链接给产品 / 研发 / 客户评审。
- 不需要 `npm install`、不需要 Vue/React/Vite，写完 `index.html` 就是成品。

### 你的原型放哪里

```text
products/<产品目录>/prototypes/<你的原型ID>/
  ├── prototype.json   # 必须 —— id / name / description / status
  ├── index.html         # 必须 —— 单文件页面，style 写在 <style> 里，交互用原生 JS
  └── thumbnail.svg      # 建议 —— Portal 列表卡片用的缩略图
```

5 个产品目录已建好：`hyperbdr` / `sourcelens` / `hyperfilelens` / `devmind` / `hypercdr`。

最快的方式，一条命令生成骨架（会自动创建上面三个文件）：

```bash
npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign"
```

直接让 Claude Code / Codex 之类的 AI 工具帮你写也可以 —— 把上面的路径告诉它，
让它先读一遍 **[AGENTS.md](AGENTS.md)** 再动手，规则和标准步骤都在那份文件里。

### 为什么推荐做"动态"原型

比起一张静态设计图，动态原型可以点、可以切 Tab、可以走一遍完整交互流程 —— 评审的人不用
靠脑补理解"点了之后会发生什么"，沟通成本低很多。

而且不局限于"一个原型 = 一个界面"：一条业务流程、一个状态流转图、一套多步骤操作演示，
都可以用同一套方式做成原型（一个 HTML 页面 + Tab / 步骤条 / 状态切换的原生 JS 交互）。
用可交互的方式表达流程和状态，比静态截图或文档描述更直观、也更完整。

### 两条必须遵守的规则

> [!IMPORTANT]
> **一个原型 = 一个独立目录，不能互相牵连。** 不要在自己的原型里引用别的原型目录下的文件，
> 也不要顺手改了别的产品 / 原型的内容。这样任何一个原型才能被单独复制、删除、移动而不影响
> 别人。完整的隔离规则以 **[AGENTS.md](AGENTS.md)** 为准 —— 人和 AI 工具（Claude Code /
> Codex 等）都按这份文件执行，避免大家做隔离审查时标准不一致。

> [!WARNING]
> **不要手改 `portal/prototypes.generated.json`。** 这是构建脚本自动生成的清单，手改了
> 下次 `npm run generate` 会被直接覆盖。

### 版本怎么管理（V1 / V2 想留怎么办）

原型迭代如果**不需要保留旧版本**：直接在原目录改 `index.html` 就行，Git 历史本身就是记录。

如果**需要让旧版本继续可打开、可对比**（比如客户还想再看一眼 V1 方案），不要在原目录上
覆盖，而是新建一个带版本号的目录，两个版本各自完整独立、互不影响：

```text
products/hyperbdr/prototypes/dashboard-redesign-v1/
products/hyperbdr/prototypes/dashboard-redesign-v2/
```

把旧版本 `prototype.json` 里的 `status` 改成 `archived`（Portal 默认列表会隐藏，但打开
"Archived" 筛选或直接访问原链接都还能看到），新版本正常走 `draft → review → approved`。
这样版本历史在 Portal 里是"看得见的"，不用去翻 Git log。

### 提交前

```bash
npm run validate   # 校验 prototype.json / product.json 有没有问题
npm run generate    # 重新生成 Portal 清单
```

两个都通过再提交 —— CI 会再跑一遍，没通过不会发布到线上。

### 上线

Push 到 `main` 后 GitHub Actions 自动构建部署，几十秒后 Portal 就能看到：
**https://hyperbdr.github.io/product-prototypes/**

---

<a id="local-preview"></a>

## 🖥️ 二、本地预览（开发时可选）

理论上不需要在本地起服务 —— 写完直接推到 `main`，等线上部署看效果最省事。但开发过程中
来回调整，本地先看一眼更快：

```bash
npm install
npm run serve
```

打开 `http://localhost:8080/`，行为和线上 Pages 完全一致（相对路径、`fetch` 本地 JSON
都正常）。不 `fetch` 任何 JSON 的单文件原型，也可以直接双击 `index.html` 打开看。

---

<a id="maintenance"></a>

## 🛠️ 三、项目维护（改 Portal / 脚本 / CI 时看这里）

以下内容面向需要维护仓库本身（而不是只做原型）的人。

### 目录结构

```text
index.html                 Portal 首页
404.html                   404 页面，兼容 Pages 子路径
portal/                    Portal 的 JS/CSS + 自动生成的清单（不要手改 .json）
products/<id>/product.json + prototypes/<id>/{prototype.json,index.html,...}
templates/basic/           npm run create 用的起始模板
scripts/                   generate/validate/create/serve/build-dist，只依赖 Node 标准库
docs/                      字段参考、原型新增指南
test/                      node:test 测试
.github/workflows/         CI + Pages 部署
AGENTS.md                  AI 工具 / 人都要遵守的仓库规范（隔离规则的权威来源）
CLAUDE.md                  指向 AGENTS.md 的指针文件，见下方说明
```

### Portal 自动发现原理

`scripts/generate-portal.mjs` 扫描 `products/*/product.json` 和
`products/*/prototypes/*/prototype.json`，生成 `portal/prototypes.generated.json`，
Portal 页面读这个文件渲染。新增 / 删除原型不需要碰任何 Portal 代码。

### 元数据字段

完整字段参考、默认值、缩略图查找顺序：[docs/metadata-reference.md](docs/metadata-reference.md)。
新增原型的完整步骤（含更新时间的计算规则）：[docs/adding-a-prototype.md](docs/adding-a-prototype.md)。

原型状态：

| 值 | Portal 显示 | 默认是否展示 |
|---|---|---|
| `draft` | Draft | 是 |
| `review` | In Review | 是 |
| `approved` | Approved | 是 |
| `archived` | Archived | 否 —— 需要在 Portal 里手动打开 "Archived" 筛选 |

### 命令一览

| 命令 | 作用 |
|---|---|
| `npm run validate` | 校验所有 `product.json` / `prototype.json`，有错非零退出 |
| `npm run generate` | 重新生成 `portal/prototypes.generated.json` |
| `npm run build` | `validate && generate` |
| `npm run dist` | 打包 GitHub Pages 发布产物到 `dist/` |
| `npm run serve` | 本地静态服务器，`http://localhost:8080/` |
| `npm run create -- --product <id> --id <id> --name "..."` | 从模板生成新原型骨架 |
| `npm test` | 跑 `node --test`（`test/` 目录，内置测试运行器，无额外依赖） |

### CLAUDE.md 与 AGENTS.md 的关系

**`AGENTS.md` 是这个仓库对 AI 工具（以及人）的权威规范**，包含隔离硬规则、标准工作流、
版本管理约定；`CLAUDE.md` 只是一个指针，内容就是"去看 AGENTS.md"。这样两份文件不会
出现内容不一致、改了一个忘了改另一个的问题。

> [!NOTE]
> 规则以 `AGENTS.md` 为准。本 README 第一部分的隔离规则 / 版本管理是给人看的摘要，如果
> 和 `AGENTS.md` 有出入，以 `AGENTS.md` 为准，并提 PR 把 README 改回一致。

### 首次开启 GitHub Pages

1. GitHub 仓库 → **Settings → Pages → Build and deployment → Source** → 选择
   **GitHub Actions**。
2. 推送到 `main`（或在 Actions 页手动触发一次 workflow）。
3. workflow 的 `deploy` job 会打印发布后的地址。

### 设计约束

- 不引入数据库、后端服务、登录鉴权 —— 这是一个静态原型陈列室。
- 不做自动截图（Playwright/Puppeteer）—— 缩略图由原型作者提供，没提供就用前端生成的占位图。
- 不引入 Monorepo 工具、不引入打包器。Node.js 只用来扫描 / 校验 / 生成 / 本地预览，
  原型本身运行时不依赖它。

### 中英文 README 同步

`README.md`（中文，默认）和 [`README.en.md`](README.en.md)（English）结构必须保持一致 ——
改动其中一份时请同步更新另一份。
