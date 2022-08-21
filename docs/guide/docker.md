---
icon: linux
title: 部署
copyright: false
order: -1
---

::: info VanBlog

VanBlog 是一款简洁实用的个人博客系统。支持黑暗模式、支持移动端自适应和评论、内置流量统计与图床，配有完备的、支持黑暗模式、支持移动端、支持一键上传剪切板图片到图床、带有强大的编辑器的后台管理面板。

你也可以先查看 [Demo](https://blog-demo.mereith.com)，账号密码均为 `demo`

目前 VanBlog 还在快速迭代中，如果后台出现升级提示，推荐进行升级。
:::

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

你也可以先查看 [Demo](https://blog-demo.mereith.com)，账号密码均为 `demo`

## docker-compose 部署

如果你没有安装 `docker` 和 `docker-compose`，可以通过以下命令一键安装：

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

如果你没有接触过 `docker`，但是想了解一下，可以看下面的教程：

> [Docker 入门教程](https://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)

新建 `docker-compose.yml`文件：

```yaml
version: "3"

services:
  vanblog:
    # 默认国内源的
    image: registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest
    # 下面的是 dockerhub 的
    # image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 图片资源允许的域名，英文逗号分隔
      VAN_BLOG_ALLOW_DOMAINS: "pic.mereith.com"
      # CDN URL，包含协议，部署到 cdn 的时候用。
      VAN_BLOG_CDN_URL: "https://www.mereith.com"
      # mongodb 的地址
      VAN_BLOG_DATABASE_URL: "mongodb://vanBlog:vanBlog@mongo:27017/vanBlog?authSource=admin"
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
# waline:
#   image: lizheming/waline:latest
#   restart: always
#   ports:
#     - 127.0.0.1:8360:8360
#   volumes:
#     - /var/docker/waline/data:/app/data
#   environment:
#     TZ: 'Asia/Shanghai'
#     SITE_NAME: 'Mereith Blog'
#     SITE_URL: 'https://www.mereith.com'
#     SECURE_DOMAINS: 'mereith.com'
#     AUTHOR_EMAIL: 'wanglu@mereith.com'
#     MONGO_HOST: "mongo"
#     MONGO_DB: "waline"
#     MONGO_USER: "vanBlog"
#     MONGO_PASSWORD: "vanBlog"
#     MONGO_AUTHSOURCE: "admin"
```

按注释说明修改`docker-compose.yml`的配置后：

```bash
docker-compose up -d
```

浏览器打开 `http://<your-ip>/admin/init` ，并按照提示初始化即可。具体设置项可以参考 [站点配置](/feature/basic/setting.md)

::: info VanBlog
首次运行默认是关闭 `https` 的，请通过 `http` 协议访问。初始化后，进入后台确认 https 证书已自动生成后可选择开启 https 自动重定向。

无论 `HTTPS 自动重定向` 是否开启，都暂不支持通过 `https + ip 地址` 来访问。需要 ip 访问请用 `http` 协议并关闭 https 自动重定向。

具体请参考： [HTTPS](/guide/https.md)
:::

## kubernetes

什么？你想用 `kubernetes`，当然没问题。

给你一个 `deployment`的参考：

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  name: van-blog
  labels:
    app: van-blog
spec:
  selector:
    matchLabels:
      app: van-blog
  template:
    spec:
      volumes:
        - name: host-time
          hostPath:
            path: /etc/localtime
            type: ""
      containers:
        - name: van-blog
          image: "mereith/van-blog:latest"
          ports:
            - name: http-80
              containerPort: 80
              protocol: TCP
            - name: https-443
              containerPort: 443
              protocol: TCP
          env:
            - name: VAN_BLOG_DATABASE_URL
              value: >-
                mongodb://some@some@van.example.com:27017/vanBlog?authSource=admin
            - name: VAN_BLOG_ALLOW_DOMAINS
              value: >-
                pic.mereith.com
          resources:
            requests:
              memory: "300Mi"
              cpu: "250m"
          limits:
            memory: "500Mi"
            cpu: "500m"
          volumeMounts:
            - name: host-time
              readOnly: true
              mountPath: /etc/localtime
          imagePullPolicy: Always
```
