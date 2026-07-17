// Resolves which thumbnail file (if any) a prototype should use.
// Rules (section XI): an explicit `thumbnail` field wins if the file exists;
// otherwise fall back to the first matching file from DEFAULT_THUMBNAIL_CANDIDATES.
// If nothing is found, the Portal renders a generated placeholder client-side.

import { fileExistsInDir } from './scan.mjs';
import { DEFAULT_THUMBNAIL_CANDIDATES } from './constants.mjs';

export function resolveThumbnail(prototypeDir, declaredThumbnail) {
  if (declaredThumbnail && fileExistsInDir(prototypeDir, declaredThumbnail)) {
    return declaredThumbnail;
  }
  for (const candidate of DEFAULT_THUMBNAIL_CANDIDATES) {
    if (fileExistsInDir(prototypeDir, candidate)) return candidate;
  }
  return null;
}
