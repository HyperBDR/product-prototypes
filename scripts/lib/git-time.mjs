// Resolves the "last updated" timestamp for a prototype directory.
//
// Preference order (section X of the spec):
//   1. Last git commit touching the directory (git log -1 --format=%cI -- <dir>)
//   2. prototype.json mtime
//   3. Latest mtime of any file inside the directory
// Any failure at step 1 or 2 is downgraded to a warning, never a hard error —
// the build must keep going even without a clean git history.

import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';
import { latestMtimeInDir } from './scan.mjs';

export function getUpdatedAt(prototypeDir, { warn = console.warn } = {}) {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', prototypeDir],
      { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .toString()
      .trim();
    if (out) return new Date(out).toISOString();
  } catch (err) {
    warn(`[generate-portal] git log unavailable for ${prototypeDir}: ${err.message}`);
  }

  try {
    const jsonMtime = statSync(path.join(prototypeDir, 'prototype.json')).mtime;
    if (jsonMtime) return jsonMtime.toISOString();
  } catch (err) {
    warn(`[generate-portal] could not stat prototype.json in ${prototypeDir}: ${err.message}`);
  }

  const latest = latestMtimeInDir(prototypeDir);
  if (latest) return latest.toISOString();

  warn(`[generate-portal] no timestamp could be resolved for ${prototypeDir}, using build time`);
  return new Date().toISOString();
}
