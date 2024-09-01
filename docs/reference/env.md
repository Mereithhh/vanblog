---
title: 环境变量
icon: leaf
order: 2
---

VanBlog 启动时，会读取一些环境变量以配置自身。

| 名称 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `VAN_BLOG_DATABASE_URL` | 否 | mongoDB URL | `mongodb://mongo:27017/vanBlog?authSource=admin` |
| `VAN_BLOG_CDN_URL` | 否 | CDN 部署的地址，在开启之前请不要设置此项。此项会导致公共资源从此 URL 获取。 | `""` |
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
