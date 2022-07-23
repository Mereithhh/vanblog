---
title: 站点配置
index: false
icon: setting
---

`vanBlog` 可以配置一系列的站点配置项，具体可在 `/admin/site?tab=siteInfo` 路径下查看。

比较特殊的几个稍微说明一下：

## WaLine 服务端 Url

这个配置是对接`评论系统`的，目前还没实现自己的评论系统，采用的是 [waline](https://waline.js.org/)。

如果你需要评论，搭建了 `waline` 后写上其网址就可以了。留空的话默认不启用评论功能。

## Google Analysis ID

[Google Analysis](https://analytics.google.com/analytics/web/#/)的 ID，用来统计网站相关数据。看报告需要翻墙。留空则不启用。

## Baidu 分析 ID

[百度统计](https://tongji.baidu.com/)的 ID，用来统计网站相关的流量等数据。留空则不启用。

## 网站 Url

站点部署后的网址，会用来生成某些页面链接。

## xxxx(黑暗模式)

切换黑暗模式后会俏皮的切换一下。
