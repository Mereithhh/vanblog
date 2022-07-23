---
icon: creative
title: 快速上手
copyright: false
footer: GPL-2.0 协议 | Copyright © 2022-present Mereith
---

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

## docker-compose 部署

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

## 反向代理与 HTTPS

:::info 注意
使用反向代理之前记得要修改默认的 80 端口号哦
:::

### nginx-proxy-manager

强烈推荐 [nginx-proxy-manager](https://nginxproxymanager.com/)这个项目！它可以帮你自动管理反代配置，并申请相应的 `https` 证书。

### caddy

第二推荐的是 [caddy](https://caddyserver.com/)，一个现代的高性能 web 服务器，它也可以自动帮你配置好 `https`

配置文件参考：

```yaml

```

### nginx

如果你还是想想用 nginx 的话，那好吧。
http 版本的：

```nginx

```

https 版本的：

```nginx

```
