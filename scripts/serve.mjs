#!/usr/bin/env node
// Zero-dependency static file server for local preview.
//
// Prototypes fetch() local JSON mock data and use relative URLs, so opening
// files directly from disk (file://) does not always work reliably. This
// server serves the repository (or --dir <path>) over plain HTTP so relative
// paths, fetch() and directory index resolution behave exactly like GitHub
// Pages does.
//
// Usage:
//   npm run serve              # serves the repo root at :8080 on all interfaces
//   node scripts/serve.mjs --dir dist --port 5000 --host 127.0.0.1

import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const args = process.argv.slice(2);
function argValue(flag, fallback) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx === args.length - 1) return fallback;
  return args[idx + 1];
}

const rootDir = path.resolve(process.cwd(), argValue('--dir', '.'));
const port = Number(argValue('--port', process.env.PORT ?? '8080'));
// Bind to all interfaces by default so the portal is reachable from other
// machines on the LAN (e.g. http://<this-host-ip>:8080/), not just localhost.
const host = argValue('--host', process.env.HOST ?? '0.0.0.0');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const resolved = path.normalize(path.join(rootDir, decoded));
  if (!resolved.startsWith(rootDir)) return null; // block path traversal
  return resolved;
}

function send404(res) {
  const notFoundPage = path.join(rootDir, '404.html');
  res.statusCode = 404;
  if (existsSync(notFoundPage)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    createReadStream(notFoundPage).pipe(res);
  } else {
    res.end('404 Not Found');
  }
}

const server = http.createServer((req, res) => {
  let filePath = safeResolve(req.url);
  if (!filePath) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    send404(res);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
  createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  console.log(`[serve] serving ${rootDir}`);
  console.log(`[serve]   http://localhost:${port}/`);
  if (host === '0.0.0.0') {
    console.log(`[serve]   also reachable via this machine's LAN IP, e.g. http://<host-ip>:${port}/`);
  }
});
