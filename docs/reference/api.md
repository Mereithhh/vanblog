---
title: API 参考
icon: plug
redirectFrom: /ref/api.html
---

目前还没写专门的 API 参考，但是可以用生成的 `swagger` 做为参考。其中 `public` 标签下的都是不需要鉴权的。

可以在后台侧边栏中点击关于，然后点击关于界面的 `API 文档` 来进入 API 文档页面：

![API 文档入口](https://pic.mereith.com/img/0b487fe87735562feff3825b040c5353.clipboard-2022-08-29.png)

由于分离式的设计，你完全可以把本项目当作无头 CMS 来使用。只用本项目的后端和 server，自己写前端，或者自己写一个 `hexo` 的渲染器。

（也许以后我会加上一些其他的渲染器支持，比如对接 `hexo` 和 `vuepress`）

::: note

- swagger 路径： `/swagger`
- 参考： [https://blog-demo.mereith.com/swagger](https://blog-demo.mereith.com/swagger)

:::

举个例子，你可以通过 `GET /api/public/article/:id` ，获取置顶文章的 JSON 内容。

你可以点击这个链接看一下效果： [https://blog-demo.mereith.com/api/public/article/28](https://blog-demo.mereith.com/api/public/article/28)

## 关于鉴权的接口

所有需要鉴权的接口是通过请求头中 `token` 字段鉴权的，可以复制登录后台后的请求头中的 `token` 来使用鉴权 API，有效期和登录过期时间相同，可通过后台中的高级设置调整过期时间。
