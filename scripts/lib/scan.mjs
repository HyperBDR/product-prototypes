// Filesystem discovery for products and prototypes.
// This module only *reads* the tree — it does not decide whether the data is
// valid. validate-prototypes.mjs and generate-portal.mjs each apply their own
// rules on top of the raw scan result.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { PRODUCTS_DIR, PROTOTYPES_SUBDIR, PRODUCT_FILE, PROTOTYPE_FILE } from './constants.mjs';

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

// Reads and parses a JSON file. Never throws — parse errors are returned
// alongside the (null) data so callers can report them instead of crashing.
export function readJsonSafe(filePath) {
  if (!existsSync(filePath)) {
    return { data: null, error: `File not found: ${filePath}` };
  }
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (err) {
    return { data: null, error: `Failed to read ${filePath}: ${err.message}` };
  }
  try {
    return { data: JSON.parse(raw), error: null };
  } catch (err) {
    return { data: null, error: `Invalid JSON in ${filePath}: ${err.message}` };
  }
}

// Scans rootDir/products/*/product.json and rootDir/products/*/prototypes/*/prototype.json.
// Returns raw entries; each entry carries its directory name (for id-vs-dirname checks)
// and any JSON parse error found along the way.
export function scanRepo(rootDir) {
  const productsRoot = path.join(rootDir, PRODUCTS_DIR);
  const products = [];

  for (const productDirName of listDirs(productsRoot)) {
    const productDir = path.join(productsRoot, productDirName);
    const productJsonPath = path.join(productDir, PRODUCT_FILE);
    const { data, error } = readJsonSafe(productJsonPath);

    const prototypesDir = path.join(productDir, PROTOTYPES_SUBDIR);
    const prototypes = [];
    for (const prototypeDirName of listDirs(prototypesDir)) {
      const prototypeDir = path.join(prototypesDir, prototypeDirName);
      const prototypeJsonPath = path.join(prototypeDir, PROTOTYPE_FILE);
      const parsed = readJsonSafe(prototypeJsonPath);
      prototypes.push({
        dirName: prototypeDirName,
        dir: prototypeDir,
        jsonPath: prototypeJsonPath,
        data: parsed.data,
        error: parsed.error,
      });
    }

    products.push({
      dirName: productDirName,
      dir: productDir,
      jsonPath: productJsonPath,
      data,
      error,
      prototypes,
    });
  }

  return { products };
}

export function fileExistsInDir(dir, relativeFile) {
  if (!relativeFile) return false;
  // Reject anything that could escape the prototype directory.
  if (relativeFile.includes('..') || path.isAbsolute(relativeFile)) return false;
  return existsSync(path.join(dir, relativeFile));
}

export function latestMtimeInDir(dir) {
  let latest = null;
  const walk = (current) => {
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        try {
          const mtime = statSync(full).mtime;
          if (!latest || mtime > latest) latest = mtime;
        } catch {
          // ignore unreadable file
        }
      }
    }
  };
  walk(dir);
  return latest;
}
