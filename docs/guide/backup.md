---
icon: linux
title: 备份与迁移
copyright: false
---

想要备份或迁移 VanBlog ，参考如下（方法还有很多，有效即可）。

## 备份/迁移持久化目录

因为 VanBlog 本质上是通过 `docker` 部署的，所以只要迁移映射到宿主机的持久化目录到新机器上就好啦！

这种方式最无感，因为 VanBlog 容器所有的状态都在持久化目录中了，迁移了它们，对于 VanBlog 服务来说，就是无感的；备份同理。

### 对于一键脚本部署

迁移 `/var/vanblog` 目录到新机器，然后用 `一键脚本重启服务` 就好了。

```bash
# 打包老机器的文件夹
tar czvf vanblog-backup.tgz /var/vanblog
# 复制到新机器即可，解压到 /var/vanblog 中后，运行脚本后，选择重启服务。
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

### 对于 docker-compose 部署

迁移映射的目录到新机器的对应目录，再用一模一样的 `docker-compose` 启动就好了。

## 导入导出功能

VanBlog 后台内置有 [导入导出](../feature/advance/backup.md)功能，可以通过此功能实现备份。但有一些局限：

- 无法备份内置图床的数据。
- 无法备份自定义文件夹页面点数据。

后面会逐步优化，改善这点。
