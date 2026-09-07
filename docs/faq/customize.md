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

现在已经可以自定义页面了！请参考 [自定义页面](../advanced/custom-page.md)
