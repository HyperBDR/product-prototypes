import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateProduct, validatePrototype } from '../scripts/validate-prototypes.mjs';

function makeTmpDir() {
  return mkdtempSync(path.join(os.tmpdir(), 'ui-prototypes-validate-'));
}

function productEntry(dir, dirName, data) {
  const jsonPath = path.join(dir, 'product.json');
  writeFileSync(jsonPath, JSON.stringify(data));
  return { dir, dirName, jsonPath, data, error: null };
}

function prototypeEntry(dir, dirName, data, extraFiles = {}) {
  mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, 'prototype.json');
  writeFileSync(jsonPath, JSON.stringify(data));
  for (const [name, content] of Object.entries(extraFiles)) {
    writeFileSync(path.join(dir, name), content);
  }
  return { dir, dirName, jsonPath, data, error: null };
}

test('valid prototype passes with no errors', () => {
  const tmp = makeTmpDir();
  try {
    const dir = path.join(tmp, 'my-proto');
    const entry = prototypeEntry(dir, 'my-proto', {
      id: 'my-proto', name: 'My Proto', description: 'desc', status: 'draft',
    }, { 'index.html': '<html></html>' });
    const errors = [];
    validatePrototype({ dirName: 'p' }, entry, errors);
    assert.deepEqual(errors, []);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('invalid status is rejected', () => {
  const tmp = makeTmpDir();
  try {
    const dir = path.join(tmp, 'my-proto');
    const entry = prototypeEntry(dir, 'my-proto', {
      id: 'my-proto', name: 'My Proto', description: 'desc', status: 'in-progress',
    }, { 'index.html': '<html></html>' });
    const errors = [];
    validatePrototype({ dirName: 'p' }, entry, errors);
    assert.ok(errors.some((e) => e.includes('status')), `expected a status error, got: ${errors}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('missing entry file is rejected', () => {
  const tmp = makeTmpDir();
  try {
    const dir = path.join(tmp, 'my-proto');
    const entry = prototypeEntry(dir, 'my-proto', {
      id: 'my-proto', name: 'My Proto', description: 'desc', status: 'draft',
    }); // no index.html written
    const errors = [];
    validatePrototype({ dirName: 'p' }, entry, errors);
    assert.ok(errors.some((e) => e.includes('entry file')), `expected an entry-file error, got: ${errors}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('id mismatched with directory name is rejected', () => {
  const tmp = makeTmpDir();
  try {
    const dir = path.join(tmp, 'my-proto');
    const entry = prototypeEntry(dir, 'my-proto', {
      id: 'a-different-id', name: 'My Proto', description: 'desc', status: 'draft',
    }, { 'index.html': '<html></html>' });
    const errors = [];
    validatePrototype({ dirName: 'p' }, entry, errors);
    assert.ok(errors.some((e) => e.includes('must match directory name')), `expected an id-mismatch error, got: ${errors}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('product id mismatched with directory name is rejected', () => {
  const tmp = makeTmpDir();
  try {
    const dir = path.join(tmp, 'my-product');
    mkdirSync(dir, { recursive: true });
    const entry = productEntry(dir, 'my-product', {
      id: 'wrong-id', name: 'My Product', description: 'desc', order: 10, visible: true,
    });
    const errors = [];
    validateProduct(entry, errors);
    assert.ok(errors.some((e) => e.includes('must match directory name')), `expected an id-mismatch error, got: ${errors}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
