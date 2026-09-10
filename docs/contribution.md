---
title: 开发指南
icon: signs-post
order: 7
---

::: info 提示

欢迎提交 issue 和 PR。日常可复现的代码问题由 AI 全自动排查、补测试并开 PR；合并进 master 以及打发版 tag 仍由作者完成。

:::

本项目使用了 `JavaScript` 和 `TypeScript` 实现。

如果你想参与 VanBlog 开发，可以进群哦：

- [VanBlog 开发群](https://jq.qq.com/?_wv=1027&k=mf2CguM8)

## 准备知识

### 整体架构

Vanblog 分为以下几个部分，构建后将整合到一个 `docker` 容器内：

> website: Vanblog 默认的主题，使用了 `nextjs` 框架，有运行时。
>
> server: Vanblog 的后端服务，有运行时。
>
> waline: Vanblog 内嵌的评论服务，有运行时。
>
> admin: Vanblog 后台面板，打包后为静态页面，无运行时。
>
> caddy: 作为对外的网关，按照规则反代上述几个服务，并提供全自动的 https。

### 进程依赖和启动关系

打包后，启动关系如图：

![架构图](./assets/vanblog.svg)

### 路径结构

本项目采用了 `pnpm` 作为包管理器，项目使用 `monorepo(pnpm workspace)` 组织和管理。

精简版目录结构：

```bash
├── docker-compose  # docker-compose 编排
├── Dockerfile  # Dockerfile
├── docs # 项目文档的代码
├── entrypoint.sh # 容器入口文件
├── LICENSE # 开源协议
├── package.json
├── packages # 代码主体
|  ├── admin # 后台前端代码
|  ├── server # 后端代码
|  ├── waline # 内嵌 waline 评论系统
|  └── website # 前台前端代码
├── README.md
└── pnpm-workspace.yaml # pnpm workspace 文件
```

### 技术栈

只列出大体上框架级别的，一些细节就直接看代码吧。

- 前台： [next.js](https://nextjs.org/)、[react.js](https://reactjs.org/)、[tailwind-css](https://tailwindcss.com/)
- 后台： [ant design pro](https://pro.ant.design/zh-CN/)、[ant design](https://ant.design/)
- 后端： [nest.js](https://nestjs.com/)、[mongoDB](https://www.mongodb.com/)
- CI： [docker](https://www.docker.com/)、[nginx](https://www.nginx.com/)、[github-actions](https://docs.github.com/cn/actions)
- 文档： [vuepress](https://vuejs.press/zh/)、[vuepress-theme-hope](https://theme-hope.vuejs.press/zh/)

## 本地开发

### 环境准备

#### 准备数据库

开发之前，要有一个 `mongodb` 数据库。推荐用 `docker` 起一个：

```bash
docker run --name mongodb-vanblog -d --restart unless-stopped \
  -p 27017:27017 mongo
```

#### node 要求

- nodejs 18
- pnpm v7+

#### 克隆项目并安装依赖

```bash
git clone https://github.com/Mereithhh/vanblog.git
cd vanblog
pnpm i
```

### 添加 server 配置文件

在 `packages/server` 下，创建 `config.yaml` 文件，内容如下：

```yaml
database:
  # 数据库连接
  url: mongodb://localhost:27017/vanBlog?authSource=admin
static:
  # 图床等静态文件保存的位置
  path: /var/vanblog-dev/static
# 是否开启演示站模式，会限制很多权限
demo: 'false'
# waline 用的表名，会自动创建
waline:
  db: waline
# 日志位置
log: /var/vanblog-dev/logs
```

### 开发相关命令

#### 开发全部

在根目录下：

```bash
# 开发全部（前台、后台、server）
pnpm dev
# 前台为 3001 端口
# server 为 3000 端口
# 后台为 3002 端口
```

::: info VanBlog开发后台如果用到复制到剪切板相关的功能，可能需要开启 `https`，请在 `packages/admin/config/config.js` 中的 `https` 改成 `true`，再重启开发进程。

```js
 devServer: { https: true, port: 3002 },
```

:::

#### 单独开发前后台（前端）

必须要先启动 server：

```bash
# 端口 3000
pnpm dev:server
```

然后在启动前台后者后台

```bash
# 启动前台 端口 3001
pnpm dev:website
# 启动后台 端口 3002
pnpm dev:admin
```

### 文档开发

根目录下：

```bash
pnpm docs:dev
```

端口号为: `8080`

## 镜像构建

直接在根目录用 `Dockerfile` 打包就行，具体看下面第二点。

### act（作者自用）

我一般会用 [act](https://github.com/nektos/act) 来做验证镜像，act 可以在本地运行 `Github Actions`。

这个方法需要 `.env` 文件存放密钥，目前仅自用。

```bash
pnpm build:test
```

### 手动打包

根目录 `Dockerfile` 的前台阶段是 `node:18-alpine`。构建时会安装 `vips-dev` / `libc6-compat` / `fftw-dev`，并设置 `SHARP_IGNORE_GLOBAL_LIBVIPS=1`，让 `sharp@0.32.6` 使用官方 musl prebuild（避免 Alpine musl 版本号 `1.2.4_git*` 导致安装失败）。corepack 使用仓库的 `pnpm@8.11.0`，不要改成 `pnpm@latest`。请继续用仓库自带的 `pnpm-lock.yaml` 和 `--frozen-lockfile`，不要把前台构建改回未处理 sharp 的旧 `node:18` 阶段。

图床 AVIF 压缩（后台「压缩格式」）优先 `require('sharp')`，并会尝试官方镜像里前台 standalone 的 `/app/website/node_modules/sharp`。服务端构建阶段仍是 `node:18`（Debian），拷到 Alpine 后这份 glibc sharp 可能不可用，因此 RUNNER 额外安装 `libavif-apps`（`avifenc`）作为回退。不要为了 AVIF 把整个服务端构建改成 Alpine，也不要去掉 `libwebp-tools`（WebP 仍走 `cwebp`）。

```bash
# 这个build server 是第一次打包镜像拿数据的，不写也行，那就得等启动容器后增量渲染生效了。
VAN_BLOG_BUILD_SERVER="https://some.vanblog-server.com"
docker build --build-arg VAN_BLOG_BUILD_SERVER=$VAN_BLOG_BUILD_SERVER -t mereith/van-blog:test .
```

## 文档发版

官网由作者向远端推送 `doc*` tag 触发 GitHub Actions 发布。请不要自行推送 `doc*` tag。

作者发版后可用下面的脚本拷贝 changelog 并发布文档：

```bash
# 仅作者使用
pnpm release-doc
```

## Release

本项目使用 [standard-version](https://github.com/conventional-changelog/standard-version) 管理版本。`pnpm release` 会打 `v*` tag 并触发产品发版流水线，仅作者使用。请不要自行执行 `pnpm release` 或推送 `v*` / `doc*` / `test*` tag。

```bash
# 仅作者使用
pnpm release
pnpm release-doc
```
