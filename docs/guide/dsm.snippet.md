首先安装 `Docker` 套件。

### 下载镜像

在 `Docker` 套件中点击 `映像/新增/从 URL 添加`:

![添加](https://pic.mereith.com/img/37e817403c5f6b3877780b41f99ea2e0.clipboard-2022-08-29.png)

填入地址为 `mereith/van-blog`：

![填写地址](https://pic.mereith.com/img/428cef523d23e2a5d2b19fcb59fb2bf0.clipboard-2022-08-29.png)

标签选择默认的 `latest` 即可：

![选择标签](https://pic.mereith.com/img/409c41cbe5ebf9d3be1630965b5a6e46.clipboard-2022-08-29.png)

仿照上面的增加 `mongo` 镜像，版本选择 `4.4.9` 的，如图所示（有些机器不支持 AVX，用最新的会报错）：

![添加 mongo 镜像](https://pic.mereith.com/img/acd15a0e47c3a28d78a78c9102a7593e.clipboard-2022-09-15.png)

完成后如图：

![添加结果](https://pic.mereith.com/img/94080b16a8305acbd1552ca3b31596bb.clipboard-2022-09-15.png)

### 创建容器

### 创建 mongoDB 容器

点击 `容器/新建` ，选中刚刚下载的 `mongo` 镜像。

容器名称设置为 `mongo`，其他的一路下一步就行。

如果不嫌麻烦，最后把数据存储映射一下：| 容器内目录 | 说明 | | ------------------------ | ----------------------------------------------------------- | | `/data/db` | 数据库的存储 |

![](https://pic.mereith.com/img/09ae5a657283b2485e72bde073bbc8d1.clipboard-2022-09-14.png)

![](https://pic.mereith.com/img/75f317abbeb193dbbb6f0c02647f0717.clipboard-2022-09-14.png)

完成后启动即可。

### 创建 VanBlog 容器

和上面一样，点击 `容器/新建` ，选中刚刚下载的 `mereith/van-blog:latest` 镜像，容器名称为 VanBlog。

![image.png](https://pic.mereith.com/img/6b237de9e368fbcda040c5eaa5aec363.image.png)

### 环境变量

点击 `高级设置/环境`，其他的都可忽略，但下表的环境变量需要设置/新加：

| 名称  | 值           |
| ----- | ------------ |
| EMAIL | 你自己的邮箱 |

::: info 参考

- 在 [参考 → 环境变量](../reference/env.md) 中所示设置好环境变量。

:::

### 链接

为了让 VanBlog 容器内可以访问之前创建的 `mongo` 容器，在 `高级设置/链接` 中添加链接到之前创建的 `mongo` 容器。

![image.png](https://pic.mereith.com/img/72794966c5ef678f61273967a2530940.image.png)

### 端口映射

然后点击下一步，进行端口映射，群晖不能用默认的 `80` 端口，所以可以映射成其他端口，比如 `8880`。

![image.png](https://pic.mereith.com/img/5e6a5d6f07af5455b8fd4f06763cf858.image.png)

### 存储空间映射

可以参考 [VanBlog 文档/环境变量配置](../reference//env.md) 中的目录映射部分进行映射。

其中图床数据的目录映射推荐做一下，不然重置后可能会让你的博客本地图床图片都失效。

| 容器内目录                 | 说明                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `/app/static`              | 图床中数据的存放路径，使用内置图床请务必映射好！            |
| `/var/log`                 | 日志的存放路径，包括 access 日志、 Caddy 日志和前台服务日志 |
| `/root/.config/caddy`      | Caddy 配置存储路径                                          |
| `/root/.local/share/caddy` | Caddy 证书存储路径                                          |

### 完成

然后点击完成即可：

![创建确认](https://pic.mereith.com/img/1e75d553be53f7cea173177035f23cd9.image.png)

### 错误排查

如果发生错误，可以在容器日志中查看报错原因。

### 后续

启动完毕后，请 [完成初始化](./init.md)。

::: warning

如果你想在公网访问，最好现在 [配置好反代](../reference/reverse-proxy.md)，用最终使用的 URL 来访问进行初始化，否则内置图床上传的图片链接可能会有问题。

:::
