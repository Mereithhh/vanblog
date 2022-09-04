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

## 升级方法

目前暂不支持热升级，需要手动关闭容器，切换新版镜像后重启。

```bash
# 切换到部署 vanblog 的目录下（docker-compose.yml)存放的路径下
# 关闭原有服务
sudo docker-compose down
# 删除原有镜像
sudo docker rmi mereith/van-blog:latest
# 重新拉取最新镜像
sudo docker pull mereith/van-blog:latest
# 重新启动服务
sudo docker-compose up -d
```

升级完成~

## 自动升级

推荐使用 [watchtower](https://github.com/containrrr/watchtower) 自动监控升级。

> 详情可以参考 [Watchtower - 自动更新 Docker 镜像与容器](https://www.jianshu.com/p/eefbc08d9dc8)

这里提供一个简单命令

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

有能力的同学可以记录一下无限重启的容器日志，提一个 issue 或者联系我，十分感谢！

PS：因为目前只有我一个人开发，所以很多情况测试覆盖不到。如给您造成困扰，十分抱歉！

## 如何回滚

您可以通过指定镜像的版本号来实现，比如您想回滚到 `v0.29.0`，那您可以修改编排中的：

`mereith/van-blog:latest` 为 `mereith/van-blog:v0.29.0` ，然后运行：

```bash
sudo docker-compose down && sudo docker-compose up -d
```
