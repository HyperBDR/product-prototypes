import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appJs = readFileSync(path.join(repoRoot, 'portal', 'app.js'), 'utf8');

test('archived is not part of the default visible statuses', () => {
  const match = appJs.match(/const DEFAULT_STATUSES = (\[[^\]]*\]);/);
  assert.ok(match, 'DEFAULT_STATUSES constant not found in portal/app.js');
  const defaults = JSON.parse(match[1].replace(/'/g, '"'));
  assert.deepEqual(defaults.sort(), ['approved', 'draft', 'review']);
  assert.ok(!defaults.includes('archived'), 'archived should be hidden by default');
});
