---
title: 访客统计
---

`vanBlog` 内置了访客统计，开箱即用。

具体而言，`vanBlog` 会统计每个页面的独立访客数和访问量：

- `访客数` 以浏览器内缓存(localStorage)的唯一标识符为衡量标准计算独立访客的数量。
- `访问量` 以每一次页面的访问及跳转为衡量标准计算的访问数量。就是每个页面的访问人次。

但实际上，`vanBlog` 记录的信息远不止如此，它还会记录最近访问的文章、最近访问的时间。每天、每个路径下访问的数量和独立访客的数量。。。

具体的数据可以在后台的`分析概览` 中的`数据概览` 和 `访客统计` 两个 `tab` 中看到。

![](https://pic.mereith.com/img/3614afa8057c2fb0c078c62cad4e89b1.clipboard-2022-09-23.png)

![](https://pic.mereith.com/img/067952d6fa53f62b10174690ed3b269a.clipboard-2022-08-16.png)

## 前台

在前台，你可以在文章卡片看到每篇文章的访问量：

![](https://pic.mereith.com/img/3c2539ad7586a5a73a68e8cfb58e0957.clipboard-2022-08-16.png)

以及在页脚处，你可以看到全站的访客数和访问量：

![](https://pic.mereith.com/img/35aa485d737c99ef73505a8ec3a5e2f9.clipboard-2022-08-16.png)

## 进阶分析

如果你不满足于内置的分析，那你可以选择开启 `google analytics` 和 `百度统计`。

### 开启 GA(google analytics)

访问 [google analytics](https://analytics.google.com/analytics/web) 官网，并新建数据源，设置好之后把 ID 填写到 `站点设置/站点配置/高级设置` 中的 `Google Analysis ID` 上即可。

国内的话用没问题，但是看报告需要特定手段。

设置后无需重启，直接生效。

### 开启百度统计

访问 [百度统计](https://tongji.baidu.com/web5/welcome/login) 官网，并新建站点，设置好之后把 ID 填写到 `站点设置/站点配置/高级设置` 中的 `百度分析 ID` 中即可。

设置后无需重启，直接生效。
![](https://pic.mereith.com/img/add80e699b1de58fa55dc8f435077dc4.clipboard-2022-08-16.png)

## 屏蔽本设备的访客记录

内置的访客统计可以屏蔽掉自己的访问记录，首先访问你的博客页面，然后打开浏览器的控制台输入：

```js
window.localStorage.setItem("noViewer", true);
```

然后本设备就不会被记录访客了，但是页面底部的站点访问量也会没得显示。
