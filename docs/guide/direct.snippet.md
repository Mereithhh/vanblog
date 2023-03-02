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

启动完毕后，请 [完成初始化](./init.md)。
