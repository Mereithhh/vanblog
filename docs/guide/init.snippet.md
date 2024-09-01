部署 VanBlog 后，请使用浏览器打开 `http://<你的域名>/admin/init`，并按照指引完成初始化。具体设置项可以参考 [站点配置](/features/config.md)。

你也可以直接访问博客地址，并点击导航栏右上角管理员按钮进入后台初始化页面。

::: tip

如果你直接使用默认的 80 和 443 端口，并且不打算套反代，

直接访问 `https://<你的域名>/admin/init`，VanBlog 会自动为你访问的域名签发证书，并开启 HTTPS。

这个过程可能会比较慢，取决于域名解析验证的时长。

具体请参考 [HTTPS](/advanced/https.md)。

如果需要套反向代理，请参考 [反代](/reference/reverse-proxy.md)。

:::
