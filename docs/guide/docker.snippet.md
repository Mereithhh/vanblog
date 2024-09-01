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
version: '3'

services:
  vanblog:
    # 阿里云镜像源
    # image: registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest
    image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: 'Asia/Shanghai'
      # 邮箱地址，用于自动申请 https 证书
      EMAIL: 'someone@mereith.com'
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
      TZ: 'Asia/Shanghai'
    volumes:
      - ${PWD}/data/mongo:/data/db
```

> 所有可用的环境变量详见 [参考 → 环境变量](../reference/env.md)。

### 3.启动项目

按注释说明修改 `docker-compose.yaml` 的配置后运行：

```bash
docker-compose up -d
```

启动完毕后，请 [完成初始化](./init.md)。
