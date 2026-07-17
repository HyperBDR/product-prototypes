// Pure helper: derives the GitHub owner/repo/branch this Portal is being
// served from, so "View source" links never need a hardcoded repo URL.
// Kept as a standalone module so it can be unit-tested from Node (see
// test/repo-info.test.mjs) without a DOM.

export function resolveRepoInfo(hostname, pathname, fallback) {
  if (hostname.endsWith('.github.io')) {
    const owner = hostname.slice(0, -'.github.io'.length);
    const segments = pathname.split('/').filter(Boolean);
    const name = segments[0] || fallback.name;
    return { owner, name, branch: fallback.branch };
  }
  return fallback;
}
