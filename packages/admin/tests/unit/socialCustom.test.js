const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const socialSrc = readFileSync(
  path.join(__dirname, '../../src/pages/DataManage/tabs/Social.jsx'),
  'utf8',
);
const apiSrc = readFileSync(path.join(__dirname, '../../src/services/van-blog/api.js'), 'utf8');

describe('admin custom social editor (#394)', () => {
  it('lets the table edit display name, url, and optional icon', () => {
    assert.match(socialSrc, /dataIndex: 'label'/);
    assert.match(socialSrc, /显示名称/);
    assert.match(socialSrc, /dataIndex: 'icon'/);
    assert.match(socialSrc, /图标 URL/);
    assert.match(socialSrc, /自定义社交媒体需要填写显示名称/);
    assert.match(socialSrc, /CUSTOM_SOCIAL_TYPE = 'custom'/);
  });

  it('saves label / icon / id with the existing social update API', () => {
    assert.match(socialSrc, /label: data\.label/);
    assert.match(socialSrc, /icon: data\.icon/);
    assert.match(socialSrc, /id: data\.id/);
    assert.match(socialSrc, /await updateSocial\(toSaveObj\)/);
    assert.match(socialSrc, /socialRowKey\(record\)/);
  });

  it('deletes by encoded id or builtin type so custom keys stay unique', () => {
    assert.match(apiSrc, /\/api\/admin\/meta\/social\/\$\{encodeURIComponent\(name\)\}/);
    assert.match(socialSrc, /deleteSocial\(socialRowKey\(record\)\)/);
  });
});
