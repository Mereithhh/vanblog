---
title: 访客统计
icon: eye
---

VanBlog 内置了访客统计，开箱即用。

具体而言，VanBlog 会统计每个页面的独立访客数和访问量：

- 访客数： 以浏览器内缓存 (localStorage) 的唯一标识符为衡量标准计算独立访客的数量。
- 访问量： 以每一次页面的访问及跳转为衡量标准计算的访问数量。就是每个页面的访问人次。

<!-- more -->

## 博客展示

文章卡片包含每篇文章的访问量：

![文章访问量](https://pic.mereith.com/img/3c2539ad7586a5a73a68e8cfb58e0957.clipboard-2022-08-16.png)

站点页脚包含全站的访客数和访问量：

![站点访问量](https://pic.mereith.com/img/35aa485d737c99ef73505a8ec3a5e2f9.clipboard-2022-08-16.png)

## 访问分析

::: tip

VanBlog 记录的信息远不止访客数和访问量，它还会记录最近访问的文章、最近访问的时间。每天、每个路径下访问的数量和独立访客的数量。

:::

所有统计数据可在后台的 `分析概览` 中的 `数据概览` 和 `访客统计` 两个标签页中查看。

![数据概览](https://pic.mereith.com/img/3614afa8057c2fb0c078c62cad4e89b1.clipboard-2022-09-23.png)

![访客统计](https://pic.mereith.com/img/067952d6fa53f62b10174690ed3b269a.clipboard-2022-08-16.png)

### 进阶分析

如果你不满足于内置的分析，那你可以选择开启 `google analytics` 和 `百度统计`。

::: info 谷歌分析

访问 [Google Analytics](https://analytics.google.com/analytics/web) 官网，并新建数据源，设置好之后把 ID 填写到 `站点设置/站点配置/高级设置` 中的 `Google Analysis ID` 上即可，无需重启直接生效。

在大陆地区，谷歌统计上报不受影响，但是统计结果查看需要使用代理。

:::

::: info 百度统计

访问 [百度统计](https://tongji.baidu.com/web5/welcome/login) 官网，并新建站点，设置好之后把 ID 填写到 `站点设置/站点配置/高级设置` 中的 `百度分析 ID` 中即可，无需重启直接生效。

![ID 是什么](https://pic.mereith.com/img/add80e699b1de58fa55dc8f435077dc4.clipboard-2022-08-16.png)

:::

## 高级

::: tip 屏蔽本设备的访客记录

你可以屏蔽掉自己的访问记录。

请访问博客页面之后打开浏览器的控制台输入：

```js
window.localStorage.setItem('noViewer', true);
```

这样这台设备就不会加入任何的访问统计，同时页面底部的站点访问量将不可用。

:::
