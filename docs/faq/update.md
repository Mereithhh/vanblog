---
title: 升级常见问题
icon: cloud-arrow-up
order: 3
---

## 一键脚本更新显示成功但仍是旧版本

旧版 `./vanblog.sh` 选项 6 会在容器还在跑时 `docker rmi`，失败后仍继续 `pull` / `up`，并打印「VanBlog 更新并重启成功」。中国镜像的 `latest` 也可能停在 v0.53.0，所以后台看起来像更新成功，版本还是旧的（[#421](https://github.com/Mereithhh/vanblog/issues/421)、[#404](https://github.com/Mereithhh/vanblog/issues/404)）。

请先更新到最新脚本。菜单 **6. 更新** 或 `./vanblog.sh update` 会先自更新脚本，再用新脚本停容器、拉取并启动；只删已经没人用的旧镜像，并且只有运行中的 vanblog 镜像/版本确实前进才提示成功；否则报错并以非 0 退出。只想刷新脚本、不更新服务时，仍用选项 20 / `./vanblog.sh update_script`。若编排里是阿里云 `latest`，更新时会改成 `mereith/van-blog:latest`。

## 如何回滚

您可以通过指定镜像的版本号来实现，比如您想回滚到 `v0.29.0`，那您可以修改编排中的：

`mereith/van-blog:latest` 为 `mereith/van-blog:v0.29.0` ，然后运行：

```bash
docker-compose down -v && docker-compose up -d
```

## docker 镜像拉取慢

您可以 [设置 docker 镜像加速器](https://www.runoob.com/docker/docker-mirror-acceleration.html)。

## 升级后访问文章地址时出现 404 错误

由于本质上 VanBlog 基于静态页面，升级后容器内不存在按照新版本生成的静态页面。

容器每次启动时都会自动触发增量渲染，等待容器选软完成后，即可正常访问。

## 升级后后台报错或持续加载

请清空浏览器缓存再重新加载。大部分浏览器可以使用 <kbd>Ctrl</kbd> + <kbd>F5</kbd> 强制刷新以忽略缓存。

::: details 其他方案

如果是 `Chrome` 浏览器，您可以按 `F12` 打开开发者工具。在网络选项卡中勾选`停用缓存`，然后再刷新页面即可（刷新时开发者工具窗口不要关），正常后记得取消勾选`停用缓存`。

其他浏览器可以自行百度。

![Chrome 停用缓存](https://www.mereith.com/static/img/5efb32214a31c1003df5eeba217a5586.clipboard-2022-09-03.png)

:::

## 容器无限重启

有时由于作者疏忽，新版本可能由于存在 Bug 引发致命错误导致无限重启，此时可以优先考虑版本回滚。

有能力的同学可以记录一下无限重启的容器日志，提一个 [issue](https://github.com/Mereithhh/van-blog/issues/new/choose) 或者直接联系作者，十分感谢！
