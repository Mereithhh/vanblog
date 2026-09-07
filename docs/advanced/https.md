---
title: HTTPS
icon: certificate
order: 1
---

VanBlog 镜像内采用了 Caddy 作为反向代理，并支持全自动按需 HTTPS 证书申请配置。

<!-- more -->

::: info Caddy

[Caddy](https://caddyserver.com/) 是一款默认开启并支持自动 HTTPS 、证书申请续期的 Web 服务器。

:::

## 开启 HTTPS

VanBlog 首次运行默认关闭 HTTPS，请通过 HTTP 协议访问。无需多余设置，首次通过 “HTTPS + 域名” 访问时，会自动申请 HTTPS 证书并应用。

::: info 自动 HTTPS 要求

- 在部署时设置了 `EMAIL` 环境变量
- 对外映射了 `80/443` 端口，确保公网可访问
- 正在通过要申请证书的域名访问该服务器（已经设置了 DNS 解析）

:::

你可以点击 `使用当前访问域名触发按需申请` 按钮手动触发一下证书申请。

触发请后稍等一会（申请时间取决于网络环境）。若成功，页面将通过 HTTPS 正常加载。

![申请证书](https://pic.mereith.com/img/8383fb4f32144be26cb134c2390d6d10.clipboard-2022-08-23.png)

::: tip

1. 如果超过 5 分钟还是不生效，请检查日志。
1. 只有域名可以触发证书申请，通过 IP 访问不会触发。

:::

## HTTPS 自动重定向

当你确保可以通过自动申请的证书正常访问的时候，可以选择开启 `https 自动重定向` 功能，开启后所有的 `http` 访问将自动重定向到 HTTPS。

初始化完成后，请进入后台的 `站点管理/系统设置/HTTPS`，确认 HTTPS 证书已自动生成。确认状态正常后，再按需开启 HTTPS 自动重定向。

![开启 https 自动重定向](https://pic.mereith.com/img/d1e7b502279f0bd8225dfaedf89a5140.clipboard-2022-08-23.png)

这个配置将会保存到数据库，每次容器启动的时候都会初始化到 Caddy 中。

开启后请用无痕窗口访问 `http://你的域名`，确认会跳到 `https://`。也可在后台点「查看 Caddy 配置」，`apps.http.servers.srv1.listener_wrappers` 应含 `{"wrapper":"http_redirect"}`。若仍是 http，说明重定向未写入，请看 Caddy 日志或重试保存。

::: note

1. 开启后，不能通过 `http + ip` 访问站点
1. 无论 HTTPS 自动重定向是否开启，均不支持通过 `HTTPS + IP 地址` 来访问。需要 IP 访问请用 HTTP 协议并关闭 HTTPS 自动重定向。

:::

## FAQ

::: info 原理

VanBlog 通过 Caddy 的 API 在运行时动态修改配置来开关 HTTPS 自动重定向。

全自动按需申请证书可以参考 [on-demand-tls](https://caddyserver.com/docs/automatic-https#on-demand-tls)

:::

::: tip 问题排查

开启自动重定向后，用无痕窗口访问 `http://域名` 应跳到 https。若没有跳转，点「查看 Caddy 配置」确认 `srv1.listener_wrappers` 含 `http_redirect`（[#150](https://github.com/Mereithhh/vanblog/issues/150)）。

如果你熟悉 Caddy ，或者想自己排查，可以点击 `查看日志` 或者 `查看配置` 按钮自行排查。

- VanBlog 访问日志在容器中的 `/var/log/vanblog-access.log`

- Caddy 的运行日志储存在 `/var/log/caddy.log`中，除了可以在后台查看外，也可以自行进入容器中或挂载目录查看。

:::
