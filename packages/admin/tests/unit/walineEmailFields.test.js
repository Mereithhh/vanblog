const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  WALINE_ADMIN_PATH,
  WALINE_EMAIL_FIELDS,
  WALINE_NOTIFICATION_DOCS_URL,
  WALINE_SERVER_ENV_DOCS_URL,
} = require('../../src/utils/walineEmailFields');

const repoRoot = path.join(__dirname, '../../../..');
const formSrc = readFileSync(
  path.join(__dirname, '../../src/components/WalineForm/index.tsx'),
  'utf8',
);
const tabSrc = readFileSync(
  path.join(__dirname, '../../src/pages/SystemConfig/tabs/WalineTab.jsx'),
  'utf8',
);
const commentDocs = readFileSync(path.join(repoRoot, 'docs/features/comment.md'), 'utf8');
const usageFaq = readFileSync(path.join(repoRoot, 'docs/faq/usage.md'), 'utf8');

describe('Waline email field copy (#342)', () => {
  it('keeps SMTP field names aligned with WalineSetting / env mapping', () => {
    assert.equal(WALINE_EMAIL_FIELDS.smtpEnabled.name, 'smtp.enabled');
    assert.equal(WALINE_EMAIL_FIELDS.smtpHost.name, 'smtp.host');
    assert.equal(WALINE_EMAIL_FIELDS.smtpPort.name, 'smtp.port');
    assert.equal(WALINE_EMAIL_FIELDS.smtpUser.name, 'smtp.user');
    assert.equal(WALINE_EMAIL_FIELDS.smtpPassword.name, 'smtp.password');
    assert.equal(WALINE_EMAIL_FIELDS.authorEmail.name, 'authorEmail');
    assert.equal(WALINE_EMAIL_FIELDS.senderName.name, 'sender.name');
    assert.equal(WALINE_EMAIL_FIELDS.senderEmail.name, 'sender.email');
  });

  it('distinguishes inbox, From address, and app passwords for custom-domain mailboxes', () => {
    assert.match(WALINE_ADMIN_PATH, /系统设置/);
    assert.match(WALINE_ADMIN_PATH, /评论设置/);

    assert.match(WALINE_EMAIL_FIELDS.authorEmail.label, /博主邮箱/);
    assert.match(WALINE_EMAIL_FIELDS.authorEmail.tooltip, /新评论/);
    assert.match(WALINE_EMAIL_FIELDS.authorEmail.tooltip, /自定义域名邮箱/);

    assert.match(WALINE_EMAIL_FIELDS.senderEmail.label, /发件地址/);
    assert.match(WALINE_EMAIL_FIELDS.senderEmail.tooltip, /自定义域名邮箱/);
    assert.match(WALINE_EMAIL_FIELDS.senderEmail.tooltip, /SMTP 用户名/);

    assert.match(WALINE_EMAIL_FIELDS.smtpPassword.label, /授权码/);
    assert.match(WALINE_EMAIL_FIELDS.smtpPassword.tooltip, /应用专用密码|App Password/);
    assert.match(WALINE_EMAIL_FIELDS.smtpUser.tooltip, /自定义域名邮箱/);
    assert.match(WALINE_EMAIL_FIELDS.smtpHost.tooltip, /不是博客域名/);
  });

  it('wires WalineForm through the shared field copy', () => {
    assert.match(formSrc, /WALINE_EMAIL_FIELDS/);
    assert.match(formSrc, /name=\{WALINE_EMAIL_FIELDS\.authorEmail\.name\}/);
    assert.match(formSrc, /name=\{WALINE_EMAIL_FIELDS\.senderEmail\.name\}/);
    assert.match(formSrc, /name=\{WALINE_EMAIL_FIELDS\.smtpPassword\.name\}/);
    assert.doesNotMatch(formSrc, /label="博主邮箱"/);
    assert.doesNotMatch(formSrc, /label="自定义发送邮件的发件地址"/);
    assert.doesNotMatch(formSrc, /发送邮件使用的 smtp 密码/);
  });

  it('points the comment-settings card at custom-domain mailbox setup', () => {
    assert.match(tabSrc, /自定义域名邮箱/);
    assert.match(tabSrc, /博主邮箱/);
    assert.match(tabSrc, /发件地址/);
  });

  it('documents the admin path, fields, and Waline SMTP docs', () => {
    assert.match(WALINE_NOTIFICATION_DOCS_URL, /waline\.js\.org/);
    assert.match(WALINE_SERVER_ENV_DOCS_URL, /waline\.js\.org/);

    for (const doc of [commentDocs, usageFaq]) {
      assert.match(doc, /评论设置/);
      assert.match(doc, /自定义域名/);
      assert.match(doc, /博主邮箱/);
      assert.match(doc, /发件地址/);
      assert.match(doc, /SMTP/);
      assert.match(doc, /授权码|应用专用密码/);
      assert.match(doc, /waline\.js\.org\/guide\/features\/notification/);
    }
  });
});
