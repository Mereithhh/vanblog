---
title: FAQ
icon: question
---

### 如何部署到 CDN

设置 `VAN_BLOG_CDN_URL` 这个环境变量后，按部就班增加 CDN 即可。

原则上 CDN 只缓存 `/_next/static` 这个目录就够了。

### 我觉得太丑了||可以自定义样式吗？

暂时没有自定义 css，后面会加上。暂时你可以 fork 一下，自己改一下 `packages/website` 的代码。

### 如何安装 docker ?

可以用这个一键安装脚本:

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

### 图片加载不出来

可能是你没设置 `VAN_BLOG_ALLOW_DOMAINS` 这个环境变量。
请参考 [启动配置](/guide/env.md#环境变量)

<!-- ### 什么是 SSG / SSR

### 能解释一下增量渲染吗？

next.js 的 ISR 了解一下？开箱即用。 -->
