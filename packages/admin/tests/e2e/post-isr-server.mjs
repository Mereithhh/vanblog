import { createServer } from 'node:http';
import { URL } from 'node:url';

const port = Number(process.env.POST_ISR_E2E_PORT || 4179);

function getArticlePublicPaths(article) {
  const paths = [`/post/${article.id}`];
  const pathname = typeof article.pathname === 'string' ? article.pathname.trim() : '';
  if (pathname && pathname !== String(article.id)) {
    paths.push(`/post/${pathname}`);
  }
  return paths;
}

function seedPublishedPost() {
  return {
    id: 30,
    pathname: 'gitea',
    title: 'Gitea 笔记',
    content: '旧内容：安装步骤',
    category: '教程',
    hidden: false,
  };
}

let article = seedPublishedPost();
const publicCache = new Map();

function renderPublic() {
  return `${article.title}\n${article.content}`;
}

function visitPublic(path) {
  if (!publicCache.has(path)) {
    publicCache.set(path, renderPublic());
  }
  return publicCache.get(path);
}

function revalidate(path) {
  publicCache.set(path, renderPublic());
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
    nav a { margin-right: 12px; }
    textarea { width: 100%; min-height: 160px; }
    button { margin-top: 8px; }
    .card { border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; }
  </style>
</head>
<body>
  <nav>
    <a href="/admin/editor">后台编辑</a>
    <a href="/post/30">数字 ID 页</a>
    <a href="/post/gitea">自定义路径页</a>
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
    article = seedPublishedPost();
    publicCache.clear();
    visitPublic('/post/30');
    visitPublic('/post/gitea');
    return json(res, 200, { ok: true, article, cache: Object.fromEntries(publicCache) });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/article/30') {
    return json(res, 200, { statusCode: 200, data: article });
  }

  if (req.method === 'PUT' && url.pathname === '/api/admin/article/30') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const previousPathname = article.pathname;
    article = { ...article, ...body };
    const paths = getArticlePublicPaths(article);
    if (previousPathname && previousPathname !== article.pathname) {
      paths.push(`/post/${previousPathname}`);
    }
    for (const path of paths) {
      revalidate(path);
    }
    return json(res, 200, { statusCode: 200, data: article, revalidated: paths });
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    return html(
      res,
      'VanBlog ISR E2E',
      `<h1>VanBlog ISR E2E</h1>
       <p>同一篇文章的两个前台地址：</p>
       <ul>
         <li><a href="/post/30">/post/30</a></li>
         <li><a href="/post/gitea">/post/gitea</a></li>
       </ul>`,
    );
  }

  if (url.pathname === '/admin/editor') {
    return html(
      res,
      '后台编辑',
      `<h1>后台编辑</h1>
       <p>文章 ID：<span data-article-id>${article.id}</span>　自定义路径：<span data-article-pathname>${article.pathname}</span></p>
       <form id="editor-form" class="card">
         <label>正文</label>
         <textarea id="content" name="content">${article.content}</textarea>
         <button id="save-btn" type="submit">保存</button>
       </form>
       <pre id="save-status"></pre>
       <script>
         document.getElementById('editor-form').onsubmit = async (event) => {
           event.preventDefault();
           const content = document.getElementById('content').value;
           const res = await fetch('/api/admin/article/30', {
             method: 'PUT',
             headers: { 'content-type': 'application/json' },
             body: JSON.stringify({ content }),
           });
           const data = await res.json();
           document.getElementById('save-status').textContent = data.statusCode === 200 ? 'saved' : 'failed';
         };
       </script>`,
    );
  }

  if (url.pathname.startsWith('/post/')) {
    const body = visitPublic(url.pathname);
    return html(
      res,
      url.pathname,
      `<article class="card" data-public-post data-post-path="${url.pathname}">
         <h1>${article.title}</h1>
         <pre data-post-content>${body}</pre>
       </article>`,
    );
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`post isr e2e at http://127.0.0.1:${port}`);
});
