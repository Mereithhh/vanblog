---
title: 编辑器
icon: keyboard
order: 3
---

VanBlog 后台内置了 [bytemd](https://github.com/bytedance/bytemd)（掘金同款） 作为 `Markdown` 编辑器：

![编辑器](https://www.mereith.com/static/img/e0ce4ddda865c9b7827983a219468599.clipboard-2022-09-06.png)

编辑器支持:

- Emoji

  ![Emoji 按钮](https://www.mereith.com/static/img/42353fbbc0660940e238c4da9b8017cf.clipboard-2022-09-08.png)

- 自定义容器

  ![自定义容器](https://www.mereith.com/static/img/9880f893a308699193671ff3b74f246c.clipboard-2022-09-07.png)

- 数学公式

  ::: info 数学公式语法速查

  - [使用 Markdown 输出 LaTex 数学公式](https://zhuanlan.zhihu.com/p/59412540)

  :::

- Mermaid 图表

  ::: info 图表语法速查

  - [Mermaid 从入门到入土——Markdown 进阶语法](https://zhuanlan.zhihu.com/p/355997933)

  :::

- 上传图片到图床

  编辑器支持两种方式上传到图床：

  - 剪切板快捷上传
  - 从文件上传

  点击编辑器工具栏按钮后，后在当前焦点处插入上传后的图片并复制图片链接到剪切板，如果没有焦点就会上传到最上面。

  另外图床支持添加水印，可以在上传的时候自动添加文字水印。请参考：[分类管理](./tag.md#分类管理)

  ![上传图片](https://pic.mereith.com/img/0a54a1e4fe8ac47cea8fa7aea89964ca.clipboard-2022-08-29.png)

- 一键插入 `more` 标记

  `more` 标记是下面代码的简写，会被用来分割文章摘要。

  ```md
  <!-- more -->
  ```

  你可以点击工具栏最后第一个按钮快速在当前焦点插入 more 标记。

  ![一键插入 more 标记](https://pic.mereith.com/img/59550a500ed84dea504f897dbe12ed07.clipboard-2022-08-29.png)

  ![文章摘要](https://pic.mereith.com/img/b613474a616f7e2b714735cb79aeff6a.clipboard-2022-08-15.png)

  ::: note 文章摘要是博客前台预览卡片中`阅读全文`之前的内容。

  :::

- 自动保存

  编辑文章时会自动实时保存内容到本地缓存，此功能默认关闭，可在编辑器右上角下拉菜单中的 `偏好设置` 中开启。

  即使没有点击保存按钮就退出了编辑器，下次进入后也会自动恢复上次的状态。

  ![自动保存](https://pic.mereith.com/img/85fa1dc72226c92b7b176cc40690999d.clipboard-2022-08-31.png)

![开启自动保存](https://pic.mereith.com/img/83e5a9815d0538447ef2fa97fe9c875d.clipboard-2023-06-27.webp)

- 快捷键

  点击编辑器帮助按钮会显示 Markdown 语法与快捷键信息：

  ![快捷键提示](https://pic.mereith.com/img/cabe5cdfddeedbd6e592f7aaea2f4afc.clipboard-2022-08-29.png)

## 更多功能

### 导入

点击右上角操作按钮，选择 `导入内容`，选中需要导入的 Markdown 文件即可。

![导入 Markdown](https://pic.mereith.com/img/4218768fe6d1c8d69433bde3fd98c01b.clipboard-2022-08-30.png)

### 导出

点击右上角操作按钮，选择 `导出`，即可导出为 Markdown 文件，相关数据会自动放置到 FrontMatter 中。

![导出 Markdown](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

### 修改信息

点击右上角操作按钮，选择 `修改信息`，即可对当前编辑的 `文章/草稿` 的信息就行修改。

![修改信息](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

### 保存快捷键

<kbd>Ctrl</kbd> + <kbd>S</kbd> 可以保存文章/草稿

## 偏好设置

编辑器现在支持偏好设置，未来将支持更多选项：

![偏好设置](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

![偏好设置](https://pic.mereith.com/img/83e5a9815d0538447ef2fa97fe9c875d.clipboard-2023-06-27.webp)

::: note

此设置保存在浏览器的 `LocalStorage` 中，切换设备需重新设置。

:::
