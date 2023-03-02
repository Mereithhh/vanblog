你可以运行下方命令，通过脚本一键部署 VanBlog。

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

如果未来需要再次运行脚本，可直接运行：

```bash
./vanblog.sh
```

![脚本演示](https://pic.mereith.com/img/fbbf5dde011f9dec13cdb25ad741765f.clipboard-2022-09-20.png)

启动完毕后，请 [完成初始化](./init.md)。

::: tip

1. 只推荐在纯 Linux 环境下使用此脚本,宝塔面板也可以使用。脚本推出不久，未经过广泛测试，如有问题请反馈！
1. 如果你想在外部访问数据库，请参考 [常见问题](../faq/README.md) 中的 `如何从外部访问数据库`
1. 反代时只需要反代映射的 HTTP 端口，详见 [反代配置](../reference/reverse-proxy.md)。由于 VanBlog 是一个整体，无需考虑内部的 Caddy。

:::
