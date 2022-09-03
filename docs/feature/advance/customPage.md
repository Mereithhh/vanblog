---
title: 自定义页面
---

`VanBlog` 支持自定义页面，但首先请您明确自己的需求。

## 自定义带有布局的页面

如果要自定义带有布局的页面，通俗的理解就是替换掉文章页面中文章卡片的内容。您可以通过以下操作实现：

- 新建文章，在文章内可直接写 html 代码
- 设置文章为隐藏
- 在后台布局设置中开启`通过 URL 访问隐藏文章`
- 在后台自定义导航栏中添加这篇文章
- 或者在客制化中，嵌入自己的代码把这篇文章的 URL 嵌入到合适的位置

## 完整的自定义页面

不带有已有布局，完全自定义的页面。

在后台的 `站点管理/系统设置/自定义页面` 中可以找到功能入口：

![](https://www.mereith.com/static/img/8daba878b7a557dd79648a0683e6d66e.clipboard-2022-09-03.png)

### 新建页面

您可以新建自定义页面：

![](https://www.mereith.com/static/img/0010276600a467c0ae810dfbdaac296f.clipboard-2022-09-03.png)

PS： 路径必须以 `/` 开头，实际的访问路径会在前面加上 `/custom`。比如我定义了自定义页面路径为 `/door`，实际我可以通过 `/custom/door` 来访问此页面。

### 编辑页面内容

创建完毕后，点击列表页的 `编辑内容` ，即可跳转到代码编辑器进行编辑：

![](https://www.mereith.com/static/img/8099987ddeba8f9ef3e281eaeff6cae4.clipboard-2022-09-03.png)

如图所示，虽然此自定义页面没有携带布局，但会随着前台主题改变背景颜色，想要阻止此行为，可以加上一个 `style` 标签：

```html
<style>
  html.dark {
    background-color: white !important;
  }
</style>
```

效果如图:

![](https://www.mereith.com/static/img/474d98141e1204979950997a673eeb4f.clipboard-2022-09-03.png)
