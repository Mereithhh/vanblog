---
icon: nginx
title: 反代

order: -3
---

:::info 注意

VanBlog 内置了 caddy，可以全自动申请 https 证书，如没有其他服务需要共存，是不建议再加一层反代的。

使用反向代理之前记得要按需修改默认的 80 端口号哦。如果你要反代，请不要开启 `https 自动重定向` (默认是关闭的)

另外很多人会被内置的 Caddy 搞蒙，你完全不用考虑什么 Caddy，你就当它不存在，把整个 VanBlog 当作一个整体，去反代映射出去的 http 端口就好了。

各位反代的同学，不要管什么 Caddy ，就当他不存在！VanBlog 是一个整体，反代你映射的 http 端口就好了！
:::

### nginx-proxy-manager

强烈推荐 [nginx-proxy-manager](https://nginxproxymanager.com/)这个项目！它可以帮你自动管理反代配置，并申请相应的 `https` 证书。

### caddy

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

### nginx

如果你还是想想用 nginx 的话，那好吧。安利一个 nginx 配置在线生成工具： [https://nginxconfig.io/](https://nginxconfig.io/)

::: warning 注意

- 宝塔面板用 nginx 反代，如果出现问题，可以去升级一下 nginx 版本，有可能会解决问题。
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
