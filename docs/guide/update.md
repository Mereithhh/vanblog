---
icon: update
title: 升级

order: -3
---

## 升级提示

目前 VanBlog 处于快速迭代期，如果后台出现新版本提醒，推荐进行升级。

![升级提醒](https://pic.mereith.com/img/e314ee92dd1ad9b5b6c0b814b014c247.clipboard-2022-08-22.png)

升级前建议在后台 `站点管理/系统设置/备份恢复` 点击导出全部数据进行备份。

![备份数据](https://pic.mereith.com/img/4eba8540c5a7a5ae41885289abf98514.clipboard-2022-08-15.png)

## 脚本一键升级

你可以直接运行安装脚本来升级 VanBlog，启动后请输入 6 并回车。

```bash
./vanblog.sh
```

![脚本一键升级](https://pic.mereith.com/img/fbbf5dde011f9dec13cdb25ad741765f.clipboard-2022-09-20.png)

::: warning 限制

使用一键脚本升级的前提是：**部署也是使用的一键脚本**

如果您不是通过一键脚本部署的，可以先在后台手动备份后，改为通过 [脚本部署](./docker.md#一键脚本部署)。

目前暂不支持热升级（后面会有的），需要手动关闭容器，切换新版镜像后重启。

:::

## Docker 升级

请切换到部署 VanBlog 的目录下（docker-compose.yaml 存放的路径下），然后运行下面的命令。

```bash
# 关闭原有服务
docker-compose down -v
# 删除原有镜像
docker rmi mereith/van-blog:latest
# 重新拉取最新镜像
docker pull mereith/van-blog:latest
# 重新启动服务
docker-compose up -d
```

::: note

其他部署方式升级步骤类似，如果你实在看不懂，你可以在后台导出数据备份一下（记得单独备份图片），然后删除所有的容器/镜像，按照安装教程重新部署一遍，如果发现数据丢了（不乱改编排的话一般丢不了），再导入数据也行。

后面有计划会做热升级（在后台点一下按钮自动就升级了），敬请期待。

:::

### 自动升级 Docker

推荐使用 [watchtower](https://github.com/containrrr/watchtower) 自动监控升级。在此给出一个简单指引。

1. 首先在用户目录下创建 `watchtower.list` 文件，里面用空格隔开写入需要监控自动更新的容器名
1. 运行下面的命令

   ```bash
   docker run -d \
       --name watchtower \
       --restart unless-stopped \
       -v /var/run/docker.sock:/var/run/docker.sock \
       containrrr/watchtower -c \
       $(cat ~/watchtower.list)
   ```

上方指引是否有效取决于你具体的运行环境，如果按照指引不能自动升级，请阅读下方参考文章了解相关知识自行处理。

::: info 教程

Watchtower 使用可参考 [Watchtower - 自动更新 Docker 镜像与容器](https://www.jianshu.com/p/eefbc08d9dc8)

:::

## 其他方式

### 群晖升级

群晖按照上面说的原理，如果想用图形化升级的话，备份后，先删除原有镜像和容器，再重新创建即可。

### 宝塔升级

宝塔的话，现在推荐用一键脚本部署，直接用脚本升级就行了。

如果想用图形化升级的话，备份后，先删除原有镜像和容器，再重新创建即可。

## 更多

::: tip 如何回滚

您可以通过指定镜像的版本号来实现，比如您想回滚到 `v0.29.0`，那您可以修改编排中的：

`mereith/van-blog:latest` 为 `mereith/van-blog:v0.29.0` ，然后运行：

```bash
docker-compose down -v && docker-compose up -d
```

:::

::: info 原理

流程：删除原有老版本镜像 -> 下载新版镜像 -> 删除老容器 -> 用新镜像起一个新容器。

在这个过程中因为数据已经映射到了本地文件系统，所以删除容器/镜像并不会丢失数据（容器或服务本身是无状态的）。

:::

::: info 更新日志

请前往 [更新日志](../ref/changelog.md)

:::

## 常见问题

1. 升级后访问文章地址时出现 404 错误。

   由于本质上 VanBlog 基于静态页面，升级后容器内不存在按照新版本生成的静态页面。

   容器每次启动时都会自动触发增量渲染，等待容器选软完成后，即可正常访问。

1. 升级后后台报错或持续加载

   请清空浏览器缓存再重新加载。大部分浏览器可以使用 <kbd>Ctrl</kbd> + <kbd>F5</kbd> 强制刷新以忽略缓存。

   ::: details 其他方案

   如果是 `Chrome` 浏览器，您可以按 `F12` 打开开发者工具。在网络选项卡中勾选`停用缓存`，然后再刷新页面即可（刷新时开发者工具窗口不要关），正常后记得取消勾选`停用缓存`。

   其他浏览器可以自行百度。

   ![Chrome 停用缓存](https://www.mereith.com/static/img/5efb32214a31c1003df5eeba217a5586.clipboard-2022-09-03.png)

   :::

1. 容器无限重启

   有时由于作者疏忽，新版本可能由于存在 Bug 引发致命错误导致无限重启，此时可以优先考虑版本回滚。

   有能力的同学可以记录一下无限重启的容器日志，提一个 [issue](https://github.com/Mereithhh/van-blog/issues/new/choose) 或者联系我，十分感谢！
