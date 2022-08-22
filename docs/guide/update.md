---
icon: update
title: 升级
copyright: false
order: -3
---

目前 `VanBlog` 处于快速迭代期，如果后台出现新版本提醒，推荐进行升级。

![](https://pic.mereith.com/img/e314ee92dd1ad9b5b6c0b814b014c247.clipboard-2022-08-22.png)

升级前建议在后台 `站点管理/备份恢复` 点击导出全部数据进行备份。

![](https://pic.mereith.com/img/4eba8540c5a7a5ae41885289abf98514.clipboard-2022-08-15.png)

## 升级方法

目前暂不支持热升级，需要手动关闭容器，切换新版镜像后重启。

```bash
# 切换到部署 vanblog 的目录下（docker-compose.yml)存放的路径下
# 关闭原有服务
docker-compose down
# 删除原有镜像
docker rmi registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest
# 重新拉取最新镜像
docker pull registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest
# 重新启动服务
docker-compose up -d
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

因为本质上我们是静态页面，升级后容器内是没有生成你专属的静态页面的。

你可以在页面上多点点，稍等一会增量渲染触发后就会重新生成你的静态页面了。
