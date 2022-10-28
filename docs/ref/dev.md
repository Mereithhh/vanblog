---
title: 开发指南
icon: vscode
---

:::info 提示
本项目处于初始阶段，如有 bug 请多担待。
:::
本项目使用了 `JavaScript` 和 `TypeScript` 实现。

如果你想参与 `VanBlog` 开发，可以进群哦：

- [VanBlog  开发群](https://jq.qq.com/?_wv=1027&k=mf2CguM8)

## 路径结构

```bash
├── docker-compose  # docker-compose 编排
├── Dockerfile  # Dockerfile
├── docs # 项目文档的代码
├── entrypoint.sh # 容器入口文件
├── lerna.json # lerna 配置
├── LICENSE # 开源协议
├── package.json
├── packages # 代码主体
 |  ├── admin # 后台前端代码
 |  ├── server # 后端代码
 |  ├── waline # 内嵌 waline 评论系统
 |  └── website # 前台前端代码
├── README.md
└── yarn.lock
```

## 技术栈

只列出大体上框架级别的，一些细节就直接看代码吧。

前台： [next.js](https://nextjs.org/)、[react.js](https://reactjs.org/)、[tailwind-css](https://tailwindcss.com/)

后台： [ant design pro](https://pro.ant.design/zh-CN/)、[ant design](https://ant.design/)

后端： [nest.js](https://nestjs.com/)、[mongoDB](https://www.mongodb.com/)

CI： [docker](https://www.docker.com/)、[nginx](https://www.nginx.com/)、[github-actions](https://docs.github.com/cn/actions)

文档： [vue-press](https://vuepress.vuejs.org/)、[vue-press-hope](https://vuepress-theme-hope.github.io/)

## 前台开发

现在前台的启动改为嵌入到后端的 `child_process` 中了，所以默认无需单独启动前台！启动后端就会启动前台 `next.js 的 dev 模式`。

<!-- 采用了 `nextjs`

```bash
cd packages/website
yarn
yarn dev
```

端口号为: `3001`

与后台的跨域代理已经做好了，浏览器打开即可。 -->

## 后台开发

采用 `ant deign pro`

```bash
cd packages/admin
yarn
yarn start
```

端口号为: `3002`，浏览器打开即可。

与后台的跨域代理已经做好了，浏览器打开即可。

## 后端开发

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
waline:
  db: walineDev

```

## 文档开发

```bash
yarn docs:dev
```

端口号为: `8080`

## 镜像构建

根目录直接打包就行。

### act

我一般会用 [act](https://github.com/nektos/act) 来做验证镜像，act 可以在本地运行 `Github Actions`。

安装 `act` 后：

```bash
yarn build:test
```

### 手动打包

```bash
# 这个build server 是第一次打包镜像拿数据的，不写也行，那就得等启动容器后增量渲染生效了。
VAN_BLOG_BUILD_SERVER="https://some.vanblog-server.com"
docker build --build-arg VAN_BLOG_BUILD_SERVER=$VAN_BLOG_BUILD_SERVER -t mereith/van-blog:test .
```

## 文档发版

已经有了对应的 `github actions`，向远端推送 `doc*` 的 `tag` 会触发然后发布到项目官方。

另外有一键脚本可以在发版之后自动拷贝 changelog 并发布：

```
yarn release-doc
```

## Release

本项目使用 [standard-version](https://github.com/conventional-changelog/standard-version) 管理版本，并有了对应的 `github actions`，执行下列命令会发布版本并触发流水线打包发版。

```bash
yarn release
git push --follow-tags origin master
```
