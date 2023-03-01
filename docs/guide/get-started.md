---
title: 快速上手
icon: lightbulb
order: 1
redirectFrom: /guide/docker.html
---

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

<!-- more -->

::: tip

目前 VanBlog 还在快速迭代中，如果后台出现升级提示，推荐进行升级。

:::

## 介绍

@include(@/info.snippet.md)

## 配置要求

理论上 VanBlog 不需要很高的配置，实际上演示站不算数据库，资源的占用情况如图：

![资源占用](https://www.mereith.com/static/img/bd2a2c983aa92288106652294a892494.clipboard-2022-09-03.png)

不到 `400M` 的内存（有一部分还是静态页面缓存），启动时大概峰值占用处理器一个核心的 `30%`，其余时间基本不占用什么处理器资源。

但比较小的带宽可能会让页面加载变慢（第一次慢，后面的话有缓存加速就会快一些），如果带宽比较小的话可以尝试设置一下 [CDN](../faq/README.md#如何部署到-cdn)。

## 部署方式

- [脚本部署](#一键脚本部署)
- [docker-compose 部署](#docker-compose-部署)
- [直接部署](#直接部署)
- [宝塔面板部署](../reference/bt-panel.md)
- [群晖部署](../reference/dsm.md)

## 一键脚本部署

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

你可以使用上方命令通过脚本一键部署 VanBlog。

如果未来需要再次运行脚本，可直接运行：

```bash
./vanblog.sh
```

![脚本演示](https://pic.mereith.com/img/fbbf5dde011f9dec13cdb25ad741765f.clipboard-2022-09-20.png)

@include(./init.snippet.md)

::: tip

1. 只推荐在纯 Linux 环境下使用此脚本,宝塔面板也可以使用。脚本推出不久，未经过广泛测试，如有问题请反馈！
1. 群晖部署请参考 [群晖部署教程](../reference/dsm.md)。
1. 如果你想在外部访问数据库，请参考 [常见问题](../faq/README.md) 中的 `如何从外部访问数据库`
1. 反代时只需要反代映射的 HTTP 端口，详见 [反代配置](../reference/reverse-proxy.md)。由于 VanBlog 是一个整体，无需考虑内部的 Caddy。

:::

## docker-compose 部署

### 1.安装依赖

如果你没有安装 `docker` 和 `docker-compose`，可以通过以下命令一键安装：

```bash
curl -sSL https://get.daocloud.io/docker | sh
systemctl enable --now docker
```

::: tip

如果你没有接触过 `docker`，可以查看 [Docker 入门教程](https://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)。

:::

::: warning 环境要求

只需安装 **`docker` 和 `docker-compose`** 即可，**不需要手动安装 `mongoDB`**，因为编排中已经包含了数据库（数据库是通过 docker 容器化运行的，不需要手动安装）。

:::

### 2.新建编排文件

在安装好了 `docker` 和 `docker-compose` 后，新建一个 `vanblog` 的目录，在这个目录下新建 `docker-compose.yaml`文件，内容如下：

```yml
version: "3"

services:
  vanblog:
    image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 邮箱地址，用于自动申请 https 证书
      EMAIL: "someone@mereith.com"
    volumes:
      # 图床文件的存放地址，按需修改。
      - ${PWD}/data/static:/app/static
      # 日志文件
      - ${PWD}/log:/var/log
      # Caddy 配置存储
      - ${PWD}/caddy/config:/root/.config/caddy
      # Caddy 证书存储
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

> 所有可用的环境变量请参考 [启动配置](/reference/env.md)

### 3.启动项目

按注释说明修改 `docker-compose.yaml` 的配置后运行：

```bash
docker-compose up -d
```

@include(./init.snippet.md)

## kubernetes

以下是一个 `deployment` 的参考：

::: details

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

:::

## 宝塔面板部署

详见 [通过宝塔面板部署 VanBlog](../reference/bt-panel.md)

## 群晖部署

详见 [群晖部署 VanBlog](../reference/dsm.md)

## 直接部署

::: tip 容器化的优点

VanBlog 的定位是简洁实用的，尽可能的减少复杂的配置。

VanBlog 内部由很多微服务组成，直接部署到裸机环境可能会由于硬件、系统版本不同、软件不同而出现很多意料之外的问题，容器化可以提供很好的隔离环境，避免因这些差异导致的问题。

使用容器部署 VanBlog 学习成本小，迁移和升级都非常方便，与一键部署近乎没区别。（容器化真的是很好的技术，我很推荐大家都去学习一下）

:::

::: warning 自行部署须知

裸机部署需要的知识储备以及常见问题（不同的 node 版本、端口被占用、不同的系统、部署路径的影响等等）可能远大于简单的学习 `docker-compose up -d` 这一个指令。

裸机部署需要的时间远远大于你起一个容器的时间，如果你执意要裸机部署，请继续往下看。裸机部署遇到的问题，请自行百度。

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

#### 克隆项目

```bash
# 克隆项目
git clone https://github.com/Mereithhh/van-blog
# 切换到项目目录
cd van-blog
```

#### 构建并运行前台

```bash
# 切换到网站项目
cd packages/website
# 安装依赖
yarn
# 构建
isBuild=t yarn build
# 用你自己的方式把下面的服务后台运行
yarn start -p 3001

```

#### 安装内嵌 Waline 依赖

```bash
cd packages/waline
yarn
```

#### 运行后端

```bash
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

```bash
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

#### 初始化

@include(./init.snippet.md)
