#!/usr/bin/env node
// Assembles the GitHub Pages publish artifact in dist/.
//
// Only what actually needs to be served is copied: the Portal shell, its
// generated manifest, every product's prototypes, and the 404 page. Dev-only
// material (scripts, templates, docs, package.json, CI config) is left out.

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

function copy(relativeSource, relativeDest = relativeSource) {
  const source = path.join(rootDir, relativeSource);
  if (!existsSync(source)) {
    throw new Error(`build-dist: expected ${relativeSource} to exist`);
  }
  const dest = path.join(distDir, relativeDest);
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(source, dest, { recursive: true });
}

function main() {
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });

  copy('index.html');
  copy('404.html');
  copy('portal');
  copy('products');

  console.log(`[build-dist] wrote publish artifact to ${path.relative(rootDir, distDir)}/`);
}

main();
