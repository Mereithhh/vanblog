---
title: 编辑器
---

::: info 公告
自 `v0.22.1` 起，`VanBlog` 切换为 [bytemd](https://github.com/bytedance/bytemd)（掘金同款编） 作为 Markdown 编辑器。因为老的编辑器有些臃肿，还有些小毛病。

虽然新的编辑器不支持即时预览模式，但比较稳定简洁，易于拓展。
:::
`vanBlog` 后台内置了 [bytemd](https://github.com/bytedance/bytemd)（掘金同款） 作为 `Markdown` 编辑器：

![](https://www.mereith.com/static/img/e0ce4ddda865c9b7827983a219468599.clipboard-2022-09-06.png)

支持数学公式和图表、支持一键上传剪切板图片到图床、一键插入 `more` 标记、快捷键、自动保存等功能。

更新：最近支持了自定义高亮块语法和 emoji 表情选择器。

## Emoji 表情

点击导航栏的表情按钮即可：

![](https://www.mereith.com/static/img/42353fbbc0660940e238c4da9b8017cf.clipboard-2022-09-08.png)

## 自定义高亮块语法

现在支持高亮块语法了，具体可以点击导航栏的按钮查看：

![](https://www.mereith.com/static/img/9880f893a308699193671ff3b74f246c.clipboard-2022-09-07.png)

## 一键插入 more 标记

`more` 标记是下面代码的简写，会被用来分割博客前台预览卡片中`阅读全文`之前的内容。

```html
<!-- more -->
```

![](https://pic.mereith.com/img/b613474a616f7e2b714735cb79aeff6a.clipboard-2022-08-15.png)

你可以点击工具栏最后第一个按钮快速在当前焦点插入 more 标记。

![](https://pic.mereith.com/img/59550a500ed84dea504f897dbe12ed07.clipboard-2022-08-29.png)

## 上传到图床

编辑器支持两种方式上传到图床：剪切板快捷上传、从文件上传。点击编辑器工具栏按钮后，后在当前焦点处插入上传后的图片并复制图片链接到剪切板，如果没有焦点就会上传到最上面。

另外图床支持添加水印，可以在上传的时候自动添加文字水印。请参考：[分类管理](/feature/basic/category.md)

![](https://pic.mereith.com/img/0a54a1e4fe8ac47cea8fa7aea89964ca.clipboard-2022-08-29.png)

## 自动实时保存

当编辑时，会自动实时保存内容到本地缓存，如果没有点击保存按钮就退出了编辑器，下次进入后会自动回复上次的状态。

![](https://pic.mereith.com/img/85fa1dc72226c92b7b176cc40690999d.clipboard-2022-08-31.png)

## 导入内容

点击右上角操作按钮，选择 `导入内容`，选中需要导入的 `Markdown` 文件即可。

![](https://pic.mereith.com/img/4218768fe6d1c8d69433bde3fd98c01b.clipboard-2022-08-30.png)

## 导出

点击右上角操作按钮，选择 `导出`，即可导出为 `Markdown` 文件，相关数据会自动放置到 `front-matter` 中。

![](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

## 修改信息

点击右上角操作按钮，选择 `修改信息`，即可对当前编辑的 `文章/草稿` 的信息就行修改。

![](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

## 语法速查、快捷键与帮助

点击编辑器帮助按钮会显示 Markdown 语法与快捷键信息：

![](https://pic.mereith.com/img/cabe5cdfddeedbd6e592f7aaea2f4afc.clipboard-2022-08-29.png)

## 图表和数学公式

> 图表语法速查 [Mermaid 从入门到入土——Markdown 进阶语法](https://zhuanlan.zhihu.com/p/355997933)
>
> 数学公式语法速查 [使用 Markdown 输出 LaTex 数学公式](https://zhuanlan.zhihu.com/p/59412540)

## 保存快捷键

`ctrl + s` 可以保存文章/草稿

## 偏好设置

编辑器现在支持偏好设置，未来将支持更多选项：

![](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

![](https://www.mereith.com/static/img/031c5d647a21e1f57efbceb615661486.clipboard-2022-09-06.png)

PS：此设置保存在浏览器的 `LocalStorage` 中，切换设备需重新设置。
