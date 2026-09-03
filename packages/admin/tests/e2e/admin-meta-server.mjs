import { createServer } from 'node:http';
import { URL } from 'node:url';

const port = Number(process.env.ADMIN_META_E2E_PORT || 4180);
const VERSION_FETCH_TIMEOUT_MS = 1500;
const VERSION_CACHE_TTL_MS = 60 * 60 * 1000;
const VERSION_FAILURE_CACHE_TTL_MS = 30 * 1000;

const LOCAL_VERSION = '0.54.0';

let versionDelayMs = 3000;
let versionReachable = true;
let remoteVersion = {
  version: '0.99.0',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

let cache = null;
let inflight = null;
let cacheEpoch = 0;

function resetState() {
  versionDelayMs = 3000;
  versionReachable = true;
  remoteVersion = {
    version: '0.99.0',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
  cache = null;
  inflight = null;
  cacheEpoch += 1;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchVersionFromServer() {
  const wait = delay(versionDelayMs);
  const timeout = delay(VERSION_FETCH_TIMEOUT_MS).then(() => {
    throw new Error('timeout');
  });
  try {
    await Promise.race([wait, timeout]);
    if (!versionReachable) {
      return null;
    }
    return remoteVersion;
  } catch (err) {
    return null;
  }
}

function refreshVersionCache() {
  if (inflight) {
    return inflight;
  }
  const epoch = cacheEpoch;
  inflight = fetchVersionFromServer()
    .then((value) => {
      if (epoch !== cacheEpoch) {
        return cache?.value ?? null;
      }
      if (value) {
        cache = { value, fetchedAt: Date.now(), ttl: VERSION_CACHE_TTL_MS };
      } else {
        cache = {
          value: cache?.value ?? null,
          fetchedAt: Date.now(),
          ttl: VERSION_FAILURE_CACHE_TTL_MS,
        };
      }
      return cache.value;
    })
    .finally(() => {
      if (epoch === cacheEpoch) {
        inflight = null;
      }
    });
  return inflight;
}

function getCachedVersionFromServer() {
  const fresh = cache && Date.now() - cache.fetchedAt < cache.ttl;
  if (!fresh) {
    refreshVersionCache();
  }
  return cache?.value ?? null;
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function html(res, title, body) {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; margin: 24px; color: #1f1f1f; }
    .card { border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; max-width: 640px; }
    button { margin-right: 8px; }
    .muted { color: #666; }
  </style>
</head>
<body>
  <nav>
    <a href="/admin">后台首页</a>
  </nav>
  ${body}
</body>
</html>`);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function buildMeta() {
  const serverData = getCachedVersionFromServer();
  return {
    statusCode: 200,
    data: {
      version: LOCAL_VERSION,
      latestVersion: serverData?.version || LOCAL_VERSION,
      updatedAt: serverData?.updatedAt || new Date().toISOString(),
      user: { name: 'admin' },
      baseUrl: 'http://127.0.0.1:' + port,
      enableComment: 'true',
      allowDomains: '',
    },
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

  if (req.method === 'POST' && url.pathname === '/e2e/reset') {
    resetState();
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (typeof body.versionDelayMs === 'number') {
      versionDelayMs = body.versionDelayMs;
    }
    if (typeof body.versionReachable === 'boolean') {
      versionReachable = body.versionReachable;
    }
    getCachedVersionFromServer();
    return json(res, 200, { ok: true, versionDelayMs, versionReachable });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/meta') {
    return json(res, 200, buildMeta());
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    return html(
      res,
      'VanBlog admin meta E2E',
      `<h1>VanBlog admin meta E2E</h1>
       <p>远程版本接口被故意延迟，用来验证后台 <code>/api/admin/meta</code> 不再被堵住。</p>
       <p><a href="/admin">打开后台</a></p>`,
    );
  }

  if (url.pathname === '/admin') {
    return html(
      res,
      '管理后台',
      `<div class="card">
         <h1>管理后台</h1>
         <p id="dashboard-status">后台加载中…</p>
         <p>当前版本：<span id="local-version"></span></p>
         <p>最新版本：<span id="latest-version"></span></p>
         <p class="muted">/api/admin/meta 耗时：<span id="meta-duration"></span> ms</p>
         <button id="refresh-meta" type="button">重新请求 meta</button>
       </div>
       <script>
         async function loadMeta() {
           const started = performance.now();
           const res = await fetch('/api/admin/meta');
           const data = await res.json();
           const elapsed = Math.round(performance.now() - started);
           document.getElementById('local-version').textContent = data.data.version;
           document.getElementById('latest-version').textContent = data.data.latestVersion;
           document.getElementById('meta-duration').textContent = String(elapsed);
           document.getElementById('dashboard-status').textContent = '后台已就绪';
           document.getElementById('dashboard-status').dataset.ready = 'true';
         }
         document.getElementById('refresh-meta').onclick = loadMeta;
         loadMeta();
       </script>`,
    );
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`admin meta e2e at http://127.0.0.1:${port}`);
});
