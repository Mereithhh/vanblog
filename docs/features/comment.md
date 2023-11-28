---
title: 评论
icon: comments
order: 4
---

VanBlog 内嵌了 [Waline 评论系统](https://waline.js.org/)，你不需要任何额外的配置或额外部署，开箱即用。

评论系统默认开启，在后台 `站点管理/系统设置/站点配置/高级设置` 中可以控制评论系统的开关。

![评论系统开关](https://pic.mereith.com/img/4ab797b4096a953d9d27ebf6a4a2b0dc.clipboard-2022-08-25.png)

## 配置

您可以在后台 `站点管理/系统设置/评论设置` 中对评论的一些功能进行配置：

![评论设置](https://www.mereith.com/static/img/4b0725013bd8cd940995e383ba83e527.clipboard-2022-09-01.png)

## 消息通知

内嵌的评论系统可以通过邮件或者 `webhook` 进行消息通知，具体来说：

- 当有新评论时会根据表单中的 `博主邮箱`，对博主进行通知。
- 当某人的评论被回复时，会通过这个人在评论时所写的邮箱进行通知。
- 通知时的站点名称和站点地址取自 `站点管理/系统设置/站点配置` 。

### 配置邮件消息通知

选择 `启用邮件通知` 后，会出现一些表单，必填项就是开启邮件消息通知所必需的。

和 `SMTP` 有关的四项需要您在自己的邮件服务商处获取。

::: details 例子

以 QQ 邮箱为例，进入后台的设置页面，可以找到下面的内容：

![QQ 邮箱](https://www.mereith.com/static/img/3a0157c13c7ed53b5f3a7c360f23c61c.clipboard-2022-09-01.png)

很多邮件服务商会**默认关闭 SMTP**，你需要先开启才行！

:::

点击官方的帮助文档，可以获取到相应的内容，填入即可。拿我来说，我就这样写的：

![](https://www.mereith.com/static/img/c55b4837910d893d4431543304ac0585.clipboard-2022-09-01.png)

> 参数说明（以QQ邮箱为例）：
>
> - **SMTP 地址(host)**：个人邮箱可使用 `smtp.qq.com` ，企业邮箱可使用 `smtp.exmail.qq.com`
> - **SMTP 端口号**：`465` 或 `587`
> - **SMTP 用户名**：发送邮件的邮箱地址，即你的QQ邮箱地址
> - **SMTP 密码**：生成的授权码（需要在QQ邮箱设置中生成）
> - **自定义发送邮件的发件人**：不重要，自定义即可
> - **自定义发送邮件的发件地址**：需要与 **SMTP 用户名** 一致，否则发送邮件时可能报错`501 Mail from address must be same as authorization user`。
>
> 附上QQ邮箱官方说明：[QQ邮箱 SMTP/IMAP服务](https://wx.mail.qq.com/list/readtemplate?name=app_intro.html#/agreement/authorizationCode)、[腾讯企业邮 常用邮件客户端软件设置](https://service.exmail.qq.com/cgi-bin/help?subtype=1&id=28&no=1000564)

当我（博主）收到评论时邮箱中会显示：

![](https://www.mereith.com/static/img/d57d80bd5c8a3459142066c039fc386c.clipboard-2022-09-01.png)

当某人的评论得到了回复，他的邮箱也会显示：

![](https://www.mereith.com/static/img/ac9a19cc271e76b0b09159884cb54e63.clipboard-2022-09-01.png)

::: tip 提示

如果配置好但邮件通知不生效的话，请检查一下密码是否正确，很多服务商需要申请独立授权码以用作 SMTP 密码。

如果还是不生效，可以尝试一下重启 VanBlog，可能会解决问题。

:::

### 配置 webhook 消息通知

VanBlog 内嵌的评论系统支持在有新评论时发送 `webhook`，配置好 `webhook` 接收地址后，会发送一条 `POST` 请求，具体包含以下请求体（JSON 格式）：

```json
{
  "type": "new_comment",
  "data": {
    "comment": {
      "link": "https://blog-dev.mereith.com",
      "mail": "504021770@qq.com",
      "nick": "mereithzxcaasd",
      "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      "url": "/",
      "comment": "评论测试",
      "ip": "::ffff:192.168.5.38",
      "insertedAt": "2022-09-01T05:52:26.233Z",
      "status": "approved",
      "objectId": "6310489b4e92ac0784a13669",
      "rawComment": "评论测试"
    }
  }
}
```

## 自定义环境变量

你也可以传递 JSON 格式的自定义环境变量键值对，具体可配置的选项请参考 [Waline 文档](https://waline.js.org/reference/server.html)

## 原理

在后端的 server 中内嵌了控制 `waline.js` 启动停止的服务，后台页面中暂时使用 `iframe` 内嵌 Waline 管理页面，后续会考虑陆续替换成自己的评论实现。

![评论管理](https://pic.mereith.com/img/dd7792a91f5a3b945ee2b261b06f666a.clipboard-2022-08-25.png)

配置信息也会由后端的服务生成，传递给 `waline.js` 中，具体采用了 `node` 的 `child_process` 模块。

具体可以看 `packages/server/src/provider/waline/waline.provider.ts` 的代码。
