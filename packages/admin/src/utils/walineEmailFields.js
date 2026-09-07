/**
 * Admin copy for Waline comment-notification SMTP fields (#342).
 *
 * VanBlog already maps these to Waline env (SMTP_*, AUTHOR_EMAIL, SENDER_*).
 * The gap is discoverability: users with a custom-domain mailbox need to
 * know which field is the inbox vs the From address, and that SMTP 密码
 * is usually an app password / 授权码.
 */

const WALINE_ADMIN_PATH = '站点管理 / 系统设置 / 评论设置';

const WALINE_NOTIFICATION_DOCS_URL = 'https://waline.js.org/guide/features/notification.html';

const WALINE_SERVER_ENV_DOCS_URL = 'https://waline.js.org/reference/server/env.html';

const WALINE_EMAIL_FIELDS = Object.freeze({
  smtpEnabled: Object.freeze({
    name: 'smtp.enabled',
    label: '是否启用邮件通知',
    tooltip:
      '启用后，新评论会发到「博主邮箱」；访客被回复时会发到其填写的邮箱。换成自定义域名邮箱时，也在本表单改 SMTP / 发件地址，不用另外部署邮件服务。',
    placeholder: '默认关闭',
  }),
  smtpHost: Object.freeze({
    name: 'smtp.host',
    label: 'SMTP 地址(host)',
    tooltip:
      '邮箱服务商的 SMTP 服务器（如 smtp.example.com），不是博客域名。自定义域名邮箱请到服务商后台查看，常见还有 smtp.exmail.qq.com、smtp.gmail.com。',
    placeholder: '例如 smtp.exmail.qq.com 或 smtp.example.com',
  }),
  smtpPort: Object.freeze({
    name: 'smtp.port',
    label: 'SMTP 端口号',
    tooltip: '常见为 465（SSL）或 587（STARTTLS），以邮箱服务商说明为准。',
    placeholder: '例如 465 或 587',
  }),
  smtpUser: Object.freeze({
    name: 'smtp.user',
    label: 'SMTP 用户名',
    tooltip:
      'SMTP 登录账号。自定义域名邮箱一般填完整邮箱，例如 noreply@yourdomain.com。',
    placeholder: '例如 noreply@yourdomain.com',
  }),
  smtpPassword: Object.freeze({
    name: 'smtp.password',
    label: 'SMTP 密码（授权码）',
    tooltip:
      '多数服务商不是登录密码，而是 SMTP 授权码 / 应用专用密码（App Password）。Gmail、QQ、企业邮和多数自定义域名邮箱都要先在邮箱后台开启 SMTP 并生成授权码。',
    placeholder: '请输入 SMTP 授权码或应用专用密码',
  }),
  authorEmail: Object.freeze({
    name: 'authorEmail',
    label: '博主邮箱（通知收件人）',
    tooltip:
      '有新评论时通知这个地址。可填自定义域名邮箱，也可以和发件地址不同（例如用域名邮箱发信、用常用邮箱收信）。建议与你在评论里用的邮箱一致，避免自己回复时再给自己发通知。',
    placeholder: '新评论通知发到这个邮箱，例如 you@yourdomain.com',
  }),
  senderName: Object.freeze({
    name: 'sender.name',
    label: '发件人显示名称',
    tooltip: '收件箱里显示的 From 名称，可填站点名。不影响 SMTP 登录账号。',
    placeholder: '例如站点名称',
  }),
  senderEmail: Object.freeze({
    name: 'sender.email',
    label: '发件地址（From）',
    tooltip:
      '通知邮件的发件邮箱。使用自定义域名邮箱时填该域名邮箱（如 noreply@yourdomain.com）。多数服务商要求与 SMTP 用户名一致，否则可能报 501 Mail from address must be same as authorization user。',
    placeholder: '例如 noreply@yourdomain.com',
  }),
});

module.exports = {
  WALINE_ADMIN_PATH,
  WALINE_NOTIFICATION_DOCS_URL,
  WALINE_SERVER_ENV_DOCS_URL,
  WALINE_EMAIL_FIELDS,
};
