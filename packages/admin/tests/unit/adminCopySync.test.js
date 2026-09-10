const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const adminSrc = path.join(__dirname, '../../src');
const repoRoot = path.join(__dirname, '../../../..');

const systemConfigSrc = readFileSync(path.join(adminSrc, 'pages/SystemConfig/index.jsx'), 'utf8');
const customizingSrc = readFileSync(
  path.join(adminSrc, 'pages/SystemConfig/tabs/Customizing.jsx'),
  'utf8',
);
const siteInfoFormSrc = readFileSync(
  path.join(adminSrc, 'components/SiteInfoForm/index.tsx'),
  'utf8',
);
const dataManageSrc = readFileSync(path.join(adminSrc, 'pages/DataManage/index.jsx'), 'utf8');
const socialSrc = readFileSync(path.join(adminSrc, 'pages/DataManage/tabs/Social.jsx'), 'utf8');
const customizingDocs = readFileSync(path.join(repoRoot, 'docs/advanced/customizing.md'), 'utf8');
const usageFaq = readFileSync(path.join(repoRoot, 'docs/faq/usage.md'), 'utf8');
const socialDocs = readFileSync(path.join(repoRoot, 'docs/features/social.md'), 'utf8');
const configDocs = readFileSync(path.join(repoRoot, 'docs/reference/config.md'), 'utf8');

describe('admin copy sync (#197)', () => {
  it('uses 定制化 on the system-settings tab without renaming the route key', () => {
    assert.match(systemConfigSrc, /tab: '定制化'/);
    assert.match(systemConfigSrc, /key: 'customizing'/);
    assert.match(systemConfigSrc, /customizing: <Customizing \/>/);
    assert.doesNotMatch(systemConfigSrc, /客制化/);
  });

  it('uses 定制化 on layout toggle, tooltip, and save confirm', () => {
    assert.match(siteInfoFormSrc, /name=\{'enableCustomizing'\}/);
    assert.match(siteInfoFormSrc, /label="是否开启定制化功能"/);
    assert.match(siteInfoFormSrc, /通过定制化面板/);
    assert.doesNotMatch(siteInfoFormSrc, /客制化/);

    assert.match(customizingSrc, /打开了定制化功能/);
    assert.doesNotMatch(customizingSrc, /客制化/);
  });

  it('uses 社交媒体 on the data-manage tab without renaming the route key', () => {
    assert.match(dataManageSrc, /tab: '社交媒体'/);
    assert.match(dataManageSrc, /key: 'socials'/);
    assert.match(dataManageSrc, /socials: <Social \/>/);
    assert.doesNotMatch(dataManageSrc, /联系方式/);
  });

  it('uses 社交媒体 in the social editor header and custom-row copy', () => {
    assert.match(socialSrc, /headerTitle="社交媒体"/);
    assert.match(socialSrc, /自定义社交媒体需要填写显示名称/);
    assert.match(socialSrc, /自定义社交媒体的图标地址/);
    assert.match(socialSrc, /CUSTOM_SOCIAL_TYPE = 'custom'/);
    assert.doesNotMatch(socialSrc, /联系方式/);
  });

  it('keeps docs aligned with the admin 定制化 / 社交媒体 labels', () => {
    assert.match(customizingDocs, /是否开启定制化功能/);
    assert.match(customizingDocs, /站点管理\/系统设置\/定制化/);
    assert.doesNotMatch(customizingDocs, /客制化/);

    assert.match(usageFaq, /是否开启定制化功能/);
    assert.match(usageFaq, /系统设置 \/ 定制化/);
    assert.doesNotMatch(usageFaq, /客制化/);

    assert.match(configDocs, /是否开启定制化功能/);
    assert.match(configDocs, /通过定制化面板/);
    assert.doesNotMatch(configDocs, /客制化/);

    assert.match(socialDocs, /站点管理\/数据管理\/社交媒体/);
    assert.match(socialDocs, /## 自定义社交媒体/);
    assert.doesNotMatch(socialDocs, /联系方式/);
  });
});
