# 博客前台

采用了 `nextjs`

```bash
cd packages/website
yarn
yarn dev
```

端口号为: `3001`

与后台的跨域代理已经做好了，浏览器打开即可。

## 环境变量

- `VAN_BLOG_SERVER_URL`: 后端服务器地址，用于服务端渲染时连接后端
- `NEXT_PUBLIC_VANBLOG_SERVER_URL`: 前端/浏览器访问后端的地址，如果不设置则使用 `VAN_BLOG_SERVER_URL`

当部署在不同环境中时，可能需要设置这两个变量为不同的值，例如:
- 服务端可能使用内部网络地址访问后端: `VAN_BLOG_SERVER_URL=http://internal-api:3000`
- 浏览器需要使用可公开访问的地址: `NEXT_PUBLIC_VANBLOG_SERVER_URL=https://api.example.com`

### 关于 Next.js 中的环境变量

在 Next.js 应用中，只有以 `NEXT_PUBLIC_` 开头的环境变量才能在浏览器中访问。其他环境变量只能在服务器端代码中使用。

因此，对于需要在浏览器中使用的 API 地址，我们使用 `NEXT_PUBLIC_VANBLOG_SERVER_URL`。

#### 开发环境设置

在开发环境中设置环境变量:

```bash
# 在启动开发服务器之前设置
export VAN_BLOG_SERVER_URL=http://localhost:3000
export NEXT_PUBLIC_VANBLOG_SERVER_URL=http://localhost:3000
yarn dev
```

或者在项目根目录创建 `.env.local` 文件:

```
VAN_BLOG_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_VANBLOG_SERVER_URL=http://localhost:3000
```

#### 生产环境设置

在生产环境中，可以在部署时设置这些环境变量:

```
docker run -e VAN_BLOG_SERVER_URL=http://internal-api:3000 -e NEXT_PUBLIC_VANBLOG_SERVER_URL=https://api.example.com ...
```

#### 添加新的环境变量

如果需要添加新的环境变量:

1. 对于只在服务器使用的变量，直接使用普通名称 (如 `MY_SERVER_ONLY_VAR`)
2. 对于需要在浏览器中使用的变量，必须使用 `NEXT_PUBLIC_` 前缀 (如 `NEXT_PUBLIC_MY_CLIENT_VAR`)

详见 [Next.js 文档 - 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
