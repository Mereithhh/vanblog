---
title: 部署常见问题
icon: rocket
order: 1
---

## 如何部署到 CDN

`VAN_BLOG_CDN_URL` 只给前台 Next.js 的公共资源加前缀（页面里的 `/_next/static` JS/CSS），**不会**改写文章里的图片或本地图床 `/static` 路径。

在编排文件 `docker-compose.yaml` 中设置 `vanblog` 容器的环境变量后重启容器即可，例如：

```yaml
environment:
  VAN_BLOG_CDN_URL: "https://cdn.example.com"
```

然后按部就班增加 CDN：回源到博客主站，缓存 `/_next/static`。

![image](https://user-images.githubusercontent.com/95157017/204312649-8d02dfd6-bb2a-4646-921c-d59f07221854.png)

原则上 CDN 只缓存 `/_next/static` 这个目录就够了。设置后需要重启 VanBlog 容器，HTML 里的脚本/样式会变成 `https://cdn.example.com/_next/static/...`。

## 反代后 Waline 登录跳到 localhost

在外层 Nginx 反代后面登录评论（GitHub 等 OAuth）或打开 Waline 管理后台时，浏览器可能跳到 `localhost` 或 `0.0.0.0`，而不是站点域名（[#396](https://github.com/Mereithhh/vanblog/issues/396)）。

这是因为反代没有把真实 `Host` 传给 VanBlog。内嵌 Waline 会用 upstream 地址（容器映射的 `127.0.0.1` / `0.0.0.0`）去拼 OAuth 回调 URL。

在 Nginx 的 `location` 里加上：

```nginx
proxy_set_header Host $host;
```

并建议同时转发 `X-Forwarded-Proto` 和 `X-Forwarded-For`。完整 Http / Https 示例见 [反代](../reference/reverse-proxy.md)。

只用 VanBlog 内置 Caddy、没有再套一层反代时，一般不需要改这个。

## Cloudflare 缓存了后台或后台 API

Cloudflare（或同类 CDN）如果用「缓存全部」覆盖 `/*`，即使另有 `/admin*` 绕过规则，**`/api/admin/*` 也不会被那条规则匹配**，登录和后台 JSON 仍可能被边缘缓存（[#140](https://github.com/Mereithhh/vanblog/issues/140)）。只改页面规则不够：旧版本源站没有 `Cache-Control`。

升级后 VanBlog 会对 `/admin` 和 `/api/admin/*` 返回：

- `Cache-Control: private, no-store, no-cache, must-revalidate`
- `CDN-Cache-Control: no-store`
- `Cloudflare-CDN-Cache-Control: no-store`

前台文章 HTML 和 `/_next/static` 不会被改成 no-store。仍建议在 Cloudflare 为 `/admin*` 与 `/api/admin*` 设置「绕过缓存」。改完后到 Cloudflare 清一下该路径的缓存。

## 一键脚本下载编排文件失败

一键安装 / `config` 需要下载 `docker-compose-template.yml`。旧脚本只请求 `https://vanblog.mereith.com/docker-compose-template.yml`，部分网络（例如北美）即使能上网也连不上该主机，于是报「下载脚本失败」（[#115](https://github.com/Mereithhh/vanblog/issues/115)）。

请先更新到最新脚本（菜单 **20. 更新此脚本**，或重新下载）。新脚本会按顺序尝试：

1. `https://vanblog.mereith.com/docker-compose-template.yml`
1. GitHub raw：`https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml`
1. jsDelivr：`https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/docker-compose/docker-compose-template.yml`

某一地址成功就会继续安装，并打印实际使用的 URL。全部失败才会报错退出。更新脚本自身也使用同一套回退。

若连文档站上的 `vanblog.sh` 都下不下来，可以用 GitHub raw：

```bash
curl -L https://raw.githubusercontent.com/Mereithhh/vanblog/master/scripts/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

这与 Docker Hub / 镜像仓库拉取失败不是同一类问题。

## 如何安装 docker ?

可以用这个一键安装脚本:

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

## 如何在外部访问数据库

默认的数据库是不会暴漏在外面的，只在容器内可访问，是相对安全的。

如果你看不懂下面的描述，我建议你先学一下相关的知识。如果不想学的话，建议还是放弃在外部访问数据库的打算，不然安全问题堪忧。

为了安全考虑默认的 docker-compose.yaml 编排中的 mongoDB 是仅容器内访问的（换句话说不会对外保留端口）。

如果你想连接的话，首先需要修改编排中 mongoDB 的账密（对外暴漏端口有安全风险，一定要设置强密码！）

![修改账号密码](https://www.mereith.com/static/img/06f19fe68043cd4e8780e1e2484b70d9.clipboard-2022-09-02.png)

注意画红圈的地方要同步改，然后加上下图画红线的语句：

![添加端口](https://www.mereith.com/static/img/e2bc119c1408d50f73a2da526dec96c8.clipboard-2022-09-02.png)

然后运行 `docker-compose down -v && docker-compose up -d` 重启容器，就可以通过 27017 端口访问 mongoDB 了。

具体访问方式可以自行查阅资料，我一般都是用 [mongoDBCompass](https://www.mongodb.com/try/download/compass) 这个工具。

## 部署后无法访问后台

可以按照下面的步骤进行排查：

1. 检查编排端口映射、配置是否正确。
1. 浏览容器日志，确认是否成功启动。
1. 检查访问网址、端口是否正确。
1. 检查服务器防火墙、云服务厂商防火墙是否放行。
1. 检查本地服务器能不能访问。用 curl 简单测一下。

## docker 镜像拉取慢

您可以 [设置 docker 镜像加速器](https://www.runoob.com/docker/docker-mirror-acceleration.html)。

## 端口被占用

改一下编排里的端口映射到非常用端口就好了。

![端口修改](https://pic.mereith.com/img/47a03229d46e9120ad1e7bf1abf4b504.clipboard-2022-09-14.png)

## 部署后 http error

![错误案例](https://pic.mereith.com/img/ae28e582a7dce7be4816c1bf82dd77de.clipboard-2022-08-28.png)

请检查一下 docker-compose 编排文件，如果修改了下面的数据库账号密码，上面的也要同步修改。

![检查位置](https://pic.mereith.com/img/eb46eabfff8856c84ccd54a97d7f333c.clipboard-2022-08-28.png)

这两个地方的账号密码是对应的，实际上数据库是不会暴露到外面的（因为没有映射端口），所以无需更改默认账号与密码。

如需求该，需要同步修改两处，比如数据库账号密码改成了 `admin` 与 `xxxx`，那对应的数据库链接地址也要改成: `mongodb://admin:xxxx@mongo:27017`。

如果还是没能解决可以去 [QQ 交流群](https://jq.qq.com/?_wv=1027&k=5NRyK2Sw) 寻求帮助。

## 无法通过 Https + IP 访问网址

很遗憾，目前不支持通过 `https + ip` 访问，请通过 `https + 域名` 或者 `http + ip` 访问。用 `http + ip` 访问前请在后台设置中关闭 `https 自动重定向`。

## 宝塔 nginx 反代后前台显示错误

使用宝塔内置的 nginx 反代后可能会出现一些问题：比如文章不更新等。

之前有朋友也和我反馈了类似的问题。经过排查是因为宝塔 nginx 本身的问题，他卸载了宝塔自带的 nginx ，然后手动安装了新版 nginx（通过系统的包管理器）后，解决了此问题。

::: note

宝塔 nginx 本身会在配置文件外自动添加一些配置，或者是有一些专门为了宝塔面板做的定制化改造，导致了这个问题。

:::

## https 反代前台点击按钮跳转后页面不更新

参考其他人的经验，用 宝塔 + Nginx 可能会出现这个问题，这时可以尝试升级一下 Nginx 版本应该能得到解决。
