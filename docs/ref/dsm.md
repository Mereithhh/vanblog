---
title: 群晖 NAS 部署
icon: router
---

## 群晖 NAS 部署

首先安装 `Docker` 套件。

### 下载镜像

在 `Docker` 套件中点击 `映像/新增/从 URL 添加`:

![](https://pic.mereith.com/img/37e817403c5f6b3877780b41f99ea2e0.clipboard-2022-08-29.png)

填入地址为 `mereith/van-blog`：

![](https://pic.mereith.com/img/428cef523d23e2a5d2b19fcb59fb2bf0.clipboard-2022-08-29.png)

标签选择默认的 `latest` 即可：

![](https://pic.mereith.com/img/409c41cbe5ebf9d3be1630965b5a6e46.clipboard-2022-08-29.png)

仿照上面的增加 `mongo` 镜像：

![](https://pic.mereith.com/img/8be728335a29ab01601f83964bd700ad.clipboard-2022-08-29.png)

完成后如图：

![](https://pic.mereith.com/img/ac3931557c05a689e808942a4784e97a.clipboard-2022-08-29.png)

### 创建容器

### 创建 mongoDB 容器

点击 `容器/新建` ，选中刚刚下载的 `mongo` 镜像。

容器名称设置为 `mongo`，其他的一路下一步就行。

![](https://pic.mereith.com/img/09ae5a657283b2485e72bde073bbc8d1.clipboard-2022-09-14.png)

![](https://pic.mereith.com/img/75f317abbeb193dbbb6f0c02647f0717.clipboard-2022-09-14.png)

完成后启动即可。

### 创建 vanblog 容器

和上面一样，点击 `容器/新建` ，选中刚刚下载的 `mereith/van-blog:latest` 镜像，容器名称为 `vanblog`。

![image.png](https://pic.mereith.com/img/6b237de9e368fbcda040c5eaa5aec363.image.png)

### 环境变量

点击`高级设置/环境`，其他的都可忽略，但下表的环境变量需要设置/新加：

| 名称                   | 值                                      |
| ---------------------- | --------------------------------------- |
| VAN_BLOG_DATABASE_URL  | mongodb://mongo:27017/vanBlog           |
| VAN_BLOG_JWT_SECRET    | 随机字符串（最好 32 位以上）            |
| EMAIL                  | 你自己的邮箱                            |
| VAN_BLOG_ALLOW_DOMAINS | 访问 vanblog 的域名，多个用英文逗号隔开 |

> 参考: [vanblog 文档/环境变量配置](/ref/env.md) 中所示设置好环境变量。

### 链接

为了让 `vanblog` 容器内可以访问之前创建的 `mongo` 容器，在 `高级设置/链接` 中添加链接到之前创建的 `mongo` 容器。

![image.png](https://pic.mereith.com/img/72794966c5ef678f61273967a2530940.image.png)

### 端口映射

然后点击下一步，进行端口映射，群晖不能用默认的 80 端口，所以可以映射成其他端口，比如 8880

![image.png](https://pic.mereith.com/img/5e6a5d6f07af5455b8fd4f06763cf858.image.png)

### 存储空间映射

如果想的话，可以参考 [vanblog 文档/环境变量配置](/ref/env.md) 中的目录映射部分酌情映射。

但其实不映射的话默认是有 `volume` 的，而且后台可以备份导出，所以不映射也 ok。

### 完成

然后点击完成即可：

![image.png](https://pic.mereith.com/img/1e75d553be53f7cea173177035f23cd9.image.png)

### 排错

如果发生错误，可以在容器日志中查看报错原因。

### 后续

容器启动后，你可以通过 `http://<ip>:<端口>/admin/init` 访问进行初始化。

但如果你想在公网访问，我的建议是配置好反代后用最终使用的 URL 来访问进行初始化，否则内置图床上传的图片链接可能会有问题。

> [FAQ](/ref/faq.md)
