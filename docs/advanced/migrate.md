---
title: 迁移助手
icon: code-compare
order: -1
---

VanBlog 内置了迁移助手，支持文章/草稿的批量导入导出，未来将支持更多迁移方式。

点击后台 `站点管理/系统设置/迁移助手`，点击相应按钮即可批量导入文章/草稿。

![迁移助手](https://pic.mereith.com/img/51476ad02bfdf0c84f88389d21faabdf.clipboard-2022-09-17.png)

## FrontMatter 映射

| 字段名称 | 映射到 VanBlog 中的字段 | 说明 |
| --- | --- | --- |
| title | 标题 | 如果没有的话会以文件名为标题 |
| tags | 标签 | 没有的话标签为空 |
| categories | 分类 | 会从中选择第一个包含在 VanBlog 系统中的分类，没有的话分类将为空 |
| category | 分类 | 如果该分类未包含在 VanBlog 系统中，分类将为空 |
| date | 创建日期 | 如果没有的话默认为当前时间 |
| hide | 是否隐藏文章 | 没有的话默认不隐藏 |
| hidden | 是否隐藏文章 | 没有的话默认不隐藏 |
| password | 是否加密/密码 | 如果有，则文章自动为加密，且该字段为密码 |
| top | 置顶优先级 | 默认为 0 |
| slug / pathname | 自定义路径名 | Hugo 的 slug，发布后地址为 `/post/<slug>`。未设置则用数字 id |
| url | 自定义路径名 | 仅识别单段路径或 `/post/<slug>` |

需要注意的是，如果未识别到分类信息，则新建文章分类为空。

## 从 Hugo 迁移固定链接

Hugo 站点常用 `permalinks.post = "/post/:slug"`。VanBlog **没有**对应的全局固定链接设置，而是按篇文章填写「自定义路径名 / slug」（字段名 `pathname`）。

- 默认地址是 `/post/<数字ID>`。
- 把自定义路径名填成旧 slug 后，前台即可用 `/post/<slug>` 打开同一篇文章，旧链接和 SEO 可以保留。
- 数字 ID 地址始终可用，不是二选一。
- 批量导入时，Front Matter 的 `slug` / `pathname` 会自动写入自定义路径名。没有 `slug` 字段、只靠文件名生成 URL 的文章，导入后请到「操作 → 修改信息」补上。

后台入口：新建文章、导入 Markdown、发布草稿，或文章「操作 → 修改信息」/ 编辑器「修改信息」。详见 [文章管理](../features/article.md) 与 [FAQ：从 Hugo 迁移固定链接](../faq/usage.md#从-hugo-迁移固定链接)。
