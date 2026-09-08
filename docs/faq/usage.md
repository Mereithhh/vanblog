---
title: 使用常见问题
icon: wrench
order: 2
---

## 从 Hugo 迁移固定链接

Hugo 里常用 `permalinks.post = "/post/:slug"`。VanBlog **没有**全局固定链接模板，而是按篇设置「自定义路径名 / slug」（字段名 `pathname`）。

默认地址是 `/post/<数字ID>`。把自定义路径名填成旧文章的 slug 后，发布地址就是 `/post/<slug>`，搜索引擎已收录的旧链接可以继续打开。数字 ID 地址（`/post/123`）始终可用，两种地址指向同一篇。

在这些地方填写：

- 新建文章
- 导入 Markdown 的确认表单（Front Matter 的 `slug` / `pathname`，以及形如 `/post/my-slug` 的 `url`，会自动填入）
- 发布草稿
- 文章表格「操作 → 修改信息」，或编辑器右上角「修改信息」

没有 `slug` 字段、只靠文件名生成 URL 的文章，导入后请手动补上自定义路径名。VanBlog 不会解析 `/post/:year/:month/:title` 这类站点级规则。

见 [文章管理](../features/article.md) 与 [迁移助手](../advanced/migrate.md)。

## 如何修改首页每页展示多少篇文章

后台进入 **站点管理 / 系统设置 / 站点配置**，打开 **布局设置**，找到「每页文章数」。默认 5 篇（和升级前硬编码的数量一样），可填 1–50。保存后前台首页和 `/page/n` 会按新数量分页；分类、标签、时间线仍是完整列表，不是按页切开。改完后会触发前台增量渲染。见 [站点配置](../reference/config.md)。

