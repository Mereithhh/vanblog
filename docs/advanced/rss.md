---
title: RSS
icon: rss
---

VanBlog 内置了 `RSS feed 生成器` ，开箱即用。

<!-- more -->

## 简介

你可以从站点的以下地址获取 RSS:

- `<your-site-url>/feed.xml`: RSS 2.0 格式
- `<your-site-url>/feed.json`: JSON 1.1 格式
- `<your-site-url>/atom.xml`: Atom 1.0 格式

导航栏右上角会默认出现 `RSS` 按钮。您可以在后台的 `布局设置` 中关闭此按钮。

VanBlog 包含后端 Markdown 渲染器，因此你可以在支持 HTML 内容的 RSS 阅读器上获得与网页相近的体验。

您可以用喜欢的阅读器来浏览和阅读 RSS：

![Feedbro Reader 浏览效果](https://www.mereith.com/static/img/bf84404095bdcf8c4a186e0bb1e48429.clipboard-2022-09-04.png)

![irreader 阅读效果](https://www.mereith.com/static/img/4b1ab8a59a5b6f0d28eef449db64cbfa.clipboard-2022-09-04.png)

::: note

RSS 订阅中的 HTML 暂不支持 mermaid 图表。(如果您有好的解决方案请联系我)

:::

## 信息生成

- 作者: RSS 订阅中的作者邮箱优先取自 `评论设置` 中的作者邮箱，其次是启动 VanBlog 时传递的 `EMAIL` 环境变量。

- 图标:

  订阅中的 `favicon` 和 `images` 属性的优先级如下：

  ![图标/图片优先级](https://www.mereith.com/static/img/27f6636bfe5a53cf51544ab8affd6961.clipboard-2022-09-04.png)

- 摘要

  订阅中每篇文章的 `description` 字段取自文章摘要（即每篇文章 `<!-- more -->` 前面的部分）。

  如果没有 `<!-- more -->`，则会提取全文。
