import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRepo } from '../scripts/lib/scan.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('discovers all five preset products', () => {
  const { products } = scanRepo(repoRoot);
  const ids = products.map((p) => p.dirName).sort();
  assert.deepEqual(ids, ['devmind', 'hyperbdr', 'hypercdr', 'hyperfilelens', 'sourcelens']);
});

test('each preset product has an example prototype', () => {
  const { products } = scanRepo(repoRoot);
  for (const product of products) {
    const hasExample = product.prototypes.some((p) => p.dirName === 'example');
    assert.ok(hasExample, `${product.dirName} is missing its example prototype`);
  }
});

test('prototypes are scanned under their own product directory only', () => {
  const { products } = scanRepo(repoRoot);
  for (const product of products) {
    for (const prototype of product.prototypes) {
      assert.ok(
        prototype.dir.startsWith(path.join(product.dir, 'prototypes')),
        `${prototype.dir} should live under ${product.dir}/prototypes`,
      );
    }
  }
});
