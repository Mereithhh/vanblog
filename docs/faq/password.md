---
title: 忘记密码
icon: question
---

VanBlog 支持忘记密码恢复，在登录页面点击`忘记密码`，输入正确的恢复密钥即可重置超级管理员用户。

![查看看恢复密钥](https://pic.mereith.com/img/471a81dc548ad543814a6bbf7315ccf1.clipboard-2022-09-20.png)

## 恢复密钥获取方式

### 1.容器运行日志

您可以在容器运行日志中看到恢复密钥，每次 VanBlog 启动或老密钥被使用都会重新生成恢复密钥并打印在运行日志中：

![查看日志](https://pic.mereith.com/img/471a81dc548ad543814a6bbf7315ccf1.clipboard-2022-09-20.png)

查看日志命令： `docker logs -f vanblog_vanblog_1`

### 2.通过文件查看

在您映射的日志目录中存在一个 `restore.key` 的文件，里面就是恢复密钥。

### 3.通过命令查看

您可以在服务器执行以下命令来查看恢复密钥。

```bash
docker exec vanblog_vanblog_1 cat /var/log/restore.key
```
