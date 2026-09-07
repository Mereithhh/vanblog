---
title: 自定义常见问题
icon: wand-magic-sparkles
order: 4
---

## 自定义站点

你可以通过后台面板中的站点配置自由设置很多功能，详见 [站点配置](../reference/config.md)。

## 可以自定义样式吗？

可以！请参考 [定制化功能](../advanced/customizing.md)

## 如何接入 Umami（或类似统计）？

没有单独的 Umami 配置项。到 **站点管理 / 系统设置 / 定制化**，在「自定义 HTML (head)」粘贴 Umami 官方 `<script defer src="…" data-website-id="…">` 即可。详见 [定制化](../advanced/customizing.md#接入-umami-等第三方统计)。Google Analytics 的 `G-XXXXXXXXX` 仍填在站点配置高级设置里，见 [FAQ](./usage.md#配置了-google-analytics-但谷歌显示尚未收到数据)。

## 自定义页面

现在已经可以自定义页面了！请参考 [自定义页面](../advanced/custom-page.md)。

自定义页面只托管**静态 HTML/CSS/JS**，访问地址是 `/c/<路径>/`（路径在后台填 `/uptime` 时即 `/c/uptime/`）。多文件页面的入口必须是**根目录的 `index.html`**。

把 [uptime-status](https://github.com/yb/uptime-status) 这类 React 打包 zip 解压上传后「打开无效」，通常不是上传坏了：官方 zip 的 JS/CSS 写成了站点根路径 `/static/js/...`，浏览器会去博客图床目录找文件，页面白屏。把 `index.html` 里的 `/static/...` 改成 `./static/...`，或构建时设置 `homepage` / `base` 为 `/c/uptime/`。需要后端或必须占根路径时，请用 [反代](../reference/reverse-proxy.md) 旁挂，而不是自定义页面。详见 [自定义页面 → 为什么把 uptime-status 一类项目丢进去会打不开](../advanced/custom-page.md#为什么把-uptime-status-一类项目丢进去会打不开)。

