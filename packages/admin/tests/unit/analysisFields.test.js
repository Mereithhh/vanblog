const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  ANALYSIS_ADMIN_PATH,
  GA_ANALYSIS_FIELD,
  BAIDU_ANALYSIS_FIELD,
} = require('../../src/utils/analysisFields');

const repoRoot = path.join(__dirname, '../../../..');
const formSrc = readFileSync(
  path.join(__dirname, '../../src/components/SiteInfoForm/index.tsx'),
  'utf8',
);
const visitorDocs = readFileSync(path.join(repoRoot, 'docs/features/visitor.md'), 'utf8');
const usageFaq = readFileSync(path.join(repoRoot, 'docs/faq/usage.md'), 'utf8');
const customizingDocs = readFileSync(
  path.join(repoRoot, 'docs/advanced/customizing.md'),
  'utf8',
);
const configDocs = readFileSync(path.join(repoRoot, 'docs/reference/config.md'), 'utf8');

describe('analytics field copy (#350)', () => {
  it('keeps site-info field names aligned with SiteInfo / layout props', () => {
    assert.equal(GA_ANALYSIS_FIELD.name, 'gaAnalysisId');
    assert.equal(BAIDU_ANALYSIS_FIELD.name, 'baiduAnalysisId');
  });

  it('states the GA4 G- measurement ID format and where to paste it', () => {
    assert.match(ANALYSIS_ADMIN_PATH, /站点配置/);
    assert.match(ANALYSIS_ADMIN_PATH, /高级设置/);
    assert.match(GA_ANALYSIS_FIELD.label, /Google Analytics/);
    assert.match(GA_ANALYSIS_FIELD.label, /测量 ID/);
    assert.match(GA_ANALYSIS_FIELD.placeholder, /G-XXXXXXXXX/);
    assert.match(GA_ANALYSIS_FIELD.tooltip, /G-XXXXXXXXX/);
    assert.match(GA_ANALYSIS_FIELD.tooltip, /UA-/);
    assert.match(GA_ANALYSIS_FIELD.tooltip, /大陆|网络|地区/);
    assert.match(GA_ANALYSIS_FIELD.tooltip, /实时/);
    assert.match(GA_ANALYSIS_FIELD.tooltip, /Umami/);
  });

  it('wires SiteInfoForm through the shared field copy', () => {
    assert.match(formSrc, /GA_ANALYSIS_FIELD/);
    assert.match(formSrc, /BAIDU_ANALYSIS_FIELD/);
    assert.match(formSrc, /name=\{GA_ANALYSIS_FIELD\.name\}/);
    assert.match(formSrc, /name=\{BAIDU_ANALYSIS_FIELD\.name\}/);
    assert.doesNotMatch(formSrc, /label="Google Analysis ID"/);
    assert.doesNotMatch(formSrc, /label="Baidu 分析 ID"/);
  });

  it('documents G- format, mainland no-data, admin path, and Umami via 定制化', () => {
    for (const doc of [visitorDocs, usageFaq, configDocs]) {
      assert.match(doc, /G-XXXXXXXXX/);
      assert.match(doc, /高级设置/);
      assert.match(doc, /测量 ID|Google Analytics/);
    }
    assert.match(usageFaq, /尚未收到数据|没有数据/);
    assert.match(usageFaq, /大陆/);
    assert.match(usageFaq, /实时/);
    assert.match(usageFaq, /Umami/);
    assert.match(visitorDocs, /Umami/);
    assert.match(customizingDocs, /umami/i);
    assert.match(customizingDocs, /data-website-id/);
    assert.match(customizingDocs, /自定义 HTML \(head\)|自定义 HTML（head）|定制化/);
  });
});
