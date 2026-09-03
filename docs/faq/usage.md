---
title: 使用常见问题
icon: wrench
order: 2
---

## 自定义页面修改信息后刷新又变回去

在「站点管理 / 自定义页面」里点「修改信息」，接口返回 200，刷新后名称或路径仍是旧的。这是更新按新路径查找文档导致的，改路径时写不到原记录。已修复（[#453](https://github.com/Mereithhh/vanblog/issues/453)）。请升级到包含该修复的版本。

## 前台很快，后台却要转很久

后台每次打开都会请求 `/api/admin/meta`。这个接口过去会同步查询远程版本接口（`https://api.mereith.com/vanblog/version`）来提示更新；远程慢或不可达时，后台会被拖住大约 30 秒，前台不受影响。该问题已修复（[#343](https://github.com/Mereithhh/vanblog/issues/343)）：版本检查改为短超时 + 后台缓存，不再阻塞后台。请升级到包含该修复的版本。

## 文章里有 Mermaid 图表时编辑器无法输入或预览报错

含 mermaid 代码块的文章在后台打开后，编辑器可能无法点击或输入，或左侧一改字右侧即时预览就抛异常。这两个问题都已修复（[#477](https://github.com/Mereithhh/vanblog/issues/477)、[#424](https://github.com/Mereithhh/vanblog/issues/424)）。若仍使用 `v0.54.0` 及更早版本，请升级到包含该修复的版本。

临时办法：用开发者工具挡住预览区，或把窗口缩到只显示编辑区，即可继续改正文。

## 备份恢复后分类为空、首页没有文章

从旧机器后台导出全部数据、在新机器导入后，文章上可能仍显示分类名，但「分类管理」是空的，首页刷新也不出文章。该问题已修复（[#496](https://github.com/Mereithhh/vanblog/issues/496)、[#280](https://github.com/Mereithhh/vanblog/issues/280)）。请升级到包含该修复的版本后重新导入备份；导入完成后稍候刷新首页。

整机迁移更稳妥的方式仍是复制 Docker 持久化目录，见 [备份与迁移](../guide/backup.md)。

## 后台改文章后，数字 ID 的前台地址不更新

文章设置了自定义路径时，`/post/自定义路径` 会更新，但 `/post/数字ID`（搜索结果常跳到这里）可能仍是旧内容。这是按需 ISR 只刷新了自定义路径页导致的，已修复（[#356](https://github.com/Mereithhh/vanblog/issues/356)）。请升级到包含该修复的版本。

临时办法：在「系统设置 / 高级设置」里手动触发静态页面更新。

## 后台编辑器填写信息时方向键无法移动光标

在编辑器右上角「操作 → 修改信息」中填写标题等字段时，方向键无法移动光标。该问题已修复（[#470](https://github.com/Mereithhh/vanblog/issues/470)）。若仍使用 `v0.54.0` 及更早版本，请升级到包含该修复的版本。

## 后台编辑器主题颜色错乱

这是因为设置了浏览器主题颜色导致的，把浏览器主题颜色偏好设置成默认或者跟随切换就好了。

## 隔天打开草稿变成空白，但上传的图片还在

后台打开草稿或文章时，如果 URL 里的 `id` 缺失或不是数字，旧版本会把它 `Number()` 成 `NaN` 再去查 MongoDB，触发 `Cast to Number failed for value "NaN"`，编辑器拿不到正文就显示空白。图片在图床里，所以还能看到。该问题已修复（[#427](https://github.com/Mereithhh/vanblog/issues/427)）：非法 ID 会直接报错，不会再拿 `NaN` 去更新文档。请升级到包含该修复的版本。

若正文其实还在数据库里，从草稿列表重新点「编辑」进入即可。

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
