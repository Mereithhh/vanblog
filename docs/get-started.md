---
icon: creative
title: 快速上手
copyright: false
footer: GPL-2.0 协议 | Copyright © 2022-present Mereith
---

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

## docker-compose 部署 (推荐)

新建 `docker-compose.yml`文件：

```bash
version: "3"

services:
  vanblog:
    image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 图片资源允许的域名，英文逗号分隔
      VAN_BLOG_ALLOW_DOMAINS: "pic.mereith.com"
      # mongodb 的地址
      VAN_BLOG_DATABASE_URL: "mongodb://vanBlog:vanBlog@mongo:27017"
      # jwt 密钥，随机字符串即可
      VAN_BLOG_JWT_SECRET: "AnyString"
  mongo:
    image: mongo
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # mongoDB 初始化用户名
      MONGO_INITDB_ROOT_USERNAME: vanBlog
      # mongoDB 初始化密码
      MONGO_INITDB_ROOT_PASSWORD: vanBlog
    volumes:
      # mongoDB 数据存放地址，按需修改。
      - $(pwd)/data/mongo:/data/db
  # 如果你不需要评论系统或想通过其他方式部署评论系统那就注释掉，https://waline.js.org/
  waline:
    image: lizheming/waline:latest
    restart: always
    ports:
      - 8360:8360
    volumes:
      - /var/docker/waline/data:/app/data
    environment:
      TZ: 'Asia/Shanghai'
      # 博客站点名称
      SITE_NAME: 'Mereith Blog'
      # 博客网址
      SITE_URL: 'https://www.mereith.com'
      # 允许的域名
      SECURE_DOMAINS: 'mereith.com'
      # 作者邮箱
      AUTHOR_EMAIL: 'wanglu@mereith.com'
      MONGO_HOST: "mongo"
      MONGO_DB: "waline"
      MONGO_USER: "vanBlog"
      MONGO_PASSWORD: "vanBlog"
      MONGO_AUTHSOURCE: "admin"

```

按注释说明修改`docker-compose.yml`的配置后：

```bash
docker-compose up -d
```

浏览器打开 `http://<your-ip>/admin/init` ，并按照提示初始化即可。

## docker 部署

如果你已经有了自己的 `mongoDB` 和 `waline` ,也懒得用 `docker-compose` 直接起就行了：

```bash
docker run --name blog \\
--restart always \\
-p 80:80 \\
-e VAN_BLOG_ALLOW_DOMAINS "图片允许的域名" \\
-e VAN_BLOG_DATABASE_URL "mongoDB 的 URL" \\
-e VAN_BLOG_JWT_SECRET "jwt 密钥，随机字符串就可以" \\
mereith/van-blog:latest

```

## 安装 docker (可选)

目前的部署方案基于 `docker` 和 `docker-compose`，没有安装的话可通过以下脚本安装:

```bash
curl -sSL https://get.daocloud.io/docker | sh
```
