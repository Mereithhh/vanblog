---
title: 搜索引擎优化
icon: dumbbell
---

VanBlog 内置一些搜索引擎优化策略，开箱即用，无需任何配置。具体有：

## 前台均为静态页面

前台均为静态页面，首屏加载和源代码均包含了全部信息。

## robots.txt

默认屏蔽 `/api` 和 `/admin`

## sitemap

每次在后台更新数据时，会在几分钟内重新生成 `sitemap.xml`，具体而言包括所有页面的可见链接（不包括隐藏文章）。设置了自定义路径名的文章会以 `/post/<pathname>` 出现在 sitemap 中。

## 从其他博客迁移时保留旧 URL

VanBlog 没有 Hugo 那种站点级 `permalinks` 模板。按篇文章设置「自定义路径名 / slug」后，发布地址就是 `/post/<slug>`，默认则是 `/post/<数字ID>`。从 Hugo（`post = "/post/:slug"`）迁过来时，把旧 slug 填进去即可让搜索引擎已收录的链接继续打开。见 [从 Hugo 迁移固定链接](../faq/usage.md#从-hugo-迁移固定链接)。

## meta 标签

- 网站描述会作为 description 属性
- 会有 robots 的 meta 标签
- 文章页面和首页/列表页会有 keywords，具体是由当前页面文章的分类和标签经过去重后生成的

## a 标签

所有前台页面，能用 a 标签的都用了 a 标签，以方便爬取。

## 平台对接支持

vanblog 内置了对接 GA 和 百度统计的配置，如需对接其他的平台，可以很简单利用自定义 JS 的功能来实现。
