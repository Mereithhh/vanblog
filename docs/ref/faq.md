---
title: FAQ
icon: question
---

::: info VanBlog

VanBlog 目前处于快速迭代期，您可以先尝试参考升级指南进行升级，可能会解决一些问题：

- [升级指南](../guide/update.md)

:::

### 部署后无法访问后台

可以按照下面的步骤简单排查一下：

0. 检查编排端口映射、配置是否正确。
1. 看看容器日志，启动是否成功。
2. 检查一下访问网址、端口是否正确。
3. 检查一下服务器防火墙、云服务厂商防火墙是否放行。
4. 检查一下本地服务器能不能访问。用 curl 简单测一下。

### 后台编辑器主题颜色错乱

这是因为设置了浏览器主题颜色导致的，把浏览器主题颜色偏好设置成默认或者跟随切换就好了。

### 文章编辑器内容不对题

这是浏览器内实时缓存导致的，编辑器会实时保存内容到浏览器的 LocalStorage，这个标识符是以 文章 id 为准的，如果你重装过或者迁移过，那么原来的文章 id 和现在文章 id 对应的内容是不同的，就会导致这个问题。

解决办法很简单：在后台编辑器右上角的下拉菜单中手动点击清理该篇文章的缓存即可。

### 宝塔 nginx 反代后前台显示错误

使用宝塔内置的 nginx 反代后可能会出现一些问题：比如文章不更新等。

之前有朋友也和我反馈了类似的问题。 经过排查是因为宝塔 nginx 本身的问题，他卸载了宝塔自带的 nginx ，然后手动安装了新版 nginx（通过系统的包管理器）后，解决了此问题。

PS: 我怀疑宝塔 nginx 本身会在您自定义的配置文件外自动添加一些配置，或者是有一些专门为了宝塔面板做的客制化改造，导致了这个问题。

如果还是没能解决可以去交流群里问我。

### 端口被占用

改一下编排里的端口映射到非常用端口就好了。

![](https://pic.mereith.com/img/47a03229d46e9120ad1e7bf1abf4b504.clipboard-2022-09-14.png)

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

::: info 提示

VanBlog 自 `v0.42.0` 已舍弃 `VAN_BLOG_ALLOW_DOMAINS` 环境变量，如果出现这个问题，推荐升级到最新版本以解决问题。

[升级指南](/guide/update.md)
:::

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

设置 `vanblog` 容器的 `VAN_BLOG_CDN_URL` 这个环境变量后，按部就班增加 CDN 即可。

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

默认的数据库是不会暴漏在外面的，只在容器内可访问，是相对安全的。

如果你看不懂下面的描述，我建议你先学一下相关的知识。如果不想学的话，建议还是放弃在外部访问数据库的打算，不然安全问题堪忧。

为了安全考虑默认的 docker-compose.yml 编排中的 mongoDB 是仅容器内访问的（换句话说不会对外保留端口）。

如果你想连接的话，首先需要修改编排中 mongoDB 的账密（对外暴漏端口有安全风险，一定要设置强密码！）

![](https://www.mereith.com/static/img/06f19fe68043cd4e8780e1e2484b70d9.clipboard-2022-09-02.png)

注意画红圈的地方要同步改，然后加上下图画红线的语句：

![](https://www.mereith.com/static/img/e2bc119c1408d50f73a2da526dec96c8.clipboard-2022-09-02.png)

然后运行 `docker-compose down -v && docker-compose up -d` 重启容器，就可以通过 27017 端口访问 mongoDB 了。

具体访问方式可以自行查阅资料，我一般都是用 [mongoDBCompass](https://www.mongodb.com/try/download/compass) 这个工具。

### 如何回滚

您可以通过指定镜像的版本号来实现，比如您想回滚到 `v0.29.0`，那您可以修改编排中的：

`mereith/van-blog:latest` 为 `mereith/van-blog:v0.29.0` ，然后运行：

```bash
docker-compose down -v && docker-compose up -d
```

### https 反代前台点击按钮跳转后页面不更新

参考其他人的经验，用宝塔 + nginx 可能会出现这个问题，这时可以尝试升级一下 nginx 版本应该能得到解决。

### Bug 反馈

请提到项目仓库 [issue](https://github.com/Mereithhh/van-blog/issues/new/choose)，无特殊情况会在一天内解决。

<!-- ### 什么是 SSG / SSR

### 能解释一下增量渲染吗？

next.js 的 ISR 了解一下？开箱即用。 -->
