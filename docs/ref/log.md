---
title: 日志
icon: blog
---

`VanBlog` 现在已上线登录日志，可以在后台日志管理中查看。

![日志管理](https://pic.mereith.com/img/aeeba490d260f60e57d584837c31ba3b.clipboard-2022-08-23.png)

所有日志在容器内的位置如下：

- access 日志： `/var/log/vanblog-access.log`
- caddy 运行日志: `/var/log/caddy.log`
- 前台构建器运行日志: `/var/log/vanblog-website.log`
- 审计日志（目前只有登录）日志: `/var/log/vanblog-event.log`
- API 服务器运行日志: `stdout`
