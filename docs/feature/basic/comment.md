---
title: 评论
---

`vanBlog` 内嵌了 [waline 评论系统](https://waline.js.org/)，你不需要任何额外的配置或额外部署，开箱即用。

评论系统默认开启，在后台 `站点管理/系统设置/站点配置/高级设置` 中可以控制评论系统的开关。

![](https://pic.mereith.com/img/4ab797b4096a953d9d27ebf6a4a2b0dc.clipboard-2022-08-25.png)

## 原理

在后端的 server 中内嵌了控制 `waline.js` 启动停止的服务，后台页面中暂时使用 `iframe` 内嵌 waline 管理页面，后续会考虑陆续替换成自己的评论实现。

![](https://pic.mereith.com/img/dd7792a91f5a3b945ee2b261b06f666a.clipboard-2022-08-25.png)
