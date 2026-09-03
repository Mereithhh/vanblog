import { createServer } from 'node:http';
import { URL } from 'node:url';

const port = Number(process.env.CATEGORY_RENAME_E2E_PORT || 4182);

function seed() {
  return {
    categories: [],
    articles: [],
    drafts: [],
    nextCategoryId: 1,
    nextArticleId: 1,
    nextDraftId: 1,
  };
}

let store = seed();

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
    label { display: block; margin: 8px 0; }
    button { margin-right: 8px; }
  </style>
</head>
<body>
  <nav>
    <a href="/">首页</a>
    <a href="/admin/category">分类管理</a>
    <a href="/admin/article">文章管理</a>
    <a href="/admin/draft">草稿管理</a>
  </nav>
  ${body}
</body>
</html>`);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  return raw ? JSON.parse(raw) : {};
}

function renameCategory(oldName, newName) {
  if (!oldName || !newName || oldName === newName) {
    return { ok: true };
  }
  if (store.categories.some((item) => item.name === newName)) {
    return { ok: false, status: 406, message: '分类名重复，无法修改！' };
  }
  const target = store.categories.find((item) => item.name === oldName);
  if (!target) {
    return { ok: false, status: 404, message: '分类不存在' };
  }
  // Same contract as CategoryProvider.updateCategoryByName: rewrite every
  // article/draft that stored the old name string.
  for (const article of store.articles) {
    if (article.category === oldName) article.category = newName;
  }
  for (const draft of store.drafts) {
    if (draft.category === oldName) draft.category = newName;
  }
  target.name = newName;
  return { ok: true };
}

function listItems(items, emptyAttr, itemAttr) {
  if (!items.length) {
    return `<p class="muted" data-empty-${emptyAttr}>暂无数据</p>`;
  }
  return items
    .map(
      (item) =>
        `<article class="card" data-${itemAttr}-title="${item.title}">
          <h2>${item.title}</h2>
          <p>分类：<span data-${itemAttr}-category="${item.category}">${item.category}</span></p>
        </article>`,
    )
    .join('');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

  if (req.method === 'POST' && url.pathname === '/e2e/reset') {
    store = seed();
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/category/') {
    const body = await readBody(req);
    const name = (body.name || '').trim();
    if (!name) {
      return json(res, 406, { statusCode: 406, message: '分类名不能为空' });
    }
    if (store.categories.some((item) => item.name === name)) {
      return json(res, 406, { statusCode: 406, message: '分类名重复，无法创建！' });
    }
    store.categories.push({
      id: store.nextCategoryId++,
      name,
      type: 'category',
      private: false,
      password: '',
    });
    return json(res, 200, { statusCode: 200, data: true });
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/admin/category/')) {
    const oldName = decodeURIComponent(url.pathname.slice('/api/admin/category/'.length));
    const body = await readBody(req);
    const result = renameCategory(oldName, body.name);
    if (!result.ok) {
      return json(res, result.status, { statusCode: result.status, message: result.message });
    }
    return json(res, 200, { statusCode: 200, data: true });
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/admin/category/')) {
    const name = decodeURIComponent(url.pathname.slice('/api/admin/category/'.length));
    if (store.articles.some((item) => item.category === name && !item.deleted)) {
      return json(res, 406, { statusCode: 406, message: '分类已有文章，无法删除！' });
    }
    store.categories = store.categories.filter((item) => item.name !== name);
    return json(res, 200, { statusCode: 200, data: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/category/all') {
    return json(res, 200, { statusCode: 200, data: store.categories });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/article') {
    const body = await readBody(req);
    const article = {
      id: store.nextArticleId++,
      title: body.title,
      category: body.category,
      hidden: false,
      deleted: false,
    };
    store.articles.push(article);
    return json(res, 200, { statusCode: 200, data: article });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/article') {
    return json(res, 200, {
      statusCode: 200,
      data: { articles: store.articles.filter((item) => !item.deleted), total: store.articles.length },
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/draft') {
    const body = await readBody(req);
    const draft = {
      id: store.nextDraftId++,
      title: body.title,
      category: body.category,
      deleted: false,
    };
    store.drafts.push(draft);
    return json(res, 200, { statusCode: 200, data: draft });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/draft') {
    return json(res, 200, {
      statusCode: 200,
      data: { drafts: store.drafts.filter((item) => !item.deleted), total: store.drafts.length },
    });
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    return html(res, '首页', `<h1>首页</h1>${listItems(store.articles.filter((item) => !item.hidden), 'home', 'article')}`);
  }

  if (url.pathname === '/admin/article') {
    return html(res, '文章管理', `<h1>文章管理</h1>${listItems(store.articles.filter((item) => !item.deleted), 'article', 'article')}`);
  }

  if (url.pathname === '/admin/draft') {
    return html(res, '草稿管理', `<h1>草稿管理</h1>${listItems(store.drafts.filter((item) => !item.deleted), 'draft', 'draft')}`);
  }

  if (url.pathname === '/admin/category') {
    const list = store.categories.length
      ? `<ul id="category-list">${store.categories
          .map((item) => `<li data-category-name="${item.name}">${item.name}</li>`)
          .join('')}</ul>`
      : '<p class="muted" data-empty-category>分类管理为空</p>';
    return html(
      res,
      '分类管理',
      `<h1>分类管理</h1>
       ${list}
       <form id="create-form">
         <label>新分类 <input id="new-category-name" name="name" /></label>
         <button id="create-category-btn" type="submit">新建分类</button>
       </form>
       <form id="rename-form">
         <label>原名称 <input id="old-category-name" name="oldName" /></label>
         <label>新名称 <input id="rename-category-name" name="name" /></label>
         <button id="rename-category-btn" type="submit">修改分类</button>
       </form>
       <p id="category-status"></p>
       <script>
         document.getElementById('create-form').onsubmit = async (event) => {
           event.preventDefault();
           const name = document.getElementById('new-category-name').value;
           const res = await fetch('/api/admin/category/', {
             method: 'POST',
             headers: { 'content-type': 'application/json' },
             body: JSON.stringify({ name }),
           });
           document.getElementById('category-status').textContent = res.ok ? 'created' : 'create-failed';
           if (res.ok) location.reload();
         };
         document.getElementById('rename-form').onsubmit = async (event) => {
           event.preventDefault();
           const oldName = document.getElementById('old-category-name').value;
           const name = document.getElementById('rename-category-name').value;
           const res = await fetch('/api/admin/category/' + encodeURIComponent(oldName), {
             method: 'PUT',
             headers: { 'content-type': 'application/json' },
             body: JSON.stringify({ name }),
           });
           document.getElementById('category-status').textContent = res.ok ? 'renamed' : 'rename-failed';
           if (res.ok) location.reload();
         };
       </script>`,
    );
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`category rename e2e at http://127.0.0.1:${port}`);
});
