---
title: 使用常见问题
icon: wrench
order: 2
---

## 后台编辑器主题颜色错乱

这是因为设置了浏览器主题颜色导致的，把浏览器主题颜色偏好设置成默认或者跟随切换就好了。

## 文章编辑器内容不对题

这是浏览器内实时缓存导致的，编辑器会实时保存内容到浏览器的 LocalStorage，这个标识符是以 文章 ID 为准的，如果你重装过或者迁移过，那么原来的文章 ID 和现在文章 ID 对应的内容是不同的，就会导致这个问题。

解决办法很简单：在后台编辑器右上角的下拉菜单中手动点击清理该篇文章的缓存即可。

## 图片（作者 logo）加载不出来

::: info 提示

VanBlog 自 `v0.42.0` 已舍弃 `VAN_BLOG_ALLOW_DOMAINS` 环境变量，如果出现这个问题，推荐升级到最新版本以解决问题。

- [升级指南](../guide/update.md)

:::

可能是没正确设置 `VAN_BLOG_ALLOW_DOMAINS` 这个环境变量导致的。

作者 logo 用了 next.js 的图片缓存技术，需要显式指明安全的域名。

比如用了 `xyx.com` 这个域名访问访问，那需要设置 `VAN_BLOG_ALLOW_DOMAINS` 为 `xyz.com`，比如用了 `localhost` 访问，那需要设置为 `localhost`，如果多个域名用英文逗号分隔，不支持通配符。

请参考 [启动配置](../reference/env.md#环境变量)

## 在编辑器复制后格式错乱

默认粘贴的格式可能带有一些额外信息，你可以鼠标右键选择复制为纯文本，或者使用快捷键 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>。

![粘贴示例](https://pic.mereith.com/img/88b29bad4ad0ef7d6e411e43f80ec1bc.clipboard-2022-08-22.png)

## 开启了 https 重定向后关不掉

现在有脚本可以一键重置 https 设置啦！

如果你是用的一件脚本安装的，那么重新加载一遍最新版脚本，在里面选择重置 https 设置即可。

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh
```

如果你是自己用 docker 部署的运行下面的命令即可：

```bash
docker exec -it <vanblog容器名> node /app/cli/resetHttps.js
```
