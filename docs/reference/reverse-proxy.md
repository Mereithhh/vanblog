---
title: 反代
icon: refresh
order: 4
---

::: info 注意

VanBlog 内置了 caddy，可以全自动申请 https 证书，如没有其他服务需要共存，是不建议再加一层反代的。反代时只需要反代映射的 HTTP 端口，由于 VanBlog 是一个整体，无需考虑内部的 Caddy。你需要：

1. 按需修改默认的 80 端口号
1. 关闭 `https 自动重定向` (默认是关闭的)

:::

## 仅接受来自本机反代的流量

同机 Nginx / Caddy 反代时，可以把 VanBlog 绑到回环，避免 API 或映射端口暴露到公网（[#488](https://github.com/Mereithhh/vanblog/issues/488)）。这是**监听网卡**，不是额外的来源 IP 白名单。

### Nest API（端口 3000）

设置环境变量 `VAN_BLOG_SERVER_HOST=127.0.0.1`（或配置文件里的 `server.host`），重启后 Nest 只在回环上听 3000。默认留空，行为与现在一样（所有网卡）。

官方 all-in-one 镜像里，内置 Caddy 已经反代 `127.0.0.1:3000`，把 Nest 绑到 `127.0.0.1` 不会打断容器内部转发。前台 Next 进程仍按原方式启动，本项只改 API 的 listen host。

### Docker 映射的 80 / 443

宿主机上的反代访问的是编排映射出来的端口。只改 `VAN_BLOG_SERVER_HOST` **不会**把宿主机的 `80:80` 收成仅本机。这时应改编排，例如：

```yaml
ports:
  - "127.0.0.1:80:80"
  - "127.0.0.1:443:443"
```

然后本机反代指到 `127.0.0.1:<映射端口>`。不要改默认的 `80:80` / `443:443`，除非你确实在同机再套一层反代。

::: warning 注意

在外层反代后面请关闭后台「HTTPS 自动重定向」，只反代映射的 HTTP 端口。必须转发 `Host`，见下文 Nginx 示例。

:::

## 反代方式

### nginx-proxy-manager

强烈推荐 [nginx-proxy-manager](https://nginxproxymanager.com/)这个项目！它可以帮你自动管理反代配置，并申请相应的 `https` 证书。

### Caddy

第二推荐的是 [caddy](https://caddyserver.com/)，一个现代的高性能 web 服务器，它也可以自动帮你配置好 `https`

配置文件参考：

::: code-tabs

@tab Caddy V2

```conf
example.com {
  tls admin@example.com
  reverse_proxy  127.0.0.1:<你映射的端口号> {
    trusted_proxies private_ranges
  }
}
```

@tab Caddy V1

```conf
example.com {
  tls admin@example.com
  proxy / 127.0.0.1:<你映射的端口号> {
    transparent
    websocket
  }
}
```

:::

### Ngnix

如果你还是想想用 Ngnix 的话，那好吧。安利一个 Ngnix 配置在线生成工具： [https://nginxconfig.io/](https://nginxconfig.io/)

::: warning 注意

- 宝塔面板用 Ngnix 反代，如果出现问题，可以去升级一下 Ngnix 版本，有可能会解决问题。
- location 下面的配置块只保留下面提供配置的那几行就可以了，不要加奇奇怪怪的语句和请求头（看不懂请忽略）
- **必须转发 `Host`**（`proxy_set_header Host $host;`）。否则内嵌 Waline 评论登录 / 管理后台的 OAuth 回调会写成 `localhost` 或容器监听地址（如 `0.0.0.0`），而不是站点域名。见 [部署常见问题](../faq/deploy.md#反代后-waline-登录跳到-localhost)。
- 建议同时转发 `X-Forwarded-For`。若站点在 Cloudflare（或同类 CDN）后面，请把来访请求的 `CF-Connecting-IP` 原样转给 VanBlog，不要改写成边缘节点 IP。Nginx 默认会透传该头；登录日志会优先读它。
- 若 CDN 使用「缓存全部」，请为 `/admin*` 和 `/api/admin*` 设置绕过缓存。VanBlog 源站已对这两类路径发送 `Cache-Control: private, no-store` 以及 `CDN-Cache-Control` / `Cloudflare-CDN-Cache-Control: no-store`，避免后台 HTML/JSON 被边缘存储；页面规则仍建议保留。见 [部署常见问题](../faq/deploy.md#cloudflare-缓存了后台或后台-api)。

:::

::: code-tabs

@tab Http

```nginx
server {
  gzip on;
  gzip_min_length 1k;
  gzip_comp_level 9;
  gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
  gzip_vary on;
  gzip_disable "MSIE [1-6]\.";
  listen 80 ;
  # 改为你的网址
  server_name example.com;
  proxy_buffers 8 32k;
  proxy_buffer_size 64k;

  location / {
    # 改为容器的 PORT
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
  }
}
```

@tab Https

```nginx
server {
  listen 80;
  # 改为你的网址
  server_name example.com;
  # 重定向为 https
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  # 改为你的网址
  server_name example.com;
  # 证书的公私钥
  ssl_certificate /path/to/public.crt;
  ssl_certificate_key /path/to/private.key;

  location / {
    # 改为容器的 PORT
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
  }
}
```

:::
