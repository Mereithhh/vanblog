import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'fixtures', 'dist');
const port = Number(process.env.MERMAID_E2E_PORT || 4177);

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(here, 'build-fixture.mjs')], {
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`fixture build failed with code ${code}`));
  });
});

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  const relative = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(dist, relative));
  if (!filePath.startsWith(dist)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`mermaid editor e2e fixture at http://127.0.0.1:${port}`);
});
