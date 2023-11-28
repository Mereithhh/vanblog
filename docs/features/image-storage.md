---
title: 图床
icon: photo-film
order: 5
---

## 设置图床

### 内置图床

VanBlog 带有内置的图床实现，无需任何配置，开箱即用。

::: tip

为防止更新后丢失数据，请在部署时确认目录映射正常。

:::

### 第三方图床

VanBlog 可以对接第三方图床，是基于 [picgo-core](https://picgo.github.io/PicGo-Core-Doc/) 实现的。

#### 支持列表

- 七牛图床
- 腾讯云 COS
- 又拍云
- GitHub
- SM.MS
- 阿里云 OSS
- Imgur

#### 配置方法

::: tip

感谢张鱼哥同学，他写了一份很详细的 `腾讯云 COS` 配置指南：

- [vanblog 使用 picgo 图床的完整部署教程](https://www.handyzyg.cn/post/47)

其他云存储的指南欢迎大家补充～

:::

首先阅读 [picgo core 配置文档](https://picgo.github.io/PicGo-Core-Doc/zh/guide/config.html#%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90)，推荐跟着文档自动生成配置。

生成后，进入后台`站点管理/系统设置/图床设置`，选择 `OSS` 图床，并把生成的配置文件复制过去，比如我用的七牛云图床，就像下面这样：

![图床配置](https://pic.mereith.com/img/73d7d98839fb36fa26e450423aa7d147.clipboard-2022-09-20.png)

点击保存后，新上传的图片就是对应的图床了！内置图床已经上传的图片不受影响。

::: warning 注意

VanBlog 使用 `picgo-core` 配置文件，和桌面版的 `picgo` 的配置文件不通用！

:::

#### 安装自定插件

您可以在后台配置安装自定义的 `picgo` 插件，请填入插件名，多个请用英文逗号分隔。

如下图中，想用 `s3` 插件，直接写 s3 就行了，提交后您可以在容器日志中看到插件安装情况。

![插件设置](https://pic.mereith.com/img/73d7d98839fb36fa26e450423aa7d147.clipboard-2022-09-20.png)

![安装日志](https://pic.mereith.com/img/283fbd4ca8addeaf06b2f3d6ae1c4643.clipboard-2022-09-20.png)

::: tip

使用 `picgo` 内部支持的存储，不需要按照自定义插件，留空就行。

:::

## 其他功能

### 自动压缩

无论使用何种图床，VanBlog 都支持上传图片自动压缩为 webp 格式。在编辑器或图片管理中上传图片时，VanBlog 会在收到图片信息的时候，先进行压缩，再保存到对应图床。

这个功能默认是开启的，想手动关闭请在后台 `站点管理/系统设置/图床设置` 中，关闭 `自动压缩` 即可。

![自动压缩设置](https://pic.mereith.com/img/6f00ddb9f4051d05aa030cdf6ce3404f.clipboard-2023-04-14.png)

### 自动水印

无论使用何种图床，VanBlog 都支持上传图片自动添加水印。在编辑器或图片管理中上传图片时，VanBlog 会在收到图片信息的时候，先进行水印转换，再保存到对应图床。

在后台 `站点管理/系统设置/图床设置` 中，开启水印并输入水印文字即可。

![水印设置](https://pic.mereith.com/img/6f00ddb9f4051d05aa030cdf6ce3404f.clipboard-2023-04-14.png)

::: warning 当前限制

- 后台中但凡表单中有上传按钮的选项，不走水印逻辑。
- 由于使用了 [jimp](https://github.com/jimp-dev/jimp/) 库做水印，字体用了 `fnt` 格式，所以暂不支持中文字符作为水印。
- 宽高小于 128px 的图片可能会加不上水印
- 水印会加到图片右下角，带透明度的灰色字体。
- 水印目前只支持上传 `png`、`jpg` 等常见格式，暂不支持动图。

如果谁有更好的 `nodejs` 水印方案，请提 `issue` 或者直接联系我，后续会支持使用自定义图片做水印。

:::

### 扫描已有图片

VanBlog 支持把文章中存在的，但是不在图床记录中的图片扫描出来。

点击 `站点管理/系统设置/图床设置` 中的 `扫描现有文章图片到图床`，耐心等待即可。如果存在扫描失败的图片，会弹窗显示信息。

![扫描已有图片](https://pic.mereith.com/img/cb00c069e9fba6308151c859bd78d15d.clipboard-2022-08-15.png)

这个功能可用于检测所有文章的失效图片。

### 图片管理

进入 VanBlog 后台的 `图片管理` 模块可以对图片进行管理：

![图片管理](https://pic.mereith.com/img/5be657eaaff09be9dd4a77d968e54c21.clipboard-2022-08-15.png)

其中对着图片点右键可以显示高级菜单，包括不限于 `显示图片详细信息` 和 `查找被引用文章` 等。

上传图片后会自动复制图片 `Markdown 链接` 到剪切板，如需复制 `URL 链接`，请右键单击图片选择 `复制链接`。

### 编辑器快捷上传

VanBlog 支持在编辑器中快捷上传图片，见下图：

![编辑器上传图片](https://www.mereith.com/static/img/8ad428da63e4380d4b1c2f2a8362b492.clipboard-2022-09-08.png)

### 图片复用

每一次上传都会检测图片的 `md5` 签名，如果已经有的该图片，则不会创建新条目。而是复用之前的图片，并把之前的图片链接复制到剪切板里。

### 导出全部图片

VanBlog 支持将全部本地图床图片导出为压缩包。

你可以在后台中的图片设置中点击按钮来导出全部本地图床图片

![导出全部图片](https://www.mereith.com/static/img/dd5f0f0a1ff61a1a5d22c09fcaa8178c.clipboard-2022-09-01.png)

::: tip

OSS 图床暂不支持全部导出

:::
