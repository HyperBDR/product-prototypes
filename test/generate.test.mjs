import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generateScript = path.join(repoRoot, 'scripts', 'generate-portal.mjs');

function writeProduct(fixtureDir, id, data) {
  const dir = path.join(fixtureDir, 'products', id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'product.json'), JSON.stringify(data, null, 2));
  return dir;
}

function writePrototype(productDir, id, data, { withEntry = true } = {}) {
  const dir = path.join(productDir, 'prototypes', id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'prototype.json'), JSON.stringify(data, null, 2));
  if (withEntry) writeFileSync(path.join(dir, 'index.html'), '<html></html>');
  return dir;
}

function runGenerate(fixtureDir) {
  execFileSync('node', [generateScript], { cwd: fixtureDir, stdio: 'pipe' });
  const manifestPath = path.join(fixtureDir, 'portal', 'prototypes.generated.json');
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

test('hidden products and prototypes are excluded from the generated manifest', () => {
  const fixtureDir = mkdtempSync(path.join(os.tmpdir(), 'ui-prototypes-generate-'));
  try {
    const visibleProductDir = writeProduct(fixtureDir, 'visible-product', {
      id: 'visible-product', name: 'Visible Product', description: 'd', order: 10, visible: true,
    });
    writePrototype(visibleProductDir, 'visible-proto', {
      id: 'visible-proto', name: 'Visible Proto', description: 'd', status: 'draft', visible: true,
    });
    writePrototype(visibleProductDir, 'hidden-proto', {
      id: 'hidden-proto', name: 'Hidden Proto', description: 'd', status: 'draft', visible: false,
    });

    const hiddenProductDir = writeProduct(fixtureDir, 'hidden-product', {
      id: 'hidden-product', name: 'Hidden Product', description: 'd', order: 20, visible: false,
    });
    writePrototype(hiddenProductDir, 'proto-in-hidden-product', {
      id: 'proto-in-hidden-product', name: 'X', description: 'd', status: 'draft', visible: true,
    });

    const manifest = runGenerate(fixtureDir);

    const productIds = manifest.products.map((p) => p.id);
    assert.deepEqual(productIds, ['visible-product']);

    const prototypeIds = manifest.prototypes.map((p) => p.id);
    assert.deepEqual(prototypeIds, ['visible-proto']);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('generated urls are relative (subpath-safe, no leading slash)', () => {
  const fixtureDir = mkdtempSync(path.join(os.tmpdir(), 'ui-prototypes-generate-'));
  try {
    const productDir = writeProduct(fixtureDir, 'acme', {
      id: 'acme', name: 'Acme', description: 'd', order: 10, visible: true,
    });
    writePrototype(productDir, 'widget', {
      id: 'widget', name: 'Widget', description: 'd', status: 'approved', visible: true,
    });

    const manifest = runGenerate(fixtureDir);
    const [prototype] = manifest.prototypes;

    assert.equal(prototype.url, 'products/acme/prototypes/widget/');
    assert.equal(prototype.sourcePath, 'products/acme/prototypes/widget');
    assert.ok(!prototype.url.startsWith('/'), 'url must not start with a leading slash');
    assert.equal(prototype.productId, 'acme');
    assert.equal(prototype.productName, 'Acme');
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
