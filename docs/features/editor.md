---
title: 编辑器
icon: keyboard
order: 3
---

VanBlog 后台内置了 [bytemd](https://github.com/bytedance/bytemd)（掘金同款） 作为 `Markdown` 编辑器：

![编辑器](https://www.mereith.com/static/img/e0ce4ddda865c9b7827983a219468599.clipboard-2022-09-06.png)

编辑器右下角的「字数」按中文字符、英文单词统计（与 Obsidian 一类编辑器接近），站点总字数是已发布文章这一数字的加总，不会按 UTF-8 字节放大。

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

  文章里的 mermaid 代码块会在预览区和前台渲染为图表。站点（或后台预览）为暗色时，图表使用 mermaid 暗色主题，避免浅色流程图贴在深色底上看不清。后台分栏预览时，左侧改字不会再因为 mermaid 重绘而抛异常；带 `style` / `#rrggbb` 颜色或中文标签的流程图也可以继续输入，光标、选区和按键不受影响。普通围栏代码块（非 mermaid）会显示行号，与前台一致。

  ::: info 图表语法速查

  - [Mermaid 从入门到入土——Markdown 进阶语法](https://zhuanlan.zhihu.com/p/355997933)

  :::

- 上传图片到图床

  编辑器支持两种方式上传到图床：

  - 剪切板快捷上传
  - 从文件上传

  点击编辑器工具栏按钮后，后在当前焦点处插入上传后的图片并复制图片链接到剪切板，如果没有焦点就会上传到最上面。

  另外图床支持添加水印，可以在上传的时候自动添加文字水印。请参考：[分类管理](./tag.md#分类管理)

- 外链图片转存

  从 CSDN 等站点粘贴过来的 Markdown 常常带着别人的图床地址。工具栏的「外链图片转存」会扫描当前正文里的远程 `![...](http...)` 和 HTML `<img src>`，经现有图床上传管线下载到本站（本地或已配置的 OSS / picgo），再把链接改成新地址。需要你点一下才会改，保存文章时不会偷偷重写。

  相对路径、`data:` 图片，以及已经指向本站 `/static` 或图床记录里的地址会跳过。某张下载失败时保留原来的 URL，并提示失败列表。若后台开了「图片自动压缩」，转存也会按当前的 WebP / AVIF 设置处理。见 [图床](./image-storage.md#外链图片转存)。

  ![上传图片](https://pic.mereith.com/img/0a54a1e4fe8ac47cea8fa7aea89964ca.clipboard-2022-08-29.png)

- 标题锚点 / 前台目录

  文章里的 `## 标题` 会生成目录和锚点。前台目录与正文渲染出的 `h1`–`h6` 对齐：嵌套标题、行前最多三个空格的 ATX 标题、标题里的加粗/链接，只要正文里出现，目录也会列出。标题前后多出来的空格会被忽略，目录点击仍会跳到该标题。标题里的 `$...$` / `$$...$$` 会按正文同一套 KaTeX 显示，点击仍按未解析的标题原文跳转。截图较多时图片是懒加载的，点目录会等上方图片撑开后再跳到标题，而不是停在尚未加载完的位置。

  桌面端仍是文章右侧的固定目录。手机上除了文首目录，还有一个浮在「返回顶部」上方的目录按钮：点开后从右侧滑出同一份目录，点标题会跳转并收起抽屉。没有标题的文章不会出现这个按钮。

  后台编辑器右侧「目录」只用来在预览区跳标题。点目录、再点嵌套的 Markdown 标题后，左侧编辑区仍保持可见，不会出现只能整页刷新才能恢复的空白。前台目录少标题或点了跳不过去，见 [使用常见问题](../faq/usage.md#前台目录比后台编辑器大纲少标题)；标题里的 TeX 未解析见 [前台目录里的 TeX 公式未解析](../faq/usage.md#前台目录里的-tex-公式未解析)。

- GFM 脚注

  支持 Obsidian / GitHub 风格的脚注：正文写 `[^1]`，文末写 `[^1]: 说明`。前台点击脚注编号会滚到文末对应条目，条目里的返回链接会回到原文，不会新开一页。脚注区上方有分隔线。普通外链仍在新标签页打开。

- 在 Markdown 里写 HTML

  文章正文可以直接嵌入常见 HTML，前台和后台预览都会渲染，例如 `<u>下划线</u>`、`<font color="red">颜色</font>`、`<center>`、带 `style` 的 `span`/`div`，以及 Bilibili 一类的 `<iframe>`。Markdown 没有下划线语法时用 `<u>` 即可。

  `<script>`、`onclick` / `onerror` 等事件属性、以及 `javascript:` 链接会被消毒去掉，避免文章正文变成脚本入口。整站自定义脚本请用 [定制化](../advanced/customizing.md)，不要写在文章里。自定义页面的完整 HTML 仍走 [自定义页面](../advanced/custom-page.md)，与正文 sanitizer 无关。

- 一键插入 `more` 标记

  `more` 标记是下面代码的简写，会被用来分割文章摘要。

  ```md
  <!-- more -->
  ```

  你可以点击工具栏最后第一个按钮快速在当前焦点插入 more 标记。在 `<!-- more -->` 附近（包括和高亮块 `:::tip`、后面的 `----` / 标题之间）按回车只会插入空行，不会让后台编辑器白屏。

  ![一键插入 more 标记](https://pic.mereith.com/img/59550a500ed84dea504f897dbe12ed07.clipboard-2022-08-29.png)

  ![文章摘要](https://pic.mereith.com/img/b613474a616f7e2b714735cb79aeff6a.clipboard-2022-08-15.png)

  ::: note 文章摘要是博客前台预览卡片中`阅读全文`之前的内容。

  没有 `more` 标记时，前台会截取大约 50 个字符作为摘要。如果截断点落在 `[文字](网址)` 中间，以前会显示残缺 markdown、href 也不完整；现在会把这一条链接补全后再渲染。链接里有反引号、查询参数或括号时同样适用。仍建议在合适位置插入 `more` 标记。

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

点击右上角操作按钮，选择 `修改信息`，即可对当前编辑的 `文章/草稿` 的信息就行修改。标题、「自定义路径名 / slug」等输入框可用左右方向键移动光标，也可用退格键 / Delete 删字。从 Hugo 迁过来时，在「自定义路径名 / slug」填旧文章的 slug，发布地址即为 `/post/<slug>`（留空则用数字 id）。标签框支持一次粘贴多个标签（逗号 / 分号 / 换行分隔）。

![修改信息](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

### 保存快捷键

<kbd>Ctrl</kbd> + <kbd>S</kbd> 可以保存文章/草稿。保存和打开都需要有效的数字 ID；缺少 ID 时会提示错误，而不会用空内容覆盖原文。

## 偏好设置

编辑器现在支持偏好设置，未来将支持更多选项：

![偏好设置](https://www.mereith.com/static/img/52495adf0928d2034159a398cbc7e050.clipboard-2022-09-06.png)

![偏好设置](https://pic.mereith.com/img/83e5a9815d0538447ef2fa97fe9c875d.clipboard-2023-06-27.webp)

::: note

此设置保存在浏览器的 `LocalStorage` 中，切换设备需重新设置。

:::
