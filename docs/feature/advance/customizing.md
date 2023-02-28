---
title: 客制化（嵌入自定义 HTML、CSS、JS）
---

VanBlog 客制化，也就是可以在页面嵌入自己的 HTML、CSS、JS 片段。

具体在 `站点管理/系统设置/客制化` 选项卡：

![客制化](https://www.mereith.com/static/img/9489039722c6c97a5232fad790356d9c.clipboard-2022-09-02.png)

默认客制化功能是开启的，你也可以在布局设置中关闭它。这样即便设置了客制化相关的代码，也不会生效。

PS: 我很自豪地用了 vscode 同款的代码编辑器，带有代码自动补全哦。

## 自定义 CSS

自定义 CSS 的代码，会被插入到前台每个页面 `<head>` 中的 `<style>` 标签内。

下面是一些内置的选择器，可能对你有帮助（更多的就不列举了）：

| 选择器           | 作用组件           |
| ---------------- | ------------------ |
| `#nav`           | 导航栏             |
| `#nav-mobile`    | 移动端的抽屉导航栏 |
| `.markdown-body` | 文章主题内容       |
| `#post-card`     | 文章卡片           |
| `#author-card`   | 作者卡片           |
| `#toc-card`      | 目录卡片           |

## 自定义 Script

你可以写一些自定义的 `js` 代码，这些代码会被加载到前台每个页面布局组件的最下面的 `script` 标签内。

值得注意的是： **_自定义的代码将会在页面可交互前被加载_**，这意味着您想操作 DOM，需要这样：

```js
window.onload = () => {
  const el = document.querySelector("#nav");
};
```

## 自定义 HTML

自定义的 HTML 代码将被插入到每个前台页面布局组件的最下方。

## 有啥用？

可以实现很多好玩的功能，比如最近我发现了一个项目： [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget)

就完全可以通过客制化来自己加个小挂件。

![配置展示](https://www.mereith.com/static/img/d2964344217c8db07f80e3e9350495c3.clipboard-2022-09-02.png)

```html
<div id="sakana-widget" style="position: fixed;bottom: 20px;right:40px;"></div>
<script>
  function initSakanaWidget() {
    new SakanaWidget({ autoFit: true })
      .setState({ i: 0.001, d: 1 })
      .mount("#sakana-widget");
  }
</script>
<script
  async
  onload="initSakanaWidget()"
  src="https://cdn.jsdelivr.net/npm/sakana-widget@2.2.2/lib/sakana.min.js"
></script>
```

效果：

![设置效果](https://www.mereith.com/static/img/1490762740df7e864117dfd46a66470e.clipboard-2022-09-02.png)
