import { createServer } from 'node:http';
import { URL } from 'node:url';

const port = Number(process.env.BACKUP_E2E_PORT || 4178);

function collectCategoriesFromBackup(data = {}) {
  const byName = new Map();
  const add = (raw) => {
    if (raw == null || raw === '') return;
    if (typeof raw === 'string') {
      const name = raw.trim();
      if (!name || byName.has(name)) return;
      byName.set(name, { name });
      return;
    }
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) return;
    const prev = byName.get(name) || { name };
    byName.set(name, {
      name,
      id: raw.id ?? prev.id,
      type: raw.type ?? prev.type,
      private: raw.private ?? prev.private,
      password: raw.password ?? prev.password,
    });
  };
  (data.categories || []).forEach(add);
  (data.meta?.categories || []).forEach(add);
  (data.articles || []).forEach((article) => add(article?.category));
  (data.drafts || []).forEach((draft) => add(draft?.category));
  return Array.from(byName.values());
}

function seedOldMachine() {
  return {
    articles: [
      {
        id: 1,
        title: '迁徙后的第一篇',
        category: '随笔',
        content: '从旧机器导出后再导入。',
        hidden: false,
        private: false,
      },
      {
        id: 2,
        title: 'Docker 部署笔记',
        category: '教程',
        content: 'compose 启动。',
        hidden: false,
        private: false,
      },
    ],
    categories: [
      { id: 1, name: '随笔', type: 'category', private: false, password: '' },
      { id: 2, name: '教程', type: 'category', private: false, password: '' },
    ],
    drafts: [],
    meta: { siteInfo: { siteName: 'VanBlog E2E' }, categories: ['随笔', '教程'] },
    user: { name: 'admin' },
  };
}

let store = seedOldMachine();

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
    nav a { margin-right: 12px; }
    .card { border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin: 12px 0; }
    .muted { color: #888; }
    button { margin-right: 8px; }
  </style>
</head>
<body>
  <nav>
    <a href="/">首页</a>
    <a href="/admin/category">分类管理</a>
    <a href="/admin/backup">备份恢复</a>
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

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

  if (req.method === 'POST' && url.pathname === '/e2e/reset') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (body.mode === 'new-machine') {
      store = { articles: [], categories: [], drafts: [], meta: { siteInfo: { siteName: 'VanBlog E2E' }, categories: [] }, user: { name: 'admin' } };
    } else {
      store = seedOldMachine();
    }
    return json(res, 200, { ok: true, store });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/backup/export') {
    return json(res, 200, {
      articles: store.articles,
      categories: store.categories,
      drafts: store.drafts,
      meta: store.meta,
      user: store.user,
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/backup/import') {
    const raw = (await readBody(req)).toString();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      data = JSON.parse(match ? match[0] : '{}');
    }
    const toImport = collectCategoriesFromBackup(data);
    store.articles = data.articles || [];
    store.drafts = data.drafts || [];
    store.categories = [];
    for (const item of toImport) {
      if (store.categories.some((c) => c.name === item.name)) continue;
      store.categories.push({
        id: item.id || store.categories.length + 1,
        name: item.name,
        type: item.type || 'category',
        private: item.private || false,
        password: item.password || '',
      });
    }
    store.meta = {
      ...(data.meta || store.meta),
      categories: store.categories.map((item) => item.name),
    };
    return json(res, 200, { statusCode: 200, data: '导入成功！' });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/category/all') {
    return json(res, 200, { statusCode: 200, data: store.categories });
  }

  if (req.method === 'GET' && url.pathname === '/api/public/article') {
    return json(res, 200, {
      statusCode: 200,
      data: {
        articles: store.articles.filter((article) => !article.hidden),
        total: store.articles.length,
      },
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/public/meta') {
    return json(res, 200, {
      statusCode: 200,
      data: {
        meta: { ...store.meta, categories: store.categories.map((item) => item.name) },
      },
    });
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    const articles = store.articles.filter((article) => !article.hidden);
    const list = articles.length
      ? articles
          .map(
            (article) =>
              `<article class="card" data-article-title="${article.title}">
                <h2>${article.title}</h2>
                <p>分类：<span data-article-category="${article.category}">${article.category}</span></p>
              </article>`,
          )
          .join('')
      : '<p class="muted" data-empty-home>首页暂无文章</p>';
    return html(res, '首页', `<h1>首页</h1><div id="home-articles">${list}</div>`);
  }

  if (url.pathname === '/admin/category') {
    const list = store.categories.length
      ? `<ul id="category-list">${store.categories
          .map((item) => `<li data-category-name="${item.name}">${item.name}</li>`)
          .join('')}</ul>`
      : '<p class="muted" data-empty-category>分类管理为空</p>';
    return html(res, '分类管理', `<h1>分类管理</h1>${list}`);
  }

  if (url.pathname === '/admin/backup') {
    return html(
      res,
      '备份恢复',
      `<h1>备份恢复</h1>
       <button id="export-btn">导出全部数据</button>
       <button id="import-btn">导入全部数据</button>
       <pre id="backup-status"></pre>
       <script>
         let lastBackup = null;
         document.getElementById('export-btn').onclick = async () => {
           lastBackup = await (await fetch('/api/admin/backup/export')).json();
           document.getElementById('backup-status').textContent = 'exported';
         };
         document.getElementById('import-btn').onclick = async () => {
           if (!lastBackup) return;
           await fetch('/api/admin/backup/import', {
             method: 'POST',
             headers: { 'content-type': 'application/json' },
             body: JSON.stringify(lastBackup),
           });
           document.getElementById('backup-status').textContent = 'imported';
         };
       </script>`,
    );
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`backup restore e2e at http://127.0.0.1:${port}`);
});
