---
icon: update
title: 升级
copyright: false
order: -3
---

目前 `VanBlog` 处于快速迭代期，如果后台出现新版本提醒，推荐进行升级。

![](https://pic.mereith.com/img/e314ee92dd1ad9b5b6c0b814b014c247.clipboard-2022-08-22.png)

升级前建议在后台 `站点管理/系统设置/备份恢复` 点击导出全部数据进行备份。

![](https://pic.mereith.com/img/4eba8540c5a7a5ae41885289abf98514.clipboard-2022-08-15.png)

## 一键脚本升级

::: info VanBlog
使用一键脚本升级的前提是：**部署也是使用的一键脚本**

如果您不是通过一键脚本部署的，可以先在后台手动备份后，改为通过脚本部署。
:::

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

![](https://pic.mereith.com/img/fbbf5dde011f9dec13cdb25ad741765f.clipboard-2022-09-20.png)

## 原理

目前暂不支持热升级（后面会有的），需要手动关闭容器，切换新版镜像后重启。

> 原理： 删除原有老版本镜像 -> 下载新版镜像 -> 删除老容器 -> 用新镜像起一个新容器。
>
> 在这个过程中因为数据已经映射到了本地文件系统，所以删除容器/镜像并不会丢失数据（容器或服务本身是无状态的）

## 步骤

```bash
# 切换到部署 vanblog 的目录下（docker-compose.yml)存放的路径下
# 关闭原有服务
docker-compose down -v
# 删除原有镜像
docker rmi mereith/van-blog:latest
# 重新拉取最新镜像
docker pull mereith/van-blog:latest
# 重新启动服务
docker-compose up -d
```

升级完成~

> 其他部署方式升级步骤类似，如果你实在看不懂，你可以在后台导出数据备份一下（记得单独备份图片），然后删除所有的容器/镜像，按照安装教程重新部署一遍，如果发现数据丢了（不乱改编排的话一般丢不了），再导入数据也行。。。
>
> 后面有计划会做热升级（在后台点一下按钮自动就升级了），敬请期待。

## 自动升级

推荐使用 [watchtower](https://github.com/containrrr/watchtower) 自动监控升级。

> 详情可以参考 [Watchtower - 自动更新 Docker 镜像与容器](https://www.jianshu.com/p/eefbc08d9dc8)

这里提供一个简单命令，具体是否成功取决于你具体的运行环境，如果你看不懂下面的命令且自动升级无效的话，建议仔细阅读上面的参考文章。

```bash
## 首先在家目录下创建 watchtower.list 文件，里面用空格隔开写入需要监控自动更新的容器名
## 然后运行下面的命令，即可监控新版本并按需升级。
docker run -d \
    --name watchtower \
    --restart unless-stopped \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower -c \
    $(cat ~/watchtower.list)
```

## 更新日志

请前往 [更新日志](/ref/changelog.md)

## 升级之后文章都没了

因为本质上我们是静态页面，升级后容器内是没有按照你的当前数据生成的静态页面的。

每次容器启动时都会自动触发增量渲染，等一会触发完成后就再打开就正常了。

## 更新后后台报错&一直加载中

您清空浏览器缓存再重新加载就好了，如果是 `Chrome` 浏览器，您可以按 `F12` 打开开发者工具。在网络选项卡中勾选`停用缓存`，然后再刷新页面即可（刷新时开发者工具窗口不要关），正常后记得取消勾选`停用缓存`。

其他浏览器可以自行百度。

![](https://www.mereith.com/static/img/5efb32214a31c1003df5eeba217a5586.clipboard-2022-09-03.png)

## 容器无限重启

有时候作者抽风或者由于奇怪的问题可能会发生容器无限重启现象，遇到这种问题您可以先参考下面进行版本回滚。（如果您不知道版本，可以去看更新日志）

有能力的同学可以记录一下无限重启的容器日志，提一个 [issue](https://github.com/Mereithhh/van-blog/issues/new/choose) 或者联系我，十分感谢！

PS：因为目前只有我一个人开发，所以很多情况测试覆盖不到。如给您造成困扰，十分抱歉！

## 如何回滚

您可以通过指定镜像的版本号来实现，比如您想回滚到 `v0.29.0`，那您可以修改编排中的：

`mereith/van-blog:latest` 为 `mereith/van-blog:v0.29.0` ，然后运行：

```bash
docker-compose down -v && docker-compose up -d
```

## 群晖升级

群晖按照上面说的原理，如果想用图形化升级的话，备份后，先删除原有镜像和容器，再重新创建即可。

## 宝塔升级

宝塔的话，现在推荐用一键脚本部署，直接用脚本升级就行了。

如果想用图形化升级的话，备份后，先删除原有镜像和容器，再重新创建即可。