相关分页操作见 [前台分页跳转到指定页](#前台分页跳转到指定页)。

## 域名变更后文章里的图片打不开

换域名（或换图床域名）后，文章里的图片可能全部裂开，后台又找不到「旧域名」存在哪个设置里。这是因为本地图床文件仍在容器的 `/static/...`，但编辑器插入时经常把**当时的访问域名**写成绝对地址，例如 `https://old.example.com/static/img/xxx.webp`。改 DNS、改「网站 Url」都不会改 Mongo 里已经存下来的正文。

已提供批量改写（[#475](https://github.com/Mereithhh/vanblog/issues/475)）：后台进入 **站点管理 / 系统设置 / 图床设置**，在「域名变更后改写文章图片链接」填入旧地址和新地址（需带 `http://` 或 `https://`），确认后会改写**文章和草稿**正文里以此前缀开头的链接，并显示更新篇数。相对路径 `/static/...` 不用改；未填写的第三方图床（如七牛）也不会动。磁盘上的图片文件不会迁移。

建议先到 **备份恢复** 导出一份数据。改完后：

1. 在 **站点配置** 把「网站 Url」改成带协议的新域名（给 RSS / sitemap 用）。
1. 确认新域名 DNS 已指向本站，必要时清 CDN 缓存。
1. 之后请用新域名打开后台再上传图片，新插入的链接才会指向新地址。

`VAN_BLOG_CDN_URL` 只给前台 `/_next/static` 静态资源加前缀，**不会**改文章图片。见 [部署常见问题](./deploy.md#域名变更后文章图片打不开)。

## 配置了 Google Analysis 后前台一直转圈

后台填了 Google Analytics 测量 ID 后，在中国大陆打开前台可能一直转圈或很久才出来，控制台出现 `GET https://www.googletagmanager.com/gtag/js?id=… net::ERR_CONNECTION_TIMED_OUT`。旧实现会在页面可交互后立刻去拉谷歌脚本，超时会拖住整页加载。已改为 `async` 并在 `window.load` 之后空闲时加载（[#375](https://github.com/Mereithhh/vanblog/issues/375)），谷歌统计不可达时不再堵塞首屏。请升级到包含该修复的版本。

站点配置说明见 [访客统计](../features/visitor.md#进阶分析)。谷歌后台没有数据见下一节。

## 配置了 Google Analytics 但谷歌显示尚未收到数据

后台 **站点管理 / 系统设置 / 站点配置 / 高级设置** 里填了测量 ID 后，Google Analytics 提示「尚未从您的网站收到任何数据」。

**`G-XXXXXXXXX` 就是 GA4 的正确格式**，VanBlog 会把它交给 `googletagmanager.com/gtag/js?id=…` 和 `gtag('config', …)`。旧版 `UA-XXXXXXXXX-X` 也可以。不是必须改成别的写法。

更常见的原因：

1. **大陆访问 Google API / `googletagmanager.com` 不通**。访客浏览器加载不了 gtag，谷歌就收不到事件。站长在大陆打开 Analytics 控制台通常也需要代理。这和 [#375](https://github.com/Mereithhh/vanblog/issues/375) 里前台超时是同一类网络问题，不是 ID 填错。
1. 新数据流默认报表可能要等几小时到一天。先看 Analytics 的 **实时** 报表，并用能访问 Google 的网络打开自己的站点。
1. 广告拦截扩展会拦 gtag。本地 `next dev` 也不会注入这段脚本，请用 Docker / 生产前台验证。

需要国内可访问的统计时，不必等 VanBlog 做内置 Umami：到 **站点管理 / 系统设置 / 定制化** 的「自定义 HTML (head)」粘贴 Umami 官方脚本即可，见 [定制化](../advanced/customizing.md#接入-umami-等第三方统计)。布局设置里「是否开启客制化功能」需保持开启。

相关：[访客统计](../features/visitor.md#进阶分析)、[站点配置](../reference/config.md)。

## 开启 uBlock 后日志管理无法加载

后台「站点管理 / 日志管理」打开后提示 `NetworkError when attempting to fetch resource`、表格或系统日志空白，关掉 uBlock Origin（Chrome / Firefox 都一样）又正常。这是广告拦截列表常会拦截路径里带 `log` 的请求（旧接口是 `/api/admin/log`），不是账号或权限问题。已改为请求 `/api/admin/audit`（[#289](https://github.com/Mereithhh/vanblog/issues/289)）；旧路径仍可用。请升级到包含该修复的版本。

页面地址仍是 `/admin/site/log`，只改了拉取数据的 API。

## 登录日志里的 IP 是 VPS / Cloudflare 节点地址

站点套了 Cloudflare（或同类 CDN）后，登录日志有时会记下边缘节点或 VPS 自己的 IP，而不是访客。已改为优先读取请求头 `CF-Connecting-IP`（以及常见的 `True-Client-IP`）（[#127](https://github.com/Mereithhh/vanblog/issues/127)）；没有这些头时仍用原来的 `X-Real-IP` / `X-Forwarded-For`。请升级到包含该修复的版本。若前面还有一层 Nginx，把 `CF-Connecting-IP` 原样转给 VanBlog，不要改写成边缘 IP。见 [日志](../reference/log.md) 与 [反代](../reference/reverse-proxy.md)。

## Cloudflare 缓存了后台页面或接口

在 Cloudflare 用「缓存全部」覆盖 `/*`、再用 `/admin*` 绕过时，后台 HTML 或 `/api/admin/*` 仍可能被边缘缓存（页面规则 `/admin*` **匹配不到** `/api/admin`）（[#140](https://github.com/Mereithhh/vanblog/issues/140)）。源站现已对 `/admin` 和 `/api/admin/*` 发送 `private, no-store` 以及 CDN / Cloudflare 的 `no-store`。请升级后仍为 `/admin*` 与 `/api/admin*` 保留绕过规则，并清一次 CDN 缓存。详见 [部署常见问题](./deploy.md#cloudflare-缓存了后台或后台-api) 与 [反代](../reference/reverse-proxy.md)。

## 前台夜间模式流程图看不清

夜间模式阅读文章时，mermaid / 流程图以前按 mermaid 默认浅色主题渲染，浅色节点和发灰的线条贴在深色正文底上，对比很差。已修复（[#404](https://github.com/Mereithhh/vanblog/issues/404)）：站点或后台预览为暗色时 mermaid 使用 `theme: 'dark'`，并提高文字/描边对比度；白天模式仍是原来的浅色图表。请升级到包含该修复的版本。

这次只处理了 [#404](https://github.com/Mereithhh/vanblog/issues/404) 里的流程图暗色对比度。代码块行号见 [前台代码块没有行号](#前台代码块没有行号)。围栏代码块高亮对比度见 [前台代码块对比度不足](#前台代码块对比度不足)。主题切换本身见 [黑暗模式与响应式](../advanced/darkmode.md)。

## 前台代码块没有行号

文章（以及后台预览里同一套 ByteMD 围栏）以前只包了语言标签和复制按钮，代码左侧没有行号。已修复（[#404](https://github.com/Mereithhh/vanblog/issues/404)）：每行有可见行号（`code-line` / `data-line`，gutter 带 `aria-hidden`），浅色和深色都保持可读对比；mermaid / 流程图围栏不加行号。请升级到包含该修复的版本。

这次处理了 [#404](https://github.com/Mereithhh/vanblog/issues/404) 里的代码块行号。流程图暗色对比度见上一节。更新脚本显示成功但仍是旧版本见 [升级常见问题](./update.md#一键脚本更新显示成功但仍是旧版本)。围栏高亮对比度见 [前台代码块对比度不足](#前台代码块对比度不足)。

## 前台代码块对比度不足

夜间模式阅读文章时，围栏代码块里部分高亮（常见是偏暗红的路径/正则、发暗的文档注释）会贴在深色底上，看起来像糊成一团。已只调整前台 `code-dark.css` 的 highlight 颜色，正文类 token（默认文字、关键字、字符串、注释等）相对代码块背景达到 WCAG AA（≥ 4.5:1），并保持接近 VS Code 暗色主题的配色（[#175](https://github.com/Mereithhh/vanblog/issues/175)）。请升级到包含该修复的版本。

这次只处理了 [#175](https://github.com/Mereithhh/vanblog/issues/175) 任务列表里的「Bad contrast on code block」。顶栏与代码复制的键盘操作见 [前台顶栏和代码复制按钮无法用键盘](#前台顶栏和代码复制按钮无法用键盘)。搜索弹层键盘见 [前台搜索弹层无法用键盘](#前台搜索弹层无法用键盘)。分页方向键与省略号见 [前台分页方向键和无障碍](#前台分页方向键和无障碍)。跳转到指定页见 [前台分页跳转到指定页](#前台分页跳转到指定页)。

主题切换本身见 [黑暗模式与响应式](../advanced/darkmode.md)。

## 前台分页方向键和无障碍

首页或 `/page/n` 底部分页以前：方向键无效；`•••` 是可点的跳页链接；禁用的上一页/下一页仍是 `<a>`。已修复（[#175](https://github.com/Mereithhh/vanblog/issues/175) 的 Pagination issues）：焦点在分页内时，← / → 会在可聚焦的页码和上一页/下一页之间移动焦点（两端不循环，省略号和禁用按钮会跳过）；省略号改为装饰性文字，不再带链接；禁用控件不可聚焦，并有 `aria-label`。当前页仍带 `aria-current="page"`。跳转到指定页输入框见 [前台分页跳转到指定页](#前台分页跳转到指定页)。

这次只处理了 [#175](https://github.com/Mereithhh/vanblog/issues/175) 任务列表里的「Pagination issues」方向键与省略号。代码块对比度已在上一轮修好；顶栏与代码复制的键盘操作见 [前台顶栏和代码复制按钮无法用键盘](#前台顶栏和代码复制按钮无法用键盘)。搜索弹层键盘见 [前台搜索弹层无法用键盘](#前台搜索弹层无法用键盘)。跳转到指定页见 [前台分页跳转到指定页](#前台分页跳转到指定页)。请升级到包含该修复的版本。

## 前台分页跳转到指定页

首页或 `/page/n` 底部分页以前只能点附近页码，页数多时没法直接去第 N 页。已补上（[#175](https://github.com/Mereithhh/vanblog/issues/175) 剩余的「跳转到第 N 页」）：多页时分页旁有「跳转」页码输入框，输入后回车或点「前往」会按现有路由跳到 `/`（第 1 页）或 `/page/n`。超出 1..总页数会落到最近的有效页，空值或非法输入不跳转，不会打开空白页。方向键、省略号和上一页/下一页无障碍见 [前台分页方向键和无障碍](#前台分页方向键和无障碍)。

这次补齐了 [#175](https://github.com/Mereithhh/vanblog/issues/175) 任务列表里此前未做的 jump / navigate to 一项。此前已合并：代码块对比度（#541）、分页方向键与省略号（#542）、顶栏与代码复制键盘（#543）、搜索弹层键盘（#544）。请升级到包含该修复的版本。

## 前台顶栏和代码复制按钮无法用键盘

顶栏搜索、主题切换、RSS、管理后台图标和移动端汉堡菜单以前是带 `onClick` 的 `div`，Tab 到不了，Enter / 空格也点不了；文章代码块右上角复制同样是 `div.code-copy-btn`。已修复（[#175](https://github.com/Mereithhh/vanblog/issues/175) 的 Inaccessible buttons with keyboard）：这些控件改成真正的 `<button type="button">`（管理后台是指向 `/admin` 的链接），带中文 `aria-label`，可用键盘聚焦并激活。RSS 仍是复制订阅地址到剪贴板。搜索弹层内的方向键 / 焦点陷阱见 [前台搜索弹层无法用键盘](#前台搜索弹层无法用键盘)。

这次只处理了 [#175](https://github.com/Mereithhh/vanblog/issues/175) 任务列表里的「Inaccessible buttons with keyboard」。跳转到指定页见 [前台分页跳转到指定页](#前台分页跳转到指定页)。请升级到包含该修复的版本。

## 前台搜索弹层无法用键盘

点顶栏搜索或按 <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> 打开搜索后，以前 Tab 会跑到后面的页面，结果列表不能用方向键选，清除按钮只是带 `onClick` 的 `div`。已修复（[#175](https://github.com/Mereithhh/vanblog/issues/175) 的 Not interactive with keyboard）：打开后焦点进入对话框（搜索输入框），<kbd>Esc</kbd> 关闭（关闭时不再误拦截 Escape），<kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> 只在弹层内循环，清除是真正的按钮（Enter / 空格），<kbd>↑</kbd> / <kbd>↓</kbd> 在结果间移动，<kbd>Enter</kbd> 打开当前结果。弹层带 `role="dialog"`、`aria-modal` 和中文名称「搜索」。

这次只处理了 [#175](https://github.com/Mereithhh/vanblog/issues/175) 任务列表里的「Not interactive with keyboard」。跳转到指定页见 [前台分页跳转到指定页](#前台分页跳转到指定页)。请升级到包含该修复的版本。iPhone Safari 点搜索后页面变暗但没有键盘，见 [iPhone Safari 点搜索没有键盘](#iphone-safari-点搜索没有键盘)。

## iPhone Safari 点搜索没有键盘

iPhone Safari（曾在 iPhone 11 Pro 上报告）点顶栏搜索图标后，页面会变暗（弹层已打开），但输入框没有焦点、系统键盘不出现。这是 Safari 的限制：只有在同一次点击里对输入框调用 `focus()` 才会弹出键盘；以前焦点写在 `useEffect` / 动画结束后，手势已经结束。已改为在点击处理函数里先显示弹层再聚焦搜索框（[#155](https://github.com/Mereithhh/vanblog/issues/155)），桌面 <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd>、<kbd>Esc</kbd> 和弹层内键盘导航不变。请升级到包含该修复的版本。

搜索弹层键盘操作见 [前台搜索弹层无法用键盘](#前台搜索弹层无法用键盘)。

## 前台白天模式分页当前页看不清

首页或 `/page/n` 底部分页在白天/白色主题下，`‹ 1 2 3 ›` 可能都是一样的白底灰字，看不出当前页。夜间模式对比足够，这是浅色主题下当前页和普通页都带了 `bg-white`，Tailwind 不会保证后写的 `bg-gray-200` 生效。已修复（[#333](https://github.com/Mereithhh/vanblog/issues/333)）：当前页用更深底色和白色文字，并带 `aria-current="page"`。请升级到包含该修复的版本。

主题切换本身见 [黑暗模式与响应式](../advanced/darkmode.md)。

## 最近访问时间显示成负数（如 `-113秒前`）

后台「访客统计 / 最近访问 TOP」或文章过期提示里的相对时间，在访客时区和站长/服务器时区不同时，可能把刚发生的访问显示成 `-113秒前` 这类负值。旧实现用本地时区去解析时间再相减。已改为按 UTC 时间点计算，并且对过去的事件不会再得到负数（[#369](https://github.com/Mereithhh/vanblog/issues/369)）。请升级到包含该修复的版本。

绝对时间仍按你浏览器的本地时区显示，只是「N秒前 / N分钟前」这类相对描述不再跨时区算成未来。

## 总字数比各篇文章编辑器字数加起来大很多

后台看板和前台时间线/分类页的「总字数」曾经把 Markdown 里的空格、标点、链接等 ASCII 字符逐个计入，中文文章会看起来像按 UTF-8 字节统计（大约三倍）。已改为与编辑器右下角「字数」同一口径：中文按字、英文按词；只加总已发布（未隐藏、未删除）文章，草稿不计入。[#293](https://github.com/Mereithhh/vanblog/issues/293)

请升级到包含该修复的版本。编辑或删除文章后，总字数会随字数缓存更新。

## 前台选了白色或自动，刷新还是先黑一下 / 变成夜间模式

旧版本首屏 HTML 会按服务器时间套上 `dark`，再等 `/initTheme.js` 读 localStorage 后改回来，所以选「白色」刷新会黑约半秒，选「自动」在浅色系统（尤其晚上）也会被强制成黑色。已修复（[#292](https://github.com/Mereithhh/vanblog/issues/292)、[#25](https://github.com/Mereithhh/vanblog/issues/25)、[#54](https://github.com/Mereithhh/vanblog/issues/54)）：记住的主题在首屏绘制前生效；自动模式跟随系统配色，系统为浅色时不会强制夜间模式。请升级到包含该修复的版本。

## 如何更换评论系统通知邮箱

评论通知走内嵌 Waline 的 SMTP，VanBlog 没有另一套邮件系统。后台进入 **站点管理 / 系统设置 / 评论设置**，开启「是否启用邮件通知」，再填：

- **SMTP**（host / 端口 / 用户名 / 密码）：邮箱服务商的发信服务器。自定义域名邮箱填服务商给出的 SMTP，**不是**博客域名。用户名一般是完整邮箱；密码多数是 **授权码 / 应用专用密码**，不是登录密码。
- **博主邮箱（通知收件人）**：有新评论时通知这个地址，可填自定义域名邮箱，也可以和发件地址不同。
- **发件人显示名称 / 发件地址（From）**：收件箱里看到的发件人。自定义域名邮箱填进发件地址；多数服务商要求发件地址与 SMTP 用户名一致。

保存后会重启内嵌 Waline。最简单是 SMTP 用户名、发件地址、博主邮箱都填同一个域名邮箱。逐步说明见 [评论 · 更换通知邮箱](../features/comment.md#更换通知邮箱)，Waline 官方见 [评论通知](https://waline.js.org/guide/features/notification.html)。

## 评论登录跳到 localhost

外层 Nginx 反代后，Waline 评论登录或管理后台 OAuth 可能跳到 `localhost` / `0.0.0.0` 而不是站点域名（[#396](https://github.com/Mereithhh/vanblog/issues/396)）。反代需要转发 `Host`：`proxy_set_header Host $host;`。完整示例见 [反代](../reference/reverse-proxy.md)，说明见 [部署常见问题](./deploy.md#反代后-waline-登录跳到-localhost)。内置 Caddy、没有再套一层反代时一般不用改。

本机反代时若希望 API（`3000`）不监听公网网卡，可设 `VAN_BLOG_SERVER_HOST=127.0.0.1`（[#488](https://github.com/Mereithhh/vanblog/issues/488)），见 [部署常见问题](./deploy.md#如何让-vanblog-只接受本机反代的流量)。

## 后台设置了 Waline 自定义变量但不生效

在「评论设置」里填了 `imageUploader: false`（关掉评论图片上传）或 `IPQPS`（同一 IP 发言频率）后，旧版本不会把客户端选项传给前台评论组件，数字环境变量也可能没按字符串交给内嵌 Waline。已修复（[#139](https://github.com/Mereithhh/vanblog/issues/139)）。请升级到包含该修复的版本后重新保存一次评论设置（会重启内嵌 Waline）。

布尔请写 `false` 而不是 `"false"`。`IPQPS` 的单位是「每分钟请求次数」，默认已经是 `60`，填 `60` 看起来会像没变化。

## 分类管理改名后文章或草稿还是旧名称

在「站点管理 / 数据管理 / 分类管理」把分类从 `AAA` 改成 `BBB` 后，用过 `AAA` 的文章和草稿可能仍显示旧名称，或看起来像未分类。文章和草稿存的是分类名字符串，旧版本只改了分类表本身。已修复（[#324](https://github.com/Mereithhh/vanblog/issues/324)）：重命名会同步更新所有文章和草稿上的分类名。请升级到包含该修复的版本。

## 多文件自定义页面上传失败或无法删除文件

在 Windows 上「上传文件 / 上传文件夹」可能直接报错（`ENOENT: no such file or directory, mkdir`），或上传成功后无法从文件树里删掉单个文件。旧实现创建目录时按 `/` 硬拆路径，Windows 上 `path.join` 得到反斜杠，拆完变成空路径；同时后台没有删除单个文件的接口。已修复（[#338](https://github.com/Mereithhh/vanblog/issues/338)）。请升级到包含该修复的版本。

## 多文件自定义页面上传后打开是白屏

把静态 zip（例如 [uptime-status](https://github.com/yb/uptime-status)）解压上传到 `/c/uptime/` 后，页面可能空白，控制台里 `/static/js/...` 404。自定义页面会正确返回根目录的 `index.html`，但 **Create React App 默认把资源写成站点根路径** `/static/...`，浏览器不会去 `/c/uptime/static/...` 找。把 `index.html` 里的地址改成 `./static/...`，或构建时设置 `homepage` / `base` 为 `/c/uptime/`。需要 API 或根路径时用反代旁挂，见 [自定义页面](../advanced/custom-page.md)。上传失败或删不掉文件是另一件事，见上一节。

## 水印文字带小数点或域名时不显示

在「图床设置」里把水印设成 `example.com` 这类带 `.` 的文字后，上传的图片上可能完全看不到水印；改成不含点的短文本（如 `VanBlog`）又正常。这不是点号本身画不出来，而是旧实现用固定 500px 宽画布去印 128px 字体，域名一类较长的「单词」会被 Jimp 换到画布外。已修复（[#322](https://github.com/Mereithhh/vanblog/issues/322)）。请升级到包含该修复的版本。

## 文章里写的 HTML 不生效

Markdown 里写了 `<u>下划线</u>`、`<font color="red">` 或 `<center>` 后，前台可能只剩纯文本、没有样式。这是 ByteMD 默认的 GitHub sanitizer 会丢掉这些标签导致的，已修复（[#490](https://github.com/Mereithhh/vanblog/issues/490)）：文章正文会解析 HTML，并保留常见格式/嵌入标签；`<script>`、`onclick` / `onerror` 和 `javascript:` 链接仍会被去掉。请升级到包含该修复的版本。

整站要插入脚本请用 [定制化](../advanced/customizing.md)，完整页面用 [自定义页面](../advanced/custom-page.md)，不要指望文章正文执行 JS。语法与允许范围见 [编辑器](../features/editor.md#在-markdown-里写-html)。

## 前台 Markdown 链接文字或网址显示不完整

文章里写了 `[很长的文字](https://example.com/很长的路径)` 这类链接后，前台首页「阅读全文」前可能露出 `[文字](https://www.` 这样的残缺 markdown，点进去详情页却是完整蓝字链接。没有 `<!-- more -->` 时，旧版本按 50 个字符硬截摘要，会把 `[文字](网址)` 从中间切开，解析器再把剩下的 `https://www.` 当成自动链接。已修复（[#410](https://github.com/Mereithhh/vanblog/issues/410)）：截断点落在链接中间时会把这一条链接补全，可见文字和 `href` 都保持完整。链接文字里有反引号、URL 带查询参数或括号时同样适用。请升级到包含该修复的版本。

仍建议用编辑器工具栏插入 `more` 标记来控制摘要长度。脚注点击新开一页是另一件事，见下一节。

## 点击脚注会新开一页，滚不到文末

正文用了 `[^1]` / `[^1]: 说明` 这类脚注后，前台点击编号可能新开同一篇文章并停在开头，返回链接也不生效；后台预览里脚注前有分隔线，前台没有。这是页内锚点被当成外链、以及脚注区块标签被过滤导致的，已修复（[#290](https://github.com/Mereithhh/vanblog/issues/290)）。请升级到包含该修复的版本。目录点击跳不过去是另一件事，见下一节。

## 前台标题锚点 hash 无法复制，目录也不能用键盘

文章标题以前整段可点、地址栏 hash 也不编码，中文标题（如 `评论系统`）复制不到 `%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F` 这种链接，手动打开也不一定滚到对应标题；侧栏目录是普通 `div`，键盘 Tab / Enter 用不上。已修复（[#177](https://github.com/Mereithhh/vanblog/issues/177)）：每个标题旁有可复制的 `#` 永久链接，hash 用 `encodeURIComponent` 读写，打开带编码 hash 的地址会滚到该标题；目录项是真正的链接，可用键盘操作。请升级到包含该修复的版本。

标题文字本身可以选中复制，不必整段点标题。目录当前项会带 `aria-current="true"`。

## 目录点击标题跳不过去

文章里某个标题后面多了空格（或 `#` 后多空格）时，前台目录点这项不会滚到对应标题。这是目录文案和标题锚点一边去空格、一边保留空格导致的，已修复（[#308](https://github.com/Mereithhh/vanblog/issues/308)）。请升级到包含该修复的版本。

标题本身没有多余空格时，目录跳转不受影响。截图很多的长文章里，图片还在懒加载时目录点到底部会停住；现已改为等上方图片撑开布局后再跳到标题（[#82](https://github.com/Mereithhh/vanblog/issues/82)）。请升级到包含该修复的版本。

## 前台目录比后台编辑器大纲少标题

后台 ByteMD 右侧「目录」能看到的标题，发布后前台文章目录可能少几条，常见是嵌套的二级/三级标题，或行前多了空格的 ATX 标题（CommonMark 仍会渲染成标题）。旧前台用正则抽目录，会把这类标题丢掉。已改为按正文实际渲染出的 `h1`–`h6` 生成目录（[#409](https://github.com/Mereithhh/vanblog/issues/409)）。请升级到包含该修复的版本。

目录能列出来但点了跳不过去，见上一节。标题里的 `$...$` 在目录里显示成源码，见下一节。

## 前台目录里的 TeX 公式未解析

文章标题写成 `## 比较 $A$<$B$` 或 `## 由方程 $F(x,y)=0$ 确定的隐函数 $y=y(x)$` 后，正文里的公式会按 KaTeX 渲染，但前台「目录」可能把 `$...$` 原样显示成未解析的 TeX。已修复（[#264](https://github.com/Mereithhh/vanblog/issues/264)）：目录的可见文字走与正文相同的 `@bytemd/plugin-math-ssr`。目录条目用来跳转的键仍是未解析的标题原文（`NavItem.text`），不改正文标题锚点。请升级到包含该修复的版本。

不含公式的标题、以及嵌套目录完整性（[#409](https://github.com/Mereithhh/vanblog/issues/409)）不受影响。后台编辑器右侧大纲不是同一套组件。

## 后台编辑器点目录后出现一大片空白

在后台编辑文章时，点编辑器右侧「目录」，再点某个标题下面的 Markdown 标题，编辑区可能变成一大片空白，只能刷新页面才能恢复。这是编辑器大纲把预览标题 `scrollIntoView` 时连带滚了 ByteMD/CodeMirror 外壳导致的，已修复（[#370](https://github.com/Mereithhh/vanblog/issues/370)）。请升级到包含该修复的版本。

这和前台文章目录不是同一件事；前台少标题或点了跳不过去，见上面两节。

## 自定义页面修改信息后刷新又变回去

在「站点管理 / 自定义页面」里点「修改信息」，接口返回 200，刷新后名称或路径仍是旧的。这是更新按新路径查找文档导致的，改路径时写不到原记录。已修复（[#453](https://github.com/Mereithhh/vanblog/issues/453)）。请升级到包含该修复的版本。

## 前台很快，后台却要转很久

后台每次打开都会请求 `/api/admin/meta`。这个接口过去会同步查询远程版本接口（`https://api.mereith.com/vanblog/version`）来提示更新；远程慢或不可达时，后台会被拖住大约 30 秒，前台不受影响。该问题已修复（[#343](https://github.com/Mereithhh/vanblog/issues/343)）：版本检查改为短超时 + 后台缓存，不再阻塞后台。请升级到包含该修复的版本。

## 文章里有 Mermaid 图表时编辑器无法输入或预览报错

含 mermaid 代码块的文章在后台打开后，编辑器可能无法点击或输入，或左侧一改字右侧即时预览就抛异常。流程图里写了 `style A fill:#9fe1e7` 这类十六进制颜色（以及中文节点名）时，还可能弹出 `Yh is not a function or its return value is not iterable`，之后整篇无法再改。这些问题都已修复（[#477](https://github.com/Mereithhh/vanblog/issues/477)、[#424](https://github.com/Mereithhh/vanblog/issues/424)、[#391](https://github.com/Mereithhh/vanblog/issues/391)）。若仍使用 `v0.54.0` 及更早版本，请升级到包含该修复的版本。

临时办法：用开发者工具挡住预览区，或把窗口缩到只显示编辑区，即可继续改正文。

## 备份恢复后分类为空、首页没有文章

从旧机器后台导出全部数据、在新机器导入后，文章上可能仍显示分类名，但「分类管理」是空的，首页刷新也不出文章。该问题已修复（[#496](https://github.com/Mereithhh/vanblog/issues/496)、[#280](https://github.com/Mereithhh/vanblog/issues/280)）。请升级到包含该修复的版本后重新导入备份；导入完成后稍候刷新首页。

整机迁移更稳妥的方式仍是复制 Docker 持久化目录，见 [备份与迁移](../guide/backup.md)。

## 后台改文章后，数字 ID 的前台地址不更新

文章设置了自定义路径时，`/post/自定义路径` 会更新，但 `/post/数字ID`（搜索结果常跳到这里）可能仍是旧内容。这是按需 ISR 只刷新了自定义路径页导致的，已修复（[#356](https://github.com/Mereithhh/vanblog/issues/356)）。请升级到包含该修复的版本。

临时办法：在「系统设置 / 高级设置」里手动触发静态页面更新。

## 后台编辑器填写信息时方向键无法移动光标

在编辑器右上角「操作 → 修改信息」中填写标题等字段时，方向键无法移动光标。该问题已修复（[#390](https://github.com/Mereithhh/vanblog/issues/390)、[#470](https://github.com/Mereithhh/vanblog/issues/470)）。若仍使用 `v0.54.0` 及更早版本，请升级到包含该修复的版本。

## 后台编辑器填写信息时无法使用退格键

在编辑器右上角「操作 → 修改信息」中填写标题等字段时，退格键（以及 Delete）无法删字。该问题已修复（[#233](https://github.com/Mereithhh/vanblog/issues/233)）。方向键光标见上一节。若仍使用旧版本，请升级到包含该修复的版本。

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

## 开启了 https 自动重定向但仍走 http

后台打开「HTTPS 自动重定向」后，直接输入域名（不写 `https://`）仍是 http，手动加 `https://` 却能打开。旧实现用 Caddy Admin API `POST` 往 `listener_wrappers` 上追加：wrappers 已存在时会把整段数组再套一层，开启成功日志还误写成「已关闭」。已改为用 `PATCH` / `PUT` **整段替换**成 `http_redirect`，写入后再读回确认；关闭则删除 wrappers（没有这项时的 404 视为已关）（[#150](https://github.com/Mereithhh/vanblog/issues/150)）。请升级到包含该修复的版本。

开启后请用无痕窗口访问 `http://你的域名`，应跳到 `https://`。也可在后台点「查看 Caddy 配置」，`srv1` 下应有 `"listener_wrappers": [{"wrapper":"http_redirect"}]`。用外层 Nginx 反代 80 端口时请保持关闭，见 [反代](../reference/reverse-proxy.md)。关不掉时见下一节。

## 开启了 https 重定向后关不掉

开启「HTTPS 自动重定向」后，http 和用 IP 访问都会被跳到 https，证书对不上时站点会打不开。后台此时也进不去，需要在服务器上重置。

如果你是用一键脚本安装的，先更新到最新脚本，再选菜单 **9. 重置 https 设置**（或 `./vanblog.sh reset_https`）。新脚本会：

1. 清掉本机 Caddy 配置里的 `http_redirect` / 强制跳转；
2. 删除数据库 `settings` 里的 https 记录，避免重启后又自动打开跳转；
3. 调用 Caddy API 关掉正在生效的重定向，并重启 vanblog。

成功或失败都会打印明确提示。成功后请用 `http://IP` 或 `http://域名` 访问；浏览器若仍跳 https，清一下缓存。

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh reset_https
```

如果你是自己用 docker 部署的，在 vanblog 容器里执行（无 TTY 也可，会用默认 MongoDB 地址）：

```bash
docker exec -i <vanblog容器名> node /app/cli/resetHttps.js
docker compose restart vanblog
```

旧版 `resetHttps.js` 只删数据库记录、不会关 Caddy 跳转，执行后需要重启容器才会恢复 HTTP / IP 访问。

## 卸载后脚本备份文件被删掉了

旧版一键脚本「卸载」会 `rm -rf /var/vanblog`，而选项 10「备份 VanBlog」正好把 `vanblog-backup-*.tar.gz` 写在这个目录里，所以卸载会把刚做好的备份一起删掉（[#408](https://github.com/Mereithhh/vanblog/issues/408)）。

请先用选项 20 更新到最新脚本，再卸载。新脚本只会删除安装数据（`data/`）和编排文件，**不会**删除 `vanblog-backup-*`，也不会动安装目录以外的备份；删除前会列出将保留的备份并要求确认。

```bash
curl -L https://vanblog.mereith.com/vanblog.sh -o vanblog.sh && chmod +x vanblog.sh && ./vanblog.sh uninstall
```

卸载完成后，备份仍在 `/var/vanblog/vanblog-backup-*`（若安装目录里只剩下备份，目录本身也会保留）。请尽快把备份拷到别处再重装。
