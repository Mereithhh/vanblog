## 博客后端

采用 `nestjs` 框架构建。

```bash
cd packages/server
yarn
yarn start:dev
```

端口号为: `3000`（默认监听所有网卡）。本机反代时可设环境变量 `VAN_BLOG_LISTEN_HOST=127.0.0.1`，或在 `config.yaml` 写 `listen.host: 127.0.0.1`。

`swagger` 路径为: `/swagger`

默认的数据库是本地的 `mongo`，如果你需要修改，可以在本目录（`packages/server`）下新建`config.yaml`：

```
database:
  url: mongodb://somemongo:27017/vanBlog?authSource=admin
# 配置静态图床的文件夹
static:
  path: /code/github/van-blog/staticFolder
# 本机反代时只监听回环地址（可选，默认所有网卡）
# listen:
#   host: 127.0.0.1

```
