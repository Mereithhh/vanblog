## 博客后端

采用 `nestjs` 框架构建。

```bash
cd packages/server
yarn
yarn start:dev
```

端口号为: `3000`

`swagger` 路径为: `/swagger`

默认的数据库是本地的 `mongo`，如果你需要修改，可以在本目录（`packages/server`）下新建`config.yaml`：

```
database:
  url: mongodb://somemongo:27017/vanBlog?authSource=admin
# 配置静态图床的文件夹
static:
  path: /code/github/van-blog/staticFolder

```
