#!/usr/bin/env node
// Scaffolds a new prototype from templates/basic.
//
// Usage:
//   npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign"
//   npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign" \
//     --description "..." --owner "Ray" --status review

import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ID_PATTERN, ALLOWED_STATUSES } from './lib/constants.mjs';

const rootDir = process.cwd();

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = value;
      i += 1;
    }
  }
  return out;
}

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exitCode = 1;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const productId = args.product;
  const prototypeId = args.id;
  const name = args.name;
  const description = args.description ?? 'UI prototype';
  const owner = args.owner ?? '';
  const status = args.status ?? 'draft';

  if (!productId || !prototypeId || !name) {
    fail('--product, --id and --name are required.\n\nExample:\n  npm run create -- --product hyperbdr --id dashboard-redesign --name "Dashboard Redesign"');
    return;
  }
  if (!ID_PATTERN.test(prototypeId)) {
    fail(`--id "${prototypeId}" is invalid. Use lowercase letters, digits and hyphens only (e.g. "dashboard-redesign").`);
    return;
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    fail(`--status "${status}" is invalid. Must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
    return;
  }

  const productDir = path.join(rootDir, 'products', productId);
  const productJsonPath = path.join(productDir, 'product.json');
  if (!existsSync(productJsonPath)) {
    fail(`Product "${productId}" not found (expected ${path.relative(rootDir, productJsonPath)} to exist).`);
    return;
  }
  const productData = JSON.parse(readFileSync(productJsonPath, 'utf8'));

  const targetDir = path.join(productDir, 'prototypes', prototypeId);
  if (existsSync(targetDir)) {
    fail(`Target directory already exists: ${path.relative(rootDir, targetDir)}. Choose a different --id.`);
    return;
  }

  const templateDir = path.join(rootDir, 'templates', 'basic');
  if (!existsSync(templateDir)) {
    fail(`Template not found at ${path.relative(rootDir, templateDir)}.`);
    return;
  }

  cpSync(templateDir, targetDir, { recursive: true });

  const prototypeJsonPath = path.join(targetDir, 'prototype.json');
  const prototypeData = JSON.parse(readFileSync(prototypeJsonPath, 'utf8'));
  prototypeData.id = prototypeId;
  prototypeData.name = name;
  prototypeData.description = description;
  prototypeData.status = status;
  prototypeData.owner = owner;
  writeFileSync(prototypeJsonPath, `${JSON.stringify(prototypeData, null, 2)}\n`, 'utf8');

  const indexHtmlPath = path.join(targetDir, 'index.html');
  let html = readFileSync(indexHtmlPath, 'utf8');
  html = html
    .split('__PROTOTYPE_NAME__').join(name)
    .split('__PRODUCT_NAME__').join(productData.name ?? productId);
  writeFileSync(indexHtmlPath, html, 'utf8');

  const relativeTarget = path.relative(rootDir, targetDir);
  console.log(`\nCreated prototype at ${relativeTarget}/`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit ${relativeTarget}/index.html`);
  console.log(`  2. Preview locally: npm run serve, then open http://localhost:8080/${relativeTarget}/`);
  console.log(`  3. npm run validate && npm run generate`);
  console.log('');
}

main();
