---
icon: linux
title: 部署
copyright: false
order: -1
---

::: info VanBlog

VanBlog 是一款简洁实用优雅的高性能个人博客系统。支持黑暗模式、支持移动端自适应和评论、内置流量统计与图床，配有完备的、支持黑暗模式、支持移动端、支持一键上传剪切板图片到图床、带有强大的编辑器的后台管理面板。

你也可以先查看 [Demo](https://blog-demo.mereith.com)，账号密码均为 `demo`

目前 VanBlog 还在快速迭代中，如果后台出现升级提示，推荐进行升级。
:::

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

你也可以先查看 [Demo](https://blog-demo.mereith.com)，账号密码均为 `demo`

## 配置要求

理论上 `VanBlog` 不需要很高的配置，实际上演示站不算数据库，资源的占用情况如图：

![](https://www.mereith.com/static/img/bd2a2c983aa92288106652294a892494.clipboard-2022-09-03.png)

不到 `400M` 的内存（有一部分还是静态页面缓存），启动时大概峰值占用处理器一个核心的 `30%`，其余时间基本不占用什么处理器资源。

但比较小的带宽可能会让页面加载变慢（第一次慢，后面的话有缓存加速就会快一些），如果带宽比较小的话可以尝试设置一下 [CDN](/ref/faq.md#%E5%A6%82%E4%BD%95%E9%83%A8%E7%BD%B2%E5%88%B0%20CDN)。

## 部署方式

- [脚本部署](#一键脚本部署)
- [docker-compose 部署](#docker-compose-部署)
- [直接部署](#直接部署)
- [宝塔面板部署](/ref/baota.md)
- [群晖部署](/ref/dsm.md)

## 一键脚本部署

::: info VanBlog
现在可以使用一键脚本来部署 VanBlog 啦！刚开发完试运行中，有问题请及时反馈！

只推荐在纯 linux 环境下使用此脚本，宝塔原则上可以用，但我没有仔细测过，如有问题请反馈！

群晖部署请参考： [群晖部署教程](/ref/dsm.md)
:::

输入以下命令即可：

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

将来如果需要再次运行脚本，可以运行：

```bash
./vanblog.sh
```

## docker-compose 部署

### 1.安装依赖

如果你没有安装 `docker` 和 `docker-compose`，可以通过以下命令一键安装：

```bash
curl -sSL https://get.daocloud.io/docker | sh
systemctl enable --now docker
```

如果你没有接触过 `docker`，但是想了解一下，可以看下面的教程：

> [Docker 入门教程](https://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)

**只需要安装 `docker` 和 `docker-compose` 就可以了，不需要手动安装 `mongoDB`**，因为编排中已经包含了数据库（数据库是通过 docker 容器化运行的，不需要手动安装）。

### 2.新建编排文件

在安装好了 `docker` 和 `docker-compose` 后，新建一个 `vanblog` 的目录，在这个目录下新建 `docker-compose.yml`文件，内容如下：

```yaml
version: "3"

services:
  vanblog:
    image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 图片资源允许的域名，英文逗号分隔。作者 logo 加载不出来请检查此项。不要带协议！
      VAN_BLOG_ALLOW_DOMAINS: "www.mereith.com"
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
      # 前面的是映射到宿主机的端口号，改端口的话改前面的。
      - 80:80
      - 443:443
  mongo:
    # 某些机器不支持 avx 会报错，所以默认用 v4 版本。有的话用最新的。
    image: mongo:4.4.16
    restart: always
    environment:
      TZ: "Asia/Shanghai"
    volumes:
      - ${PWD}/data/mongo:/data/db
```

> 所有可用的环境变量请参考 [启动配置](/ref/env.md)

### 3.启动项目

按注释说明修改`docker-compose.yml`的配置后运行：

```bash
docker-compose up -d
```

PS: 请检查 `VAN_BLOG_ALLOW_DOMAINS` 变量是否正确，否则作者头像可能无法正常显示。

浏览器打开 `http://<你的域名>/admin/init` ，并按照提示初始化即可。具体设置项可以参考 [站点配置](/feature/basic/setting.md)

也可以在前台点击右上角管理员按钮即可进入后台初始化页面。

> 如果你想在外部访问数据库，请参考 [常见问题](/guide/faq.md) 中的 `如何从外部访问数据库`
>
> 如果你想反代请参考 [反代](/guide/nginx.md)

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
        - name: static
          hostPath:
            path: /var/k8s/van-blog/static
            type: ""
        - name: log
          hostPath:
            path: /var/k8s/van-blog/log
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
            - name: EMAIL
              value: >-
                vanblog@mereith.com
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
            - name: static
              mountPath: /app/static
            - name: log
              mountPath: /var/log
          imagePullPolicy: Always
```

## 宝塔面板部署

请移步 [通过宝塔面板部署 VanBlog](/ref/baota.md)

## 群晖部署

请移步 [群晖部署 VanBlog](/ref/dsm.md)

## 直接部署

::: warning 须知

`VanBlog` 内部由很多微服务组成，直接部署到裸机环境可能会由于硬件、系统版本不同、软件不同而出现很多意料之外的问题，容器化可以提供很好的隔离环境，避免因这些差异导致的问题。

容器的话，基本上没什么学习成本，和一键部署也没区别了，迁移和升级都非常方便。

实际上，第一版方案是至少由 3 个微服务组成的分体式部署。后来才打包成了一个镜像。

`VanBlog` 的定位是简洁实用的，尽可能的减少复杂的配置。

裸机部署需要的`知识储备`的`可能遇到的坑`（不同的 node 版本、端口被占用、不同的系统、部署路径的影响等等）可能远大于简单的学习 `docker-compose up -d` 这一个指令。

（容器化真的是很好的技术，我很推荐大家都去学习一下）

裸机部署需要的时间远远大于您起一个容器的时间，如果您执意要裸机部署，请继续往下看。

裸机部署遇到的问题，请自行百度。

:::

### 环境要求

| 项目         | 要求  | 备注                                                              |
| ------------ | ----- | ----------------------------------------------------------------- |
| Nodejs       | >=16  | 长期支持版即可，可用 nvm 管理 node 版本                           |
| yarn         | v1    | yarn 包管理器，其他管理器不能识别 yarn.lock 可能导致问题          |
| 操作系统     | Linux | 主流 linux 发行版即可                                             |
| MongoDB      | -     | 主流 mongodb 版本                                                 |
| Caddy        | v2    | Caddy v2 反代各个微服务，其他的反代理论上可以，但是需要自己写配置 |
| 后台运行程序 | -     | 可以让服务后台运行,比如 systemd、tmux 等                          |

### 步骤

#### 下载代码

```bash
# 假设你满足上面所有的条件
# 下载源码
git clone https://github.com/Mereithhh/van-blog
```

#### 构建并运行前台

```bash
# 切换目录
cd packages/website
# 安装依赖
yarn
# 构建
isBuild=t yarn build
# 用你自己的方式把下面的服务后台运行
yarn start -p 3001

```

#### 安装内嵌 waline 依赖

```bash
cd packages/waline
yarn
```

#### 运行后端

```
# 切换目录
cd packages/server
# 安装依赖
yarn
# 创建一个 config.yml 文件
touch config.yml
```

在创建的 `config.yml` 文件中写入

```yml
database:
  url: mongodb://someMongo:27017/vanBlog
static:
  path: 你想要保存图床图片的路径，要绝对路径
waline:
  db: walineDev
```

然后按照自己的方法把下面的命令运行到后台:

```
# 必须在 packages/server 目录下运行
yarn start
```

#### 构建后台页面并运行

```bash
# 切换目录
cd packages/admin
# 安装依赖
yarn
# 构建
yarn build
# 运行后台页面，按照你自己的方式把下面的页面运行在后台
PORT=3002 yarn serve
```

#### 启动反代 Caddy

```bash
# 在项目根目录
# 把 <YOUR_EMAIL> 替换成你自己的邮箱，然后执行下面的命令
sed "s/VAN_BLOG_EMAIL/<YOUR_EMAIL>/g" CaddyfileTemplateLocal > Caddyfile
caddy start --config ./Caddyfile
```

#### 完成

浏览器打开 `http://<你的域名>/admin/init` ，并按照提示初始化即可。具体设置项可以参考 [站点配置](/feature/basic/setting.md)

也可以在前台点击右上角管理员按钮即可进入后台初始化页面。
