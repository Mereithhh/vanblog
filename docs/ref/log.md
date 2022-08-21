---
title: 日志
icon: blog
---

`VanBlog` 在未来几天后会上线操作日志和登录日志。但目前来说，只有服务运行日志和 `access` 日志。

他们的在容器内的位置如下：

> access 日志： /var/log/vanblog-access.log
> caddy 运行日志: /var/log/caddy.log
> 前台构建器运行日志: /var/log/vanblog-website.log
> API 服务器运行日志: stdout
