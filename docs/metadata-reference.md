# Metadata reference

## `product.json`

Lives at `products/<product-id>/product.json`.

```json
{
  "id": "hyperbdr",
  "name": "HyperBDR",
  "description": "Cloud disaster recovery and migration UI prototypes",
  "order": 10,
  "visible": true
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `id` | yes | string | Must exactly match the directory name. |
| `name` | yes | string | Shown on the Portal product card. |
| `description` | yes | string | Shown on the Portal product card. |
| `order` | yes | number | Sort order on the Portal (ascending). |
| `visible` | yes | boolean | `false` hides the product (and all its prototypes) from the Portal. The files remain reachable by direct URL. |

## `prototype.json`

Lives at `products/<product-id>/prototypes/<prototype-id>/prototype.json`.

```json
{
  "id": "dashboard-redesign",
  "name": "Dashboard Redesign",
  "description": "HyperBDR dashboard redesign proposal",
  "status": "draft",
  "owner": "Ray",
  "tags": ["dashboard", "overview"],
  "entry": "index.html",
  "thumbnail": "thumbnail.svg",
  "visible": true,
  "order": 10
}
```

### Required fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Must exactly match the directory name. Lowercase letters, digits and hyphens only, no spaces (`^[a-z0-9]+(-[a-z0-9]+)*$`). |
| `name` | string | Shown on the Portal prototype card. |
| `description` | string | Shown on the Portal prototype card and included in search. |
| `status` | string | One of `draft`, `review`, `approved`, `archived`. |

### Optional fields and defaults

| Field | Default | Notes |
|---|---|---|
| `owner` | `""` | Free text. |
| `tags` | `[]` | Array of strings, included in search. |
| `entry` | `"index.html"` | The file opened when someone clicks "Open prototype". Must exist. |
| `thumbnail` | auto-detected | See below. |
| `visible` | `true` | `false` hides the prototype from the Portal; the files remain reachable by direct URL. |
| `order` | `100` | Sort order within the product (ascending, used as a tiebreaker under the Portal's default sort by most-recently-updated). |

### Status labels

| `status` value | Portal label |
|---|---|
| `draft` | Draft |
| `review` | In Review |
| `approved` | Approved |
| `archived` | Archived |

Archived prototypes are hidden from the Portal's default view but can be shown with the "Archived" filter chip.

## Fields the Portal computes automatically

You never set these — they are derived by `scripts/generate-portal.mjs` and written into
`portal/prototypes.generated.json`:

- `productId` / `productName` — derived from the parent product directory / `product.json`.
- `url` — `products/<product-id>/prototypes/<prototype-id>/`.
- `sourcePath` — same path, used to build the "View source" GitHub link.
- `updatedAt` — see [adding-a-prototype.md](./adding-a-prototype.md#update-timestamps).

## Thumbnail resolution order

1. The file named in `thumbnail`, if present and it exists.
2. Otherwise, the first of these that exists in the prototype directory:
   `thumbnail.webp`, `thumbnail.png`, `thumbnail.jpg`, `thumbnail.jpeg`, `thumbnail.svg`.
3. Otherwise, the Portal renders a generated placeholder (product name + initials) — no file is required.
