const MERMAID_ARTICLE_CONTENT = `# Markdown 语法测试

VanBlog 文章测试

\`\`\`mermaid
graph LR
  A[设备]-->B["Dnsmasq(:53)"]
  subgraph 软路由
      B-->|重定向| C["ADG Home(:3053)"]
  end
  C-->|转发| D["上游公共DNS服务器"]
\`\`\`

\`\`\`mermaid
graph TD
Start --> Stop
\`\`\`

\`\`\`mermaid
sequenceDiagram
Alice->>John: Hello John, how are you?
John-->>Alice: Great!
Alice-)John: See you later!
\`\`\`

\`\`\`mermaid
classDiagram
Animal <|-- Duck
Animal <|-- Fish
Animal : +int age
\`\`\`

\`\`\`mermaid
stateDiagram-v2
[*] --> Still
Still --> Moving
Moving --> [*]
\`\`\`

\`\`\`mermaid
erDiagram
CUSTOMER ||--o{ ORDER : places
\`\`\`

\`\`\`mermaid
pie title Pets adopted by volunteers
"Dogs" : 386
"Cats" : 85
"Rats" : 15
\`\`\`
`;

const META = {
  statusCode: 200,
  data: {
    version: 'dev',
    latestVersion: 'dev',
    updatedAt: new Date().toISOString(),
    user: { id: 0, name: 'admin' },
    baseUrl: 'http://127.0.0.1:3002',
    enableComment: 'true',
    allowDomains: '',
  },
};

const ARTICLE_68 = {
  statusCode: 200,
  data: {
    id: 68,
    title: 'Markdown 语法测试',
    content: MERMAID_ARTICLE_CONTENT,
    category: '测试',
    tags: ['Markdown'],
    hidden: false,
    updatedAt: '2022-08-30T00:00:00.000Z',
    createdAt: '2022-08-30T00:00:00.000Z',
  },
};

const ARTICLE_108 = {
  statusCode: 200,
  data: {
    id: 108,
    title: '方向键光标测试标题',
    content: 'arrow key cursor e2e\n',
    category: '测试',
    tags: ['E2E'],
    hidden: false,
    pathname: 'arrow-key-cursor',
    updatedAt: '2024-11-14T00:00:00.000Z',
    createdAt: '2024-11-14T00:00:00.000Z',
  },
};

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockAdminApis(page) {
  await page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/admin/meta' && method === 'GET') {
      return json(route, META);
    }
    if (path === '/api/admin/article/68' && method === 'GET') {
      return json(route, ARTICLE_68);
    }
    if (path === '/api/admin/article/68' && method === 'PUT') {
      return json(route, { statusCode: 200, data: ARTICLE_68.data });
    }
    if (path === '/api/admin/article/108' && method === 'GET') {
      return json(route, ARTICLE_108);
    }
    if (path === '/api/admin/article/108' && method === 'PUT') {
      return json(route, { statusCode: 200, data: ARTICLE_108.data });
    }
    if (path === '/api/admin/tag/all' && method === 'GET') {
      return json(route, { statusCode: 200, data: ['E2E', 'Markdown'] });
    }
    if (path.startsWith('/api/admin/category/all') && method === 'GET') {
      return json(route, { statusCode: 200, data: ['测试'] });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }

    return json(route, { statusCode: 200, data: {} });
  });
}

async function loginAsAdmin(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'e2e-admin-token');
    window.localStorage.setItem('editorConfig', JSON.stringify({ afterSave: 'stay', useLocalCache: 'close' }));
    window.localStorage.setItem('theme', 'light');
  });
}

module.exports = {
  MERMAID_ARTICLE_CONTENT,
  mockAdminApis,
  loginAsAdmin,
};
