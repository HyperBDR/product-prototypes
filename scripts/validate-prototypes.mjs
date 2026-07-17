#!/usr/bin/env node
// Validates every products/*/product.json and products/*/prototypes/*/prototype.json
// against the rules in docs/metadata-reference.md.
//
// Exits with a non-zero status (and prints every error found) if anything is
// invalid. This is the gate that blocks a GitHub Pages publish — see
// .github/workflows/deploy-pages.yml.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRepo, fileExistsInDir } from './lib/scan.mjs';
import { ALLOWED_STATUSES, ID_PATTERN, DEFAULT_PROTOTYPE_ENTRY } from './lib/constants.mjs';

const rootDir = process.cwd();

function isBoolean(v) {
  return typeof v === 'boolean';
}
function isNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function isStringArray(v) {
  return Array.isArray(v) && v.every((item) => typeof item === 'string');
}

export function validateProduct(product, errors) {
  const label = product.jsonPath;

  if (product.error) {
    errors.push(`${label}: ${product.error}`);
    return null;
  }
  const data = product.data ?? {};

  for (const field of ['id', 'name', 'description']) {
    if (!isNonEmptyString(data[field])) {
      errors.push(`${label}: missing or invalid required field "${field}"`);
    }
  }
  if (!('order' in data) || !isNumber(data.order)) {
    errors.push(`${label}: "order" must be a number`);
  }
  if (!('visible' in data) || !isBoolean(data.visible)) {
    errors.push(`${label}: "visible" must be a boolean`);
  }
  if (isNonEmptyString(data.id) && data.id !== product.dirName) {
    errors.push(`${label}: "id" ("${data.id}") must match directory name ("${product.dirName}")`);
  }
  if (!ID_PATTERN.test(product.dirName)) {
    errors.push(`${product.dir}: directory name "${product.dirName}" must be lowercase letters, digits and hyphens only`);
  }

  return data;
}

export function validatePrototype(product, prototype, errors) {
  const label = prototype.jsonPath;

  if (prototype.error) {
    errors.push(`${label}: ${prototype.error}`);
    return;
  }
  const data = prototype.data ?? {};

  for (const field of ['id', 'name', 'description', 'status']) {
    if (!isNonEmptyString(data[field])) {
      errors.push(`${label}: missing or invalid required field "${field}"`);
    }
  }
  if (isNonEmptyString(data.id) && data.id !== prototype.dirName) {
    errors.push(`${label}: "id" ("${data.id}") must match directory name ("${prototype.dirName}")`);
  }
  if (!ID_PATTERN.test(prototype.dirName)) {
    errors.push(`${prototype.dir}: directory name "${prototype.dirName}" must be lowercase letters, digits and hyphens only (no spaces)`);
  }
  if (isNonEmptyString(data.status) && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push(`${label}: "status" must be one of ${ALLOWED_STATUSES.join(', ')}, got "${data.status}"`);
  }

  const entry = isNonEmptyString(data.entry) ? data.entry : DEFAULT_PROTOTYPE_ENTRY;
  if (!fileExistsInDir(prototype.dir, entry)) {
    errors.push(`${label}: entry file "${entry}" does not exist in ${prototype.dir}`);
  }

  if ('thumbnail' in data && data.thumbnail !== undefined) {
    if (!isNonEmptyString(data.thumbnail)) {
      errors.push(`${label}: "thumbnail" must be a string when present`);
    } else if (!fileExistsInDir(prototype.dir, data.thumbnail)) {
      errors.push(`${label}: thumbnail file "${data.thumbnail}" does not exist in ${prototype.dir}`);
    }
  }

  if ('tags' in data && data.tags !== undefined && !isStringArray(data.tags)) {
    errors.push(`${label}: "tags" must be an array of strings`);
  }
  if ('visible' in data && data.visible !== undefined && !isBoolean(data.visible)) {
    errors.push(`${label}: "visible" must be a boolean`);
  }
  if ('order' in data && data.order !== undefined && !isNumber(data.order)) {
    errors.push(`${label}: "order" must be a number`);
  }
}

export function main() {
  const errors = [];
  const { products } = scanRepo(rootDir);

  if (products.length === 0) {
    errors.push(`No products found under ${path.join(rootDir, 'products')}`);
  }

  const seenProductIds = new Set();

  for (const product of products) {
    const data = validateProduct(product, errors);
    const productId = data?.id ?? product.dirName;
    if (seenProductIds.has(productId)) {
      errors.push(`${product.jsonPath}: duplicate product id "${productId}"`);
    }
    seenProductIds.add(productId);

    const seenPrototypeIds = new Set();
    for (const prototype of product.prototypes) {
      validatePrototype(product, prototype, errors);
      const prototypeId = prototype.data?.id ?? prototype.dirName;
      if (seenPrototypeIds.has(prototypeId)) {
        errors.push(`${prototype.jsonPath}: duplicate prototype id "${prototypeId}" within product "${productId}"`);
      }
      seenPrototypeIds.add(prototypeId);
    }
  }

  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} error(s):\n`);
    for (const err of errors) console.error(`  - ${err}`);
    console.error('');
    process.exitCode = 1;
    return;
  }

  const prototypeCount = products.reduce((sum, p) => sum + p.prototypes.length, 0);
  console.log(`Validation passed: ${products.length} product(s), ${prototypeCount} prototype(s).`);
}

// Only auto-run when executed directly (`node scripts/validate-prototypes.mjs`),
// not when imported by tests.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
