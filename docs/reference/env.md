---
title: 环境变量
icon: leaf
order: 2
---

VanBlog 启动时，会读取一些环境变量以配置自身。

| 名称 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `VAN_BLOG_DATABASE_URL` | 否 | mongoDB URL。内嵌 Waline 会复用该连接串的主机与 `authSource`。Atlas 等 `*.mongodb.net` 主机在 URL 未写 `authSource` 时不再强制 `authSource=admin`。 | `mongodb://mongo:27017/vanBlog?authSource=admin` |
| `VAN_BLOG_CDN_URL` | 否 | 前台 Next.js 公共资源（`/_next/static` 下的 JS/CSS）的 CDN 前缀。**不是**文章配图或本地图床 `/static` 的地址。镜像构建时此项为空，容器启动时读取并生效。未配置 CDN 前请不要设置。 | `""` |
| `VAN_BLOG_WALINE_DB` | 否 | 内嵌评论系统的数据库名，默认为 waline | `""` |
| `EMAIL` | 否 | 用于自动申请 https 证书的邮箱 | `""` |

## 注意事项

::: tip

每次修改后，需要重启 VanBlog 服务 或重启 VanBlog Docker 容器方能生效。

:::

::: warning 警示

为避免特殊字符对 bash 的干扰，请务必将环境变量的值用双引号围起来!

如 `"https://example.com"`

:::
