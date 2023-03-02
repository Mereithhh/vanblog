---
title: 通过宝塔面板部署
icon: fab fa-linux
redirectFrom: /ref/baota.html
---

::: tip 温馨提示

VanBlog 现在支持一键脚本部署了。经过测试，宝塔也可以通过一键脚本进行部署。

建议您通过[一键脚本部署](../guide/get-started.md#一键脚本部署)，这样后期可以通过脚本一键升级会方便一些。

如果您想通过图形化部署，请看下文。

宝塔面板自带的 nginx 会占用 80 端口，所以以下教程用的 8880 端口，如果您想关闭 nginx，可以输入 `nginx -s stop`，并把端口映射改为默认的 80 和 443。

否则默认需要您反代 `8880` 端口。

:::

你也可以通过宝塔面板图形化操作部署 VanBlog，具体步骤如下：

## 安装依赖

进入宝塔后台，点击侧边栏 `Docker` ，点击安装按钮。

![](https://www.mereith.com/static/img/ea11d7d7f754edf2303c710071ce540b.clipboard-2022-09-02.png)

耐心等一会，宝塔会自动安装好这些：

![](https://www.mereith.com/static/img/e5b15c94a2a0d38c1f9b9b4ca1dcc8dd.clipboard-2022-09-02.png)

## 添加 docker-compose 模板

如图所示，添加 `docker-compose` 模板，模板名称为 `vanblog`，描述随意。

![](https://www.mereith.com/static/img/d4a56888230de79cc31bbeb603578e02.clipboard-2022-09-03.png)

![](https://www.mereith.com/static/img/9a207817805fb0f0a4b65a85edb699b4.clipboard-2022-09-02.png)

模板内容请复制下面的代码，注意需要按注释修改 `EMAIL` 为你的邮箱：

```yaml
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
      - /var/vanblog/data/static:/app/static
      # 日志文件
      - /var/vanblog/log:/var/log
      # Caddy 配置存储
      - /var/vanblog/caddy/config:/root/.config/caddy
      # Caddy 证书存储
      - /var/vanblog/caddy/data:/root/.local/share/caddy
    ports:
      # 前面的是映射到宿主机的端口号，该端口的话改前面的。
      - 8880:80
      - 4443:443
  mongo:
    # 某些机器不支持 avx 会报错，所以默认用 v4 版本。有的话用最新的。
    image: mongo:4.4.16
    restart: always
    environment:
      TZ: "Asia/Shanghai"
    volumes:
      - /var/vanblog/data/mongo:/data/db
```

所有可用的环境变量请参考 [启动配置](./env.md)

## 启动

如下图所示，新建 `Compose` 项目，名称写 `vanblog`，模板选择刚刚创建的。

![](https://www.mereith.com/static/img/920dd318b4073cc793c11caa4700d7b9.clipboard-2022-09-02.png)

然后会弹出窗口拉取镜像启动容器：

![](https://www.mereith.com/static/img/193a1acb5f783923ffc83dc67de6fced.clipboard-2022-09-02.png)

等启动完毕后即可！

和普通部署一样，浏览器打开 `http://<你的域名>:8880/admin/init` ，并按照提示初始化即可。具体设置项可以参考 [站点配置](../features/config.md)。

有问题的话可以查看一下容器的日志进行排查。

## 端口被占用

改一下编排里的端口映射到非常用端口就好了。

![](https://pic.mereith.com/img/47a03229d46e9120ad1e7bf1abf4b504.clipboard-2022-09-14.png)

如果你只部署 VanBlog ，并想关闭 Ngnix ，请输入以下命令关闭 Ngnix:

```bash
nginx -s stop
```

## 反代

请移步 [反代](./reverse-proxy.md)。
