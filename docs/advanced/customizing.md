---
title: 定制化（嵌入自定义 HTML、CSS、JS）
icon: wand-magic-sparkles
---

VanBlog 通过定制化功能允许你在页面中嵌入自己的 HTML、CSS、JS 片段。

<!-- more -->

## 设置方法

使用 `站点管理/系统设置/定制化` 选项卡。

![定制化](https://www.mereith.com/static/img/9489039722c6c97a5232fad790356d9c.clipboard-2022-09-02.png)

定制化功能默认开启，你可以在布局设置中关闭它。这样即便设置了定制化相关的代码，也不会生效。

::: tip

定制化使用 VSCode 同款的代码编辑器，支持自动补全。

:::

## 自定义 HTML

自定义的 HTML 代码将被插入到每个前台页面布局组件的**最下方**。

## 自定义 CSS

自定义 CSS 的代码，会被插入到前台每个页面 `<head>` 中的 `<style>` 标签内。

::: tip 常见内置元素选择器

- `#nav` 导航栏
- `#nav-mobile` 移动端的抽屉导航栏
- `.markdown-body` 文章主题内容
- `#post-card` 文章卡片
- `#author-card` 作者卡片
- `#toc-card` 目录卡片

:::

## 自定义脚本

你可以写一些自定义的 `js` 代码，这些代码会被加载到前台每个页面布局组件的最下面的 `script` 标签内。

值得注意的是： **_自定义的代码将会在页面可交互前被加载_**，这意味着您想操作 DOM，需要这样：

```js
window.onload = () => {
  const el = document.querySelector('#nav');
};
```

## 使用演示

通过定制化，你可以实现很多有趣的功能，比如通过 [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget) 项目，你可以在博客中添加挂件:

在自定义 HTML 中加入如下代码:

```html
<div id="sakana-widget" style="position: fixed;bottom: 20px;right:40px;"></div>
<script>
  function initSakanaWidget() {
    new SakanaWidget({ autoFit: true }).setState({ i: 0.001, d: 1 }).mount('#sakana-widget');
  }
</script>
<script
  async
  onload="initSakanaWidget()"
  src="https://cdn.jsdelivr.net/npm/sakana-widget@2.2.2/lib/sakana.min.js"
></script>
```

你就可以得到一个挂件，最终效果如下。

![设置效果](https://www.mereith.com/static/img/1490762740df7e864117dfd46a66470e.clipboard-2022-09-02.png)
