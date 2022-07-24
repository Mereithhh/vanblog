---
icon: creative
title: 快速上手
copyright: false
---

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

## docker-compose 部署

新建 `docker-compose.yml`文件：

```bash
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
      - ${PWD}/data/mongo:/data/db
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

```
example.com {
  tls admin@example.com
  proxy / <IP:端口号> {
    transparent
  }
}
```

### nginx

如果你还是想想用 nginx 的话，那好吧。
http 版本的：

```nginx
server {
  gzip on;
  gzip_min_length 1k;
  gzip_comp_level 9;
  gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
  gzip_vary on;
  gzip_disable "MSIE [1-6]\.";
  listen 80 ;
  # 改为你的网址
  server_name example.com;
  proxy_buffers 8 32k;
  proxy_buffer_size 64k;
  location / {
    # 改为容器的 PORT
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
  }
}
```

https 版本的：

```nginx

server {
  listen 80;
  # 改为你的网址
  server_name example.com;
  # 重定向为 https
  return 301 https://$host$request_uri;

}
server {
  listen 443 ssl http2;
  # 改为你的网址
  server_name example.com;
  # 证书的公私钥
  ssl_certificate /path/to/public.crt;
  ssl_certificate_key /path/to/private.key;

  location / {
    # 改为容器的 PORT
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
  }

}
```

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

## 图床

目前还没有实现内置的图床，但是我强烈推荐 [兰空图床](https://github.com/lsky-org/lsky-pro) 这个项目！
用起来非常丝滑。
如果觉得麻烦，还可以对接上 [picGo](https://github.com/Molunerfinn/PicGo)，快捷键截图。

还嫌麻烦的话，那等等`VanBlog`自己的图床实现吧

## 评论

`VanBlog` 采用 [waline](https://waline.js.org/) 作为评论系统。

如果想启用评论功能，可参考 []() 部署 `waline` 后，在后台 `站点管理/站点配置` 中填写 `WaLine 服务端 Url` 即可启用。
