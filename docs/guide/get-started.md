---
title: 快速上手
icon: lightbulb
order: 1
---

欢迎使用 VanBlog ，只需几个步骤，你就可以在你的服务器搭建自己的博客服务了。

<!-- more -->

::: tip

目前 VanBlog 还在快速迭代中，如果后台出现升级提示，推荐进行升级。

:::

## 介绍

<!-- @include: @/info.snippet.md -->

## 配置要求

理论上 VanBlog 不需要很高的配置，实际上演示站不算数据库，资源的占用情况如图：

![资源占用](https://www.mereith.com/static/img/bd2a2c983aa92288106652294a892494.clipboard-2022-09-03.png)

不到 `400M` 的内存（有一部分还是静态页面缓存），启动时大概峰值占用处理器一个核心的 `30%`，其余时间基本不占用什么处理器资源。

但比较小的带宽可能会让页面加载变慢（第一次慢，后面的话有缓存加速就会快一些），如果带宽比较小的话可以尝试设置一下 [CDN](../faq/deploy.md#如何部署到-cdn)。

## 部署方式

:::: tabs#deploy

@tab 脚本

<!-- @include: ./script.snippet.md -->

@tab docker

<!-- @include: ./docker.snippet.md -->

@tab kubernetes

<!-- @include: ./kubernetes.snippet.md -->

@tab 宝塔面板

<!-- @include: ./bt-panel.snippet.md -->

@tab 群晖 NAS

<!-- @include: ./dsm.snippet.md -->

@tab 直接部署

<!-- @include: ./direct.snippet.md -->

::::
