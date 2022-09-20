---
icon: selection
title: HTTPS
copyright: false
order: -3
---

::: info VanBlog

无论 `HTTPS 自动重定向` 是否开启，都暂不支持通过 `https + ip 地址` 来访问。

需要 ip 访问请用 `http` 协议并关闭 `https 自动重定向`

各位反代的同学，不要管什么 Caddy ，就当他不存在！VanBlog 是一个整体，反代你映射的 http 端口就好了！

需要反代请前往： [反代配置](/guide/nginx.md)

:::

`VanBlog` 镜像内采用了 `Caddy` 作为反向代理，并支持全自动按需 HTTPS 证书申请配置。

[Caddy](https://caddyserver.com/) 是一款默认开启并支持自动 `https` 、证书申请续期的 web 服务器

首次运行时默认关闭了 `https 自动重定向` ，请在初始化后进入后台的 `站点管理/系统设置/ HTTPS` 中设置确认 `https` 状态后再按需开启 `https 自动重定向`

![](https://pic.mereith.com/img/d1e7b502279f0bd8225dfaedf89a5140.clipboard-2022-08-23.png)

## 自动 HTTPS 要求

- 在部署时设置了 `EMAIL` 环境变量
- 对外映射了 `80/443` 端口，确保公网可达
- 正在通过要申请证书的域名访问该服务器（已经设置了 DNS 解析）

## 开启方式

无需多余设置，首次通过 `https + 域名` 访问时，会自动申请 `https` 证书并应用。

你可以点击 `使用当前访问域名触发按需申请` 按钮手动触发一下证书申请。

触发请后稍等一会（申请时间取决于网络环境）,若成功，页面将通过 https 正常加载，如果过了 5 分钟还是不生效，可以检查一下日志。

注意的是只有域名可以，通过 `ip` 访问是不会触发自动申请证书的。

![](https://pic.mereith.com/img/8383fb4f32144be26cb134c2390d6d10.clipboard-2022-08-23.png)

## https 自动重定向

当你确保可以通过自动申请的证书正常访问的时候，可以选择开启 `https 自动重定向` 功能，开启后所有的 `http` 访问将自动重定向到 `https`。

但是开启后，也不可以通过 `https+ip` 访问本站了，所以一定要确认后再开启。

这个配置将会保存到数据库，每次容器启动的时候都会初始化到 `Caddy` 中。

## 原理

`VanBlog` 通过 `Caddy` 的 `API` 在运行时动态修改配置来开关 `https` 自动重定向。

全自动按需申请证书可以参考 [on-demand-tls](https://caddyserver.com/docs/automatic-https#on-demand-tls)

## 问题排查

如果你懂 `Caddy` ，或者想自己排查，可以点击查看日志，或者查看配置按钮自行排查。

## 日志

`Caddy` 的运行日志除了可以在后台点按钮看到外，也可以进入容器中查看： `/var/log/caddy.log`

`access` 日志在容器中的 `/var/log/vanblog-access.log`

不进容器，去宿主机挂在日志的目录看也行。
