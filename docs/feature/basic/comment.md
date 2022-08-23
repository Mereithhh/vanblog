---
title: 评论
---

`vanBlog` 支持对接 [waline 评论系统](https://waline.js.org/)

如果想启用评论功能,部署 `waline` 后，在后台 `站点管理/系统设置/站点配置` 中填写部署好的 `WaLine 服务端 Url` 即可启用。

为空或者不填写的话，就没得评论了。

## 部署 waline

在 [快速开始](/guide/docker.md) 章节，取消注释掉下面的 `waline` 即可。

或者你用下面的也行：

```yaml
version: "3"

services:
  vanblog:
    # 默认国内原的
    image: registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest
    # image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 图片资源允许的域名，英文逗号分隔
      VAN_BLOG_ALLOW_DOMAINS: "pic.mereith.com"
      # CDN URL，包含协议，部署到 cdn 的时候用。
      VAN_BLOG_CDN_URL: "https://www.mereith.com"
      # mongodb 的地址
      VAN_BLOG_DATABASE_URL: "mongodb://vanBlog:vanBlog@mongo:27017"
      # jwt 密钥，随机字符串即可
      VAN_BLOG_JWT_SECRET: "AnyString"
      # 邮箱地址，用于自动申请 https 证书
      EMAIL: "someone@mereith.com"
    volumes:
      # 图床文件的存放地址，按需修改。
      - ${PWD}/data/static:/app/static
      # 日志文件
      - ${PWD}/log:/var/log
      # caddy 配置存储
      - ${PWD}/caddy/config:/root/.config/caddy
      # caddy 证书存储
      - ${PWD}/caddy/data:/root/.local/share/caddy
    ports:
      - 80:80
      - 443:443
  mongo:
    image: registry.cn-beijing.aliyuncs.com/mereith/van-blog:mongo
    # image: mongo
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # mongoDB 初始化用户名
      MONGO_INITDB_ROOT_USERNAME: vanBlog
      # mongoDB 初始化密码
      MONGO_INITDB_ROOT_PASSWORD: vanBlog
    volumes:
      # mongoDB 数据存放地址，按需修改。
      - ${PWD}/data/mongo:/data/db

# 如果你需要评论系统就加上
# 具体请看参数请看 waline 文档：
# https://waline.js.org/
waline:
  image: lizheming/waline:latest
  restart: always
  ports:
    - 8360:8360
  volumes:
    - /var/docker/waline/data:/app/data
  environment:
    TZ: "Asia/Shanghai"
    SITE_NAME: "Mereith Blog"
    SITE_URL: "https://www.mereith.com"
    SECURE_DOMAINS: "mereith.com"
    AUTHOR_EMAIL: "wanglu@mereith.com"
    MONGO_HOST: "mongo"
    MONGO_DB: "waline"
    MONGO_USER: "vanBlog"
    MONGO_PASSWORD: "vanBlog"
    MONGO_AUTHSOURCE: "admin"
```

## 注意事项

如果你不想用端口号访问 `waline` ，反代的时候需要把 `waline` 也分配一个域名，比如我把 `8360` 端口反代到 `https://waline.mereith.com` ，那么我在后台的设置中写的 `WalineServerUrl` 也应该写 `https://waline.mereith.com`。

如果你没有特意反代 `waline` ,那就写和`主机 ip + 端口号(8360)`也行。
