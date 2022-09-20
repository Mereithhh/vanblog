---
title: 通过宝塔面板部署
icon: linux
---

你也可以通过宝塔面板图形化操作部署 `VanBlog`，具体步骤如下：

## 安装依赖

进入宝塔后台，点击侧边栏 `Docker` ，点击安装按钮。

![](https://www.mereith.com/static/img/ea11d7d7f754edf2303c710071ce540b.clipboard-2022-09-02.png)

耐心等一会，宝塔会自动安装好这些：

![](https://www.mereith.com/static/img/e5b15c94a2a0d38c1f9b9b4ca1dcc8dd.clipboard-2022-09-02.png)

## 添加 docker-compose 模板

如图所示，添加 `docker-compose` 模板，模板名称为 `vanblog`，描述随意。

![](https://www.mereith.com/static/img/d4a56888230de79cc31bbeb603578e02.clipboard-2022-09-03.png)

![](https://www.mereith.com/static/img/9a207817805fb0f0a4b65a85edb699b4.clipboard-2022-09-02.png)

模板内容请复制下面的代码，注意需要按注释修改 `VAN_BLOG_ALLOW_DOMAINS` 为你的域名， `EMAIL` 为你的邮箱：

```yaml
version: "3"

services:
  vanblog:
    # 默认 dockerhub 源
    image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 图片资源允许的域名，英文逗号分隔。作者 logo 加载不出来请检查此项。不要带协议！
      VAN_BLOG_ALLOW_DOMAINS: "www.mereith.com"
      # CDN URL，包含协议，部署到 cdn 的时候用。在开启 cdn 之前请不要设置此项。
      # VAN_BLOG_CDN_URL: "https://www.mereith.com"
      # mongodb 的地址
      VAN_BLOG_DATABASE_URL: "mongodb://vanBlog:vanBlog@mongo:27017/vanBlog?authSource=admin"
      # 邮箱地址，用于自动申请 https 证书
      EMAIL: "someone@mereith.com"
      # 内嵌评论系统的 db 名，默认为 waline
      VAN_BLOG_WALINE_DB: "waline"
    volumes:
      # 图床文件的存放地址，按需修改。
      - /var/vanblog/data/static:/app/static
      # 日志文件
      - /var/vanblog/log:/var/log
      # caddy 配置存储
      - /var/vanblog/caddy/config:/root/.config/caddy
      # caddy 证书存储
      - /var/vanblog/caddy/data:/root/.local/share/caddy
    ports:
      - 80:80
      - 443:443
  mongo:
    # 某些机器不支持 avx 会报错，所以默认用 v4 版本。有的话用最新的。
    image: mongo:4.4.16
    restart: always
    environment:
      TZ: "Asia/Shanghai"
      # 如果你改了这两个，那上面的数据库连接地址也要同步修改。
      # mongoDB 初始化用户名
      MONGO_INITDB_ROOT_USERNAME: vanBlog
      # mongoDB 初始化密码
      MONGO_INITDB_ROOT_PASSWORD: vanBlog
      MONGO_INITDB_DATABASE: vanBlog
    volumes:
      - /var/vanblog/data/mongo:/data/db
    # 如果你向在外部访问数据库，并且已经设置了强密码，那可以取消下面的注释
    # ports:
    # - 27017:27017
```

## 启动

如下图所示，新建 `Compose` 项目，名称写 `vanblog`，模板选择刚刚创建的。

![](https://www.mereith.com/static/img/920dd318b4073cc793c11caa4700d7b9.clipboard-2022-09-02.png)

然后会弹出窗口拉取镜像启动容器：

![](https://www.mereith.com/static/img/193a1acb5f783923ffc83dc67de6fced.clipboard-2022-09-02.png)

等启动完毕后即可！

和普通部署一样，浏览器打开 `http://<你的域名>/admin/init` ，并按照提示初始化即可。具体设置项可以参考 [站点配置](/feature/basic/setting.md)

有问题的话可以查看一下容器的日志进行排查。

## 端口被占用

改一下编排里的端口映射到非常用端口就好了。

![](https://pic.mereith.com/img/47a03229d46e9120ad1e7bf1abf4b504.clipboard-2022-09-14.png)
