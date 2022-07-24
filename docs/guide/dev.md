---
title: 开发指南
index: false
icon: vscode
---

:::info 提示
本项目处于初始阶段（自己都没捋顺），原则上暂不接受 `PR`
:::
本项目使用了 `JavaScript` 和 `TypeScript` 实现。

## 路径结构

```bash
├── default.conf  # 打包用的 nginx 配置
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
 |  └── website # 前台前端代码
├── README.md
└── yarn.lock
```

## 技术栈

只列出大体上框架级别的，一些细节就直接看代码吧。

前台： [next.js](https://nextjs.org/)、[react.js](https://reactjs.org/)、[tailwind-css](https://tailwindcss.com/)

后台： [and design pro](https://pro.ant.design/zh-CN/)、[ant design](https://ant.design/)

后端： [nest.js](https://nestjs.com/)、[mongoDB](https://www.mongodb.com/)

CI： [docker](https://www.docker.com/)、[nginx](https://www.nginx.com/)、[github-actions](https://docs.github.com/cn/actions)

文档： [vue-press](https://vuepress.vuejs.org/)、[vue-press-hope](https://vuepress-theme-hope.github.io/)

## 前台开发

```bash
cd packages/website
yarn
yarn dev
```

端口号为: `3001`

与后台的跨域代理已经做好了，浏览器打开即可。

## 后台开发

```bash
cd packages/admin
yarn
yarn start
```

端口号为: `3002`

与后台的跨域代理已经做好了，浏览器打开即可。

## 后端开发

```bash
cd packages/server
yarn
yarn start:dev
```

端口号为: `3000`

`swagger` 路径为: `/swagger`

## 文档开发

```bash
yarn docs:dev
```

端口号为: `8080`

## 镜像构建

根目录直接打包就行。

```bash
# 这个build server 是第一次打包镜像拿数据的，不写也行，那就得等启动容器后增量渲染生效了。
VAN_BLOG_BUILD_SERVER="https://www.mereith.com"
docker build --build-arg VAN_BLOG_BUILD_SERVER=$VAN_BLOG_BUILD_SERVER -t mereith/van-blog:1.0.0 .
docker push mereith/van-blog:1.0.0
```

## 文档发版

已经有了对应的 `github actions`，向远端推送 `doc*` 的 `tag` 会触发然后发布到项目官方。

```bash
git tag doc-1.0.0
git push --tags
```

## Release

本项目使用 [standard-version](https://github.com/conventional-changelog/standard-version) 管理版本，并有了对应的 `github actions`，向远端推送 `v*` 的 `tag` 会触发`standard-version release` 然后打包发布项目。

```bash
git tag v1.0.0
git push --tags
```
