---
title: 启动配置
icon: async
---

起容器时可以传递一系列的`环境变量`，修改后需要重启容器生效，具体含义如下：

## 环境变量

| 名称                     | 必填 | 说明                             | 默认值                                               |
| ------------------------ | ---- | -------------------------------- | ---------------------------------------------------- |
| VAN_BLOG_DATABASE_URL    | 是   | mongoDB URL                      | `mongodb://localhost:27017/vanBlog?authSource=admin` |
| VAN_BLOG_ALLOW_DOMAINS   | 否   | 允许的外部图片域名               | `""`                                                 |
| VAN_BLOG_JWT_SECRET      | 否   | 后端 JWT 密钥                    | `boynextdoor`                                        |
| VAN_BLOG_REVALIDATE_TIME | 否   | 增量渲染验证时间间隔(秒)         | `10`                                                 |
| VAN_BLOG_CDN_URL         | 否   | CDN 部署的 url，不用的话不写也行 | `""`                                                 |
| EMAIL                    | 否   | 用于自动申请 https 证书的邮箱    | `""`                                                 |

## 目录映射

| 容器内目录               | 说明                                                        |
| ------------------------ | ----------------------------------------------------------- |
| /app/static              | 图床中数据的存放路径，使用内置图床请务必映射好！            |
| /var/log                 | 日志的存放路径，包括 access 日志、 Caddy 日志和前台服务日志 |
| /root/.config/caddy      | caddy 配置存储路径                                          |
| /root/.local/share/caddy | caddy 证书存储路径                                          |

## 站点配置

请参考 ：[站点配置](/feature/basic/setting.md)
