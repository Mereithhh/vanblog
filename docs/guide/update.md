---
title: 升级
icon: cloud-arrow-up
order: -3
---

## 升级提示

目前 VanBlog 处于快速迭代期，如果后台出现新版本提醒，推荐进行升级。

![升级提醒](https://pic.mereith.com/img/e314ee92dd1ad9b5b6c0b814b014c247.clipboard-2022-08-22.png)

升级前建议在后台 `站点管理/系统设置/备份恢复` 点击导出全部数据进行备份。

![备份数据](https://pic.mereith.com/img/4eba8540c5a7a5ae41885289abf98514.clipboard-2022-08-15.png)

:::: tabs#deploy

@tab 脚本

你可以直接运行安装脚本来升级 VanBlog，启动后请输入 6 并回车。

```bash
./vanblog.sh
```

![脚本一键升级](https://pic.mereith.com/img/fbbf5dde011f9dec13cdb25ad741765f.clipboard-2022-09-20.png)

::: warning 限制

使用一键脚本升级的前提是：**部署也是使用的一键脚本**

如果您不是通过一键脚本部署的，可以先在后台手动备份后，改为通过 [脚本部署](./get-started.md#一键脚本部署)。

目前暂不支持热升级（后面会有的），需要手动关闭容器，切换新版镜像后重启。

:::

@tab docker

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

@tab 宝塔面板

宝塔面板推荐用一键脚本部署，直接用脚本升级就行了。

如果想用图形化升级的话，备份后，先删除原有镜像和容器，再重新创建即可。

@tab 群晖 NAS

群晖 NAS 请参照 Dockers 升级。

如果想用图形化升级的话，备份后，先删除原有镜像和容器，再重新创建即可。

::::

## 更多

::: info 当前版本查看

VanBlog 会在前台和后台的最下方展示版本信息。

![前台版本信息](https://pic.mereith.com/img/720d4503f7ca23cfb035061d0927b088.clipboard-2022-08-16.png)

![后台版本信息](https://pic.mereith.com/img/0f97b214de4965f69db68b935d993f07.clipboard-2022-08-16.png)

:::

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

## 常见问题

- 详见 [升级常见问题](../faq/update.md)。
