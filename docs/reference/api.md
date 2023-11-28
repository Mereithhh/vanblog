---
title: API 参考
icon: plug
order: 6
---

目前还没写专门的 API 参考，但是可以用生成的 `swagger` 做为参考。其中 `public` 标签下的都是不需要鉴权的。

## API 文档入口

你可以在后台的 `系统设置/Token 管理` 中点击 `API 文档` 进入此 Vanblog 对应的 API 文档。

![](https://pic.mereith.com/img/d78409dcfb170ea71289ac38d9430165.clipboard-2023-03-17.png)

::: note

- swagger 路径： `/swagger`
- 参考（demo 站的）： [https://blog-demo.mereith.com/swagger](https://blog-demo.mereith.com/swagger)

:::

举个例子，你可以通过 `GET /api/public/article/:id` ，获取置顶文章的 JSON 内容。

你可以点击这个链接看一下效果： [https://blog-demo.mereith.com/api/public/article/28](https://blog-demo.mereith.com/api/public/article/28)

## 鉴权

所有需要鉴权的接口是通过 `请求头` 中 `token` 字段鉴权的，你可以在后台的 `系统设置/Token 管理` 中进行管理。
