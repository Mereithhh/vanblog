---
title: 备份与迁移
icon: retweet
---

以下是备份或迁移 VanBlog 的方法。

<!-- more -->

:::: tabs#deploy

@tab 脚本部署时

迁移 `/var/vanblog` 目录到新机器，然后运行脚本重启服务即可。

```bash
# 执行一键脚本自动打包备份文件
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh backup
# 复制备份文件到新机器后，再次执行一键脚本恢复备份即可
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh restore
```

@tab docker 手动部署时

`docker` 部署的 VanBlog 所有的状态都存储在持久化目录中，所以只需要备份/迁移持久化目录。

将映射到宿主机的持久化目录进行备份或迁移到新机器上即可。

::: tip

迁移映射的目录到新机器的对应目录后，再用一模一样的 `docker-compose` 启动就好了。

:::

::::

## 更多

VanBlog 后台内置有 [导入导出](../advanced/backup.md) 功能，可以通过此功能实现备份。但当前有一些局限：

- 无法备份内置图床的数据。
- 无法备份自定义文件夹页面点数据。

后面会逐步优化，改善这点。
