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
    proxy_set_header X-Real-IP $remote_addr;
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
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
  }
}
```

:::
