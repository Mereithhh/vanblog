---
title: 文章管理
icon: pen-to-square
order: 1
redirectFrom: /feature/basic/article.html
---

## 文章管理

在文章管理页面下，你可以对文章进行管理，包括编辑、查看、删除、导出等。

![文章管理](https://pic.mereith.com/img/fa30658aba8173cda4be40a3df34008a.clipboard-2022-08-30.png)

问了精确找到需要的文章，你可以使用多种条件进行查询：

![文章搜索](https://pic.mereith.com/img/acc7dd7093ac0110cdffdb5d11e226df.clipboard-2022-08-15.png)

<!-- more -->

## 创建新文章

你可以点击 `新建文章` 按钮创建新文章。

::: warning 使用草稿

由于内置的增量渲染，新建的文章会**马上展示在前台页面**，所以更推荐的做法是 [先创建一个*草稿*](./draft.md#创建草稿)，然后再发布这个草稿。

:::

新建文章包含以下选项：

![新建文章](https://pic.mereith.com/img/c10e25ee028e3a7cd5306940ca146e80.clipboard-2023-02-27.png)

点击确定后，则以该表单为数据进行文章创建。

### 默认值

- 作者

  默认为登录者本人，下拉框内的选择范围包括 _所有的协作者的昵称_ 以及后台站点设置中的 _作者名称_。

- 自定义路径名

  文章发布后的路径将为 `/post/[自定义路径名]`，如果未设置则使用文章 id 作为路径名。

  ::: tip

  如果将自定义路径名设置成 `如何部署VanBlog`，发布后即可通过 `/post/如何部署VanBlog` 来访问。

  :::

- 置顶优先级：数字，留空或者为 0 表示不顶置。

  置顶文章默认按时间倒序倒序，优先级高的的会置顶在前，

- 标签

  每篇文章可以有多个标签，用于索引文章。

  标签不需要提前创建，你可以在需要标签的表单看到所有的标签或者创建新的标签：

  ![设置标签](https://pic.mereith.com/img/f96db83327831a83b5eb7b010be0f431.clipboard-2022-08-15.png)

- 分类

  选择分类前需要创建分类，具体请参考[分类管理](./tag.md#分类管理)

- 是否加密 & 密码

  选中是否加密并设置好密码之后，前台的文章将被隐藏，需要输入密码之后才能看到内容。密码会在后端验证，并只有匹配时才会把文章数据返回前端。

  ![文章列表](https://pic.mereith.com/img/a694826dd1a45976cc652087640c41c1.clipboard-2022-08-16.png)

  ![文章详情](https://pic.mereith.com/img/fad60a38e0d6819bfe6089108fe4142a.clipboard-2022-08-16.png)

- 是否隐藏

  选择隐藏后，前台将不会该显示文章的所有信息，该文章也不会计入总字数、标签、分类数量统计或者出现在时间线界面。但后台将正常显示该文章，并可以取消隐藏状态。

## 导入文章

你可以点击 `导入` 按钮导入 Markdown 文件来创建文章，暂不支持其他类型的文件。

![导入 Markdown](https://pic.mereith.com/img/537490f086ff26ab0b339bd68f7f9016.clipboard-2022-08-29.png)

其中，Markdown 文件的 [Front Matter](https://hexo.bootcss.com/docs/front-matter.html) 将会被自动解析成 VanBlog 的字段并展示在弹出的确认表单中，具体而言：

| 字段名称   | 映射到 VanBlog 中的字段 | 说明                                              |
| ---------- | ----------------------- | ------------------------------------------------- |
| title      | 标题                    | 默认使用文件名                                    |
| tags       | 标签                    | 默认为空                                          |
| categories | 分类                    | 会选择第一个包含在 Vanblog 系统中的分类，否则为空 |
| category   | 分类                    | 会选择第一个包含在 Vanblog 系统中的分类，否则为空 |
| date       | 创建日期                | 如果默认为当前时间                                |
| hide       | 是否隐藏文章            | 默认不隐藏                                        |
| hidden     | 是否隐藏文章            | 默认不隐藏                                        |
| password   | 是否加密/密码           | 如果有，则文章自动为加密，且该字段为密码          |
| top        | 置顶优先级              | 默认为 0                                          |

选择文件后，会弹出确认窗口，您可以在这里继续编辑或修改信息：

![信息确认](https://pic.mereith.com/img/1f0d74ef0ac87dd8f4b6e3e65b84bf84.clipboard-2022-08-29.png)

## 编辑文章

在文章页面的表格点击编辑按钮，即可跳转到编辑器编辑文章。

![文章编辑](https://pic.mereith.com/img/577da489715c94c183247ba63887aac5.clipboard-2022-08-30.png)

如需修改文章信息，点击 `操作/修改信息` 按钮即可。

::: tip 自动实时保存

编辑文章时会自动实时保存内容到本地缓存。

即使没有点击保存按钮就退出了编辑器，下次进入后也会自动恢复上次的状态。

![自动保存](https://pic.mereith.com/img/85fa1dc72226c92b7b176cc40690999d.clipboard-2022-08-31.png)

:::

## 修改文章信息

可点击文章表格操作栏下拉菜单中的修改信息进行修改：

!修改文章信息[](https://pic.mereith.com/img/fc6d04c1ab31ab97a53c96d11be87515.clipboard-2022-08-30.png)

或者也可以在文章页面的表格点击编辑按钮，即可跳转到编辑器编辑文章，然后点击右上角的 `修改信息` 按钮进行修改。

## 导出文章

你可以在文章管理页面操作栏下拉菜单中点击`导出`来导出文章，或者通过在编辑器中的导出按钮来导出文章。

导出时会自动映射信息到 Markdown 文件的 FrontMatter 中。

## 删除文章

你可以选择删除某篇文章，删除后原则上不可恢复。

::: note 实际上只是软删除，但没有误删恢复的功能，如果真有恢复需求请联系作者或自行去数据库搜查
:::