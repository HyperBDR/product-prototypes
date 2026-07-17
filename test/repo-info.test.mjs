import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRepoInfo } from '../portal/repo-info.js';

const fallback = { owner: 'HyperBDR', name: 'product-prototypes', branch: 'main' };

test('derives owner and repo from a github.io host + path', () => {
  const info = resolveRepoInfo('hyperbdr.github.io', '/product-prototypes/', fallback);
  assert.deepEqual(info, { owner: 'hyperbdr', name: 'product-prototypes', branch: 'main' });
});

test('still resolves correctly if the repository is renamed', () => {
  const info = resolveRepoInfo('hyperbdr.github.io', '/some-renamed-repo/products/x/', fallback);
  assert.equal(info.name, 'some-renamed-repo');
  assert.equal(info.owner, 'hyperbdr');
});

test('falls back to the provided config off github.io (e.g. local preview)', () => {
  const info = resolveRepoInfo('localhost', '/', fallback);
  assert.deepEqual(info, fallback);
});
