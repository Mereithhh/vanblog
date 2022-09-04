---
title: FAQ
icon: question
---

::: info VanBlog

VanBlog 目前处于快速迭代期，您可以先尝试参考升级指南进行升级，可能会解决一些问题：

[升级指南](/guide/update.md)
:::

### docker 镜像拉取慢

您可以设置一下 docker 镜像加速器：

> [Docker 镜像加速](https://www.runoob.com/docker/docker-mirror-acceleration.html)

### 部署后 http error

![](https://pic.mereith.com/img/ae28e582a7dce7be4816c1bf82dd77de.clipboard-2022-08-28.png)

请检查一下 docker-compose 编排文件，如果修改了下面的数据库账号密码，上面的也要同步修改。

![](https://pic.mereith.com/img/eb46eabfff8856c84ccd54a97d7f333c.clipboard-2022-08-28.png)

这两个地方的账号密码是对应的，实际上数据库是不会暴露到外面的（因为没有映射端口），所以默认账号密码不改也行。

改的要话要同步改。

比如您把下面的数据库账号密码改成了 admin 与 xxxx。

那对应的数据库链接地址也要改成: mongodb://admin:xxxx@mongo:27017

### 图片（作者 logo）加载不出来

可能是没正确设置 `VAN_BLOG_ALLOW_DOMAINS` 这个环境变量导致的。

作者 logo 用了 next.js 的图片缓存技术，需要显式指明安全的域名。

比如用了 `xyx.com` 这个域名访问访问，那需要设置 `VAN_BLOG_ALLOW_DOMAINS` 为 `xyz.com`，比如用了 `localhost` 访问，那需要设置为 `localhost`，如果多个域名用英文逗号分隔，不支持通配符。

请参考 [启动配置](/ref/env.md#环境变量)

### 在编辑器复制后格式错乱

默认粘贴的格式可能带有一些额外信息，你可以鼠标右键选择复制为纯文本，或者使用快捷键 `ctrl+shift+v` 。

![](https://pic.mereith.com/img/88b29bad4ad0ef7d6e411e43f80ec1bc.clipboard-2022-08-22.png)

### 升级之后文章都没了

因为本质上我们是静态页面，升级后容器内是没有按照你的当前数据生成的静态页面的。

每次容器启动时都会自动触发增量渲染，等一会触发完成后就再打开就正常了。

### 如何部署到 CDN

设置 `VAN_BLOG_CDN_URL` 这个环境变量后，按部就班增加 CDN 即可。

原则上 CDN 只缓存 `/_next/static` 这个目录就够了。

### 我觉得太丑了||可以自定义样式吗？

可以！请参考 [客制化功能](/feature/advance/customizing.md)

### 自定义页面

现在已经可以自定义页面了！请参考 [自定义页面](/feature/advance/customPage.md)

### 如何安装 docker ?

可以用这个一键安装脚本:

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

### 无法通过 https + ip 访问网址

很遗憾，目前不支持通过 `https + ip` 访问，请通过 `https + 域名` 或者 `http + ip` 访问。用 `http + ip` 访问前请在后台设置中关闭 `https 自动重定向`

### 如何在外部访问数据库

为了安全考虑默认的 docker-compose.yml 编排中的 mongoDB 是仅容器内访问的（换句话说不会对外保留端口）。

如果你想连接的话，首先需要修改编排中 mongoDB 的账密（对外暴漏端口有安全风险，一定要设置强密码！）

![](https://www.mereith.com/static/img/06f19fe68043cd4e8780e1e2484b70d9.clipboard-2022-09-02.png)

注意画红圈的地方要同步改，然后加上下图画红线的语句：

![](https://www.mereith.com/static/img/e2bc119c1408d50f73a2da526dec96c8.clipboard-2022-09-02.png)

然后运行 `docker-compose down && docker-compose up -d` 重启容器，就可以通过 27017 端口访问 mongoDB 了。

具体访问方式可以自行查阅资料，我一般都是用 [mongoDBCompass](https://www.mongodb.com/try/download/compass) 这个工具。

### 如何回滚

您可以通过指定镜像的版本号来实现，比如您想回滚到 `v0.29.0`，那您可以修改编排中的：

`mereith/van-blog:latest` 为 `mereith/van-blog:v0.29.0` ，然后运行：

```bash
sudo docker-compose down && sudo docker-compose up -d
```

### Bug 反馈

请提到项目仓库 [issue](https://github.com/Mereithhh/van-blog/issues/new/choose)，无特殊情况会在一天内解决。

<!-- ### 什么是 SSG / SSR

### 能解释一下增量渲染吗？

next.js 的 ISR 了解一下？开箱即用。 -->
