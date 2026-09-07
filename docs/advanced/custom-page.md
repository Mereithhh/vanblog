---
title: 自定义页面
icon: file
redirectFrom:
  - /feature/advance/customPage.html
---

VanBlog 支持自定义页面，但首先请您明确自己的需求。

自定义页面**只托管静态 HTML/CSS/JS 文件**，把内容挂到站点的 `/c/<路径>/` 下。它不是通用应用平台：不能跑 Node / PHP / Docker 后端，也不会给 SPA 自动改 `base` 或做 History 路由回退。需要独立后端或根路径应用时，请用反代或单独容器，见 [和其他项目共存](#和其他项目共存)。

## 自定义带有默认布局的页面

如果要自定义带有布局的页面，通俗的理解就是替换掉文章页面中文章卡片的内容。您可以通过以下操作实现：

- 新建文章，在文章内可直接写 html 代码
- 设置文章为隐藏
- 在后台布局设置中开启 `通过 URL 访问隐藏文章`
- 在后台自定义导航栏中添加这篇文章
- 或者在定制化中，嵌入自己的代码把这篇文章的 URL 嵌入到合适的位置

## 完整的自定义页面

不带有已有布局，完全自定义的页面。

分为两种：单文件页面、多文件页面。

前者可直接通过后台内置编辑器编辑其 HTML 内容，比较省事、后者需要上传相关的文件，适合复杂页面。

在后台的 `站点管理/自定义页面` 中可以找到功能入口：

![自定义页面](https://pic.mereith.com/img/125f158afebb4fd85d5aa81b5d8c6bd7.clipboard-2023-02-01.png)

### 新建页面

您可以新建自定义页面：

![新建页面](https://pic.mereith.com/img/0540fdf061d9106f11470cf5ed65e9d2.clipboard-2023-02-01.png)

路径必须以 `/` 开头，且只能有**一级**（例如 `/door`、`/uptime`），不要写成 `/foo/bar`。实际访问地址会在前面加上 `/c`：路径 `/door` 对应 `/c/door/`。

多文件页面访问 `/c/door/` 时会读取该目录下的 **`index.html`**。请在后台文件树的**根目录**确认能看到 `index.html`，而不是 `某个文件夹/index.html`。带查询参数的地址（如 `/c/door/?x=1`）同样读这份入口文件。

### 修改信息

列表中的「修改信息」可以更改名称；单文件页面还可以改路径（多文件页面路径不可改）。确定后刷新后台仍会显示新的名称和路径。

### 编辑页面

创建完毕后，点击列表页的 `编辑内容` 或 `文件管理` ，即可跳转到代码（文件）编辑器进行编辑。

#### 多文件页面的编辑器

![页面编辑](https://pic.mereith.com/img/6d3daf7daf9a093d42e9ed34a77f0ed3.clipboard-2023-02-01.png)

首次使用，需要先上传文件或文件夹。

- 当前目录：左侧文件列表中，如果有选中的文件/文件夹，当前目录就是选中的文件所在目录，或者所选文件夹的目录。如果未选中，就是根目录。
- 上传文件夹会上传文件夹内所有文件到当前目录，保留层级关系。
- 上传文件会上传所选文件到当前目录。
- 选中左侧某个文件后，可通过「操作 / 删除文件」删除该文件。

例如我上传了一整个番茄钟项目文件夹：

![上传文件夹](https://pic.mereith.com/img/34a75bdd21513d1a234807efc979bef4.clipboard-2023-02-01.png)

![上传结果](https://pic.mereith.com/img/42fea40c53a918deea6bac25d2b75ecf.clipboard-2023-02-01.png)

上传完毕后，我可以点击左侧文件列表中的某些文件，在右面的编辑器修改它们，并点击 `操作/保存` 以保存更改。

![修改文件](https://pic.mereith.com/img/b28a1b636bc952b0e90ef8f0963a4fee.clipboard-2023-02-01.png)

效果如图：

![设置效果](https://pic.mereith.com/img/bc999b2826d07e0e8e22183243c38c4c.clipboard-2023-02-01.png)

#### 单文件页面的代码编辑器

![单文件编辑](https://pic.mereith.com/img/25cc8ff491606f819cc50ecedbc7018c.clipboard-2023-02-01.png)

效果如图:

![设置效果](https://pic.mereith.com/img/3797fa90700decd37cab3983c8eac867.clipboard-2023-02-01.png)

可以在编辑器修改它们，并点击 `操作/保存` 以保存更改。

## 多文件页面能托管什么

适合：静态站点、纯前端页面、已经按子路径打包好的 HTML/CSS/JS。

不适合：需要自己的 API 服务、WebSocket 服务、或默认假设自己在网站根路径 `/` 的 React / Vue 打包产物（常见现象是页面打开了但是白屏、控制台里 `/static/js/...` 404）。

上传后请先核对：

1. 左侧文件树根上有 `index.html`（访问 `/c/<路径>/` 读的就是它）。
1. 用浏览器开发者工具看 `index.html` 里的脚本/样式地址：应是相对路径（`./static/js/app.js`）或带前缀的 `/c/<路径>/static/...`，而不是站点根上的 `/static/...`。
1. 若用了前端路由，把 router 的 `basename`（或 Vue 的 `base`）设成 `/c/<路径>/`。VanBlog **不会**把所有子路径都回退到 `index.html`。

## 为什么把 uptime-status 一类项目丢进去会打不开

[uptime-status](https://github.com/yb/uptime-status) 的 Release zip 在根目录确有 `index.html`，但里面的脚本/样式是站点根路径：

```html
<script defer="defer" src="/static/js/main.ace24a8b.js"></script>
<link href="/static/css/main.e4003dc1.css" rel="stylesheet">
```

放到 VanBlog 的 `/c/uptime/` 后，浏览器会去请求 `https://你的域名/static/js/...`（那是博客图床目录），而不是 `/c/uptime/static/js/...`，所以页面「打开无效」、看起来像白屏。这不是上传失败。

可以任选一种做法：

- **改静态资源路径后继续用自定义页面**：在后台打开 `index.html`，把 `/static/...` 改成 `./static/...`（该 zip 里的 `config.js`、`favicon.ico` 已经是相对路径）。Create React App 若自行构建，把 `package.json` 的 `homepage` 设为 `"."` 或 `"/c/uptime"` 再打包。Vite 则设 `base: '/c/uptime/'` 或 `base: './'`。
- **不要用自定义页面，改走反代**：状态面板、需要 API 代理、或必须占根路径的应用，放到独立容器/目录，用 Nginx / Caddy 按路径或子域名转发。见下一节。

解压 zip 后若用「上传文件夹」，VanBlog 会去掉最外层文件夹名，一般可以把 `index.html` 放到自定义页面根上。若树里看到的是 `uptime-status/index.html`，请打开 `/c/uptime/uptime-status/`，或把文件移到根目录后再访问 `/c/uptime/`。

## 和其他项目共存

一键脚本部署的 VanBlog 是 Docker Compose（VanBlog + Mongo），内置 Caddy 占用 80/443。它**不会**变成可以随便再塞项目的 PaaS。旁挂其他站点可以：

| 方式 | 适用 | 说明 |
| --- | --- | --- |
| 自定义页面 `/c/<name>/` | 静态 HTML/CSS/JS | 后台上传即可，受上面的 `index.html` 与资源路径限制 |
| 反代到另一容器/端口 | 需要后端、自己的路由、或必须占 `/status` 这类路径 | 在编排里加服务，或宿主机另起进程；外层 Nginx/Caddy 把该路径转到它。VanBlog 仍只反代自己的 HTTP 端口，见 [反代](../reference/reverse-proxy.md) |
| 独立子域名或另一台机器 | 和其他站点长期共存 | `status.example.com` → 状态面板，`blog.example.com` → VanBlog，互不影响 |

不要把其他项目的文件解压进 VanBlog 容器的 `/app/static` 里当「部署」。图床目录不是应用托管目录。

脚本再次运行只会管理 VanBlog 自己的编排；额外服务请写在你改过的 `docker-compose.yaml` 里并自行 `up`，以免被脚本覆盖。更细的端口、证书、Host 头说明仍见 [部署常见问题](../faq/deploy.md) 与 [反代](../reference/reverse-proxy.md)，本文不重复整份部署文档。
