import { createServer } from 'node:http';
import { URL } from 'node:url';

const port = Number(process.env.COMMENT_LOGIN_E2E_PORT || 4181);

function isForceLoginCommentEnabled(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function authorizeCommentPost({ forceLoginComment, userInfo }) {
  if (userInfo && userInfo.objectId) {
    return { ok: true };
  }
  if (isForceLoginCommentEnabled(forceLoginComment)) {
    return { ok: false, status: 401 };
  }
  return { ok: true };
}

function seedState() {
  return {
    waline: { forceLoginComment: false, 'smtp.enabled': false },
    users: {
      'alice@example.com': { objectId: 'user-1', password: 'password', nick: 'alice' },
    },
    comments: [],
    sessions: {},
  };
}

let state = seedState();

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
    label { display: block; margin-top: 8px; }
    input, textarea { width: 320px; }
    textarea { min-height: 80px; }
    button { margin-top: 12px; }
    .card { border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; max-width: 480px; }
    .error { color: #cf1322; }
    .ok { color: #389e0d; }
  </style>
</head>
<body>
  <nav>
    <a href="/admin/setting">评论设置</a>
    <a href="/post/1">文章评论</a>
    <a href="/login">评论登录</a>
  </nav>
  ${body}
</body>
</html>`);
}

function parseCookie(header) {
  const raw = header || '';
  const token = raw
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('waline_token='));
  return token ? decodeURIComponent(token.slice('waline_token='.length)) : '';
}

function currentUser(req) {
  const auth = req.headers.authorization;
  const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const token = bearer || parseCookie(req.headers.cookie);
  if (token && state.sessions[token]) {
    return state.sessions[token];
  }
  return null;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return Object.fromEntries(new URLSearchParams(raw));
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

  if (req.method === 'POST' && url.pathname === '/e2e/reset') {
    const body = await readBody(req);
    state = seedState();
    if (body.forceLoginComment != null) {
      state.waline.forceLoginComment = isForceLoginCommentEnabled(body.forceLoginComment);
    }
    return json(res, 200, { ok: true, waline: state.waline });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/setting/waline') {
    return json(res, 200, { statusCode: 200, data: state.waline });
  }

  if (req.method === 'PUT' && url.pathname === '/api/admin/setting/waline') {
    const body = await readBody(req);
    state.waline = {
      ...state.waline,
      ...body,
      forceLoginComment: isForceLoginCommentEnabled(body.forceLoginComment),
    };
    return json(res, 200, { statusCode: 200, data: state.waline });
  }

  if (req.method === 'GET' && url.pathname === '/api/public/comment-setting') {
    return json(res, 200, {
      statusCode: 200,
      data: { forceLoginComment: isForceLoginCommentEnabled(state.waline.forceLoginComment) },
    });
  }

  if (req.method === 'POST' && (url.pathname === '/comment' || url.pathname === '/api/comment')) {
    const body = await readBody(req);
    const auth = authorizeCommentPost({
      forceLoginComment: state.waline.forceLoginComment,
      userInfo: currentUser(req),
    });
    if (!auth.ok) {
      return json(res, 401, { errno: 401, errmsg: '请先登录后再评论' });
    }
    const comment = {
      id: `c-${state.comments.length + 1}`,
      nick: currentUser(req)?.nick || body.nick || 'anon',
      comment: body.comment,
    };
    state.comments.push(comment);
    return json(res, 200, { errno: 0, data: comment });
  }

  if (req.method === 'POST' && url.pathname === '/token') {
    const body = await readBody(req);
    const user = state.users[body.email];
    if (!user || user.password !== body.password) {
      return json(res, 401, { errno: 1001, errmsg: '登录失败' });
    }
    const token = `tok-${user.objectId}`;
    state.sessions[token] = user;
    res.setHeader('Set-Cookie', `waline_token=${token}; Path=/`);
    return json(res, 200, { errno: 0, data: { token, ...user } });
  }

  if (req.method === 'GET' && url.pathname === '/admin/setting') {
    const enabled = isForceLoginCommentEnabled(state.waline.forceLoginComment);
    return html(
      res,
      '评论设置',
      `<div class="card">
        <h1>评论设置</h1>
        <form id="waline-form">
          <label>是否强制登录后评论
            <select id="forceLoginComment" name="forceLoginComment">
              <option value="true" ${enabled ? 'selected' : ''}>开启</option>
              <option value="false" ${enabled ? '' : 'selected'}>关闭</option>
            </select>
          </label>
          <button type="submit">保存</button>
        </form>
        <p id="save-status"></p>
      </div>
      <script>
        document.getElementById('waline-form').addEventListener('submit', async (event) => {
          event.preventDefault();
          const forceLoginComment = document.getElementById('forceLoginComment').value;
          const res = await fetch('/api/admin/setting/waline', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ forceLoginComment }),
          });
          const json = await res.json();
          document.getElementById('save-status').textContent = json.statusCode === 200 ? '更新成功！' : '保存失败';
        });
      </script>`,
    );
  }

  if (req.method === 'GET' && url.pathname === '/login') {
    return html(
      res,
      '评论登录',
      `<div class="card">
        <h1>登录后评论</h1>
        <form id="login-form">
          <label>邮箱 <input id="email" name="email" value="alice@example.com" /></label>
          <label>密码 <input id="password" name="password" type="password" value="password" /></label>
          <button type="submit">登录</button>
        </form>
        <p id="login-status"></p>
      </div>
      <script>
        document.getElementById('login-form').addEventListener('submit', async (event) => {
          event.preventDefault();
          const res = await fetch('/token', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              email: document.getElementById('email').value,
              password: document.getElementById('password').value,
            }),
          });
          const json = await res.json();
          document.getElementById('login-status').textContent = json.errno === 0 ? '登录成功' : (json.errmsg || '登录失败');
        });
      </script>`,
    );
  }

  if (req.method === 'GET' && url.pathname === '/post/1') {
    return html(
      res,
      '文章评论',
      `<div class="card">
        <h1>文章评论</h1>
        <form id="comment-form">
          <label>昵称 <input id="nick" name="nick" value="anon" /></label>
          <label>邮箱 <input id="mail" name="mail" value="anon@example.com" /></label>
          <label>评论 <textarea id="comment" name="comment">匿名回复</textarea></label>
          <button type="submit">发表评论</button>
        </form>
        <p id="comment-status"></p>
        <ul id="comment-list"></ul>
      </div>
      <script>
        document.getElementById('comment-form').addEventListener('submit', async (event) => {
          event.preventDefault();
          const res = await fetch('/comment', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              nick: document.getElementById('nick').value,
              mail: document.getElementById('mail').value,
              comment: document.getElementById('comment').value,
              url: '/post/1',
            }),
          });
          const json = await res.json();
          const status = document.getElementById('comment-status');
          if (!res.ok || json.errno) {
            status.className = 'error';
            status.textContent = json.errmsg || '请先登录后再评论';
            return;
          }
          status.className = 'ok';
          status.textContent = '评论成功';
          const item = document.createElement('li');
          item.textContent = json.data.nick + ': ' + json.data.comment;
          document.getElementById('comment-list').appendChild(item);
        });
      </script>`,
    );
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`comment-login e2e listening on ${port}`);
});
