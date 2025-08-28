// Simple static file server for development
// Usage: node dev-server.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.argv[2]) || 3000;
const root = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json; charset=utf-8'
};

function safeJoin(base, target) {
  const targetPath = path.join(base, target);
  if (!targetPath.startsWith(base)) {
    return base; // Prevent path traversal
  }
  return targetPath;
}

const server = http.createServer((req, res) => {
  // Normalize URL; strip query/hash
  const urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  let filePath = urlPath === '/' ? path.join(root, 'index.html') : safeJoin(root, urlPath.replace(/^\/+/, ''));

  fs.stat(filePath, (err, stat) => {
    if (err) {
      // If a directory was requested, try index.html inside it
      if (urlPath.endsWith('/')) {
        const indexPath = path.join(filePath, 'index.html');
        fs.stat(indexPath, (err2, stat2) => {
          if (!err2 && stat2.isFile()) {
            return streamFile(indexPath, res);
          }
          return notFound(res);
        });
        return;
      }
      return notFound(res);
    }

    if (stat.isDirectory()) {
      // Directory requested without trailing slash: redirect
      res.statusCode = 301;
      res.setHeader('Location', urlPath + '/');
      res.end('Redirecting');
      return;
    }

    streamFile(filePath, res);
  });
});

function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  // Basic caching for static assets
  if (!filePath.endsWith('index.html')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => notFound(res));
  stream.pipe(res);
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
}

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port} (root: ${root})`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

