---
title: 日志
icon: file-lines
order: 5
---

VanBlog 现在已上线登录日志、系统日志和流水线日志，可以在后台日志管理中查看。后台拉取这些记录走 `GET /api/admin/audit`（不再用会被广告拦截列表误杀的 `/api/admin/log`）。旧路径仍可用。

登录日志里的访客 IP：若请求带有 Cloudflare 的 `CF-Connecting-IP`（或常见的 `True-Client-IP`），会优先用它，而不是反代 / 边缘节点写在 `X-Real-IP`、`X-Forwarded-For` 里的地址。没有这些头时仍按原来的 `X-Real-IP` → `X-Forwarded-For` → 套接字地址解析，并跳过内网和回环地址。

![日志管理](https://pic.mereith.com/img/a76cceb104214002da3c0c92d592bfff.clipboard-2023-06-26.webp)

所有日志在容器内的位置如下：

- access 日志： `/var/log/vanblog-access.log`
- caddy 运行日志: `/var/log/caddy.log`
- 前台构建器运行日志: `/var/log/vanblog-website.log`
- 审计日志（目前只有登录）日志: `/var/log/vanblog-event.log`
- API 服务器运行日志: `stdout`
