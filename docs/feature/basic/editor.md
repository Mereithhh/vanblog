---
title: 编辑器
---

`vanBlog` 后台内置了魔改的 [vditor](https://b3log.org/vditor/) 作为 `markdown` 编辑器：

![](https://pic.mereith.com/img/6329b39f917d12434fa2ed02465b3c29.clipboard-2022-08-15.png)

支持多种编辑模式、一键上传剪切板图片到图床、一键插入 `more` 标记、快捷键、自动保存等功能。具体请查看 [vditor 官网](https://b3log.org/vditor/)

## 切换编辑模式

点击编辑器上方工具栏可切换编辑模式，默认为 `所见即所得` 模式。切换模式后，在当前设备将会保存该设置，刷新页面后不会丢失。

![](https://pic.mereith.com/img/f8ceae420b2b829a8e55447c9350530a.clipboard-2022-08-15.png)

## 一键插入 more 标记

`more` 标记是下面代码的简写，会被用来分割博客前台预览卡片中`阅读全文`之前的内容。

```html
<!-- more -->
```

![](https://pic.mereith.com/img/b613474a616f7e2b714735cb79aeff6a.clipboard-2022-08-15.png)

你可以点击工具栏第一个按钮快速在当前焦点插入 more 标记。

![](https://pic.mereith.com/img/d4b6837b20d6a6eb68193ae9b3f88c91.clipboard-2022-08-23.png)

## 上传到图床

编辑器支持两种方式上传到图床：剪切板快捷上传、从文件上传。点击编辑器工具栏按钮后，后在当前焦点处插入上传后的图片并复制图片链接到剪切板，如果没有焦点就会上传到最上面。

![](https://pic.mereith.com/img/46a028dc164de913c64a1f158f09b292.clipboard-2022-08-15.png)

## 自动保存

如果当前编辑的是 `草稿`，那当编辑器失去焦点的时候将会自动保存。

## 在编辑器复制后格式错乱

默认粘贴的格式可能带有一些额外信息，你可以鼠标右键选择复制为纯文本，或者使用快捷键 `ctrl+shift+v` 。

![](https://pic.mereith.com/img/88b29bad4ad0ef7d6e411e43f80ec1bc.clipboard-2022-08-22.png)

## Markdown 语法速查

> [Markdown 使用指南 - 基础语法](https://ld246.com/article/1583129520165)
>
> [Markdown 使用指南 - 语法速查手册](https://ld246.com/article/1583308420519)
>
> [Markdown 使用指南 - 扩展语法](https://ld246.com/article/1583305480675)

## 快捷键

> [Vditor 快捷键](https://ld246.com/article/1582778815353)
