---
title: RSS
icon: rss
redirectFrom: /feature/advance/rss.html
---

VanBlog 内置了 `RSS feed 生成器` ，开箱即用。

订阅地址：

- `<your-site-url>/feed.xml`
- `<your-site-url>/feed.json`
- `<your-site-url>/atom.xml`

VanBlog 包含后端 Markdown 渲染器，所以你可以在 `RSS 阅读器` 上获得与网站本体尽可能相近的体验（在读取订阅源中 HTML 的情况下）。

::: note

RSS 订阅中的 HTML 暂不支持 mermaid 图表。(如果您有好的解决方案请联系我)

:::

`RSS feed` 中的 `HTML` 在 `Feedbro Reader` 拓展中的预览效果：

![浏览效果](https://www.mereith.com/static/img/bf84404095bdcf8c4a186e0bb1e48429.clipboard-2022-09-04.png)

您可以用喜欢的阅读器来阅读 RSS，比如我用的 `irreader` 中的效果：

![阅读效果](https://www.mereith.com/static/img/4b1ab8a59a5b6f0d28eef449db64cbfa.clipboard-2022-09-04.png)

## 前台按钮

默认在所有屏幕尺寸下，导航栏右上角均会出现 `RSS` 按钮。您可以在后台的 `布局设置` 中关闭此选择，关闭后前台所有位置都将不会显示 `RSS` 按钮。

## 注意

RSS 订阅中的作者邮箱优先取自 `评论设置` 中的作者邮箱，其次是启动 VanBlog 时传递的 `EMAIL` 环境变量。

订阅中的 `favicon` 和 `images` 属性的优先级如下：

![图标/图片优先级](https://www.mereith.com/static/img/27f6636bfe5a53cf51544ab8affd6961.clipboard-2022-09-04.png)

订阅中每篇文章的 `description` 字段取自每篇文章 `more 标记` 前面的部分 （`<!-- more -->`前面的部分，和前台阅读全文前的展示逻辑一样）。但如果没有 `more 标记`，则会包含整篇文章。
