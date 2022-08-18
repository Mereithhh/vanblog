---
title: 图床
---

## 自带图床

你可以选择 `vanBlog` 内置的图床实现，无需任何配置，开箱即用。但是请记得在部署时映射好目录以防更新后丢失数据。

## 外置图床

`vanBlog` 可以对接第三方图床，是基于 [picgo-core](https://picgo.github.io/PicGo-Core-Doc/) 实现的。

具体支持：

- [x] 七牛图床
- [x] 腾讯云 COS
- [x] 又拍云
- [x] GitHub
- [x] SM.MS
- [x] 阿里云 OSS
- [x] Imgur

### 配置方法

首先阅读 [picgo 配置文档](https://picgo.github.io/PicGo-Core-Doc/zh/guide/config.html#%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90)，推荐跟着文档自动生成配置。

生成后，进入后台`站点管理/图床设置`，选择 `OSS` 图床，并把生成的配置文件复制过去，比如我用的七牛云图床，就像下面这样：

![](https://pic.mereith.com/img/c04cb1d8912a0a34cfd39e846caad201.clipboard-2022-08-14.png)

点击保存后，新上传的图片就是对应的图床了！内置图床已经上传的图片不受影响。

## 扫描已有图片

`vanBlog` 支持把文章中存在的，但是不在图床记录中的图片扫描出来。

点击 `站点管理/图床设置` 中的`扫描现有文章图片到图床` ，耐心等待即可。如果有扫描失败的，会弹窗显示信息。

这个功能在某些情况下，可以用来检测所有文章的失效图片。

![](https://pic.mereith.com/img/cb00c069e9fba6308151c859bd78d15d.clipboard-2022-08-15.png)

## 图片管理

进入 `vanBlog` 后台的 `图片管理` 模块可以对图片进行管理：

![](https://pic.mereith.com/img/5be657eaaff09be9dd4a77d968e54c21.clipboard-2022-08-15.png)

其中对着图片点右键可以显示高级菜单，包括不限于`显示图片详细信息`和`查找被引用文章`等。

上传图片后会自动复制图片`markdown 链接`到剪切板，需要复制 `url 链接` 的，可以对着图片点右键选择 `复制链接`

## 编辑器快捷上传

`vanBlog` 支持在编辑器中快捷上传图片，见下图：

![](https://pic.mereith.com/img/46a028dc164de913c64a1f158f09b292.clipboard-2022-08-15.png)

## 图片复用

每一次上传都会检测图片的 `md5` 签名，如果已经有的该图片，则不会创建新条目。而是复用之前的图片，并把之前的图片链接复制到剪切板里。
