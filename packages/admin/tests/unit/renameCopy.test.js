const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const adminSrc = path.join(__dirname, '../../src');
const repoRoot = path.join(__dirname, '../../../..');

const categorySrc = readFileSync(
  path.join(adminSrc, 'pages/DataManage/tabs/Category.jsx'),
  'utf8',
);
const tagSrc = readFileSync(path.join(adminSrc, 'pages/DataManage/tabs/Tag.jsx'), 'utf8');
const apiSrc = readFileSync(path.join(adminSrc, 'services/van-blog/api.js'), 'utf8');
const tagDocs = readFileSync(path.join(repoRoot, 'docs/features/tag.md'), 'utf8');
const usageFaq = readFileSync(path.join(repoRoot, 'docs/faq/usage.md'), 'utf8');

describe('admin rename copy (#194)', () => {
  it('uses 重命名 for category trigger, modal title, and confirm', () => {
    assert.match(categorySrc, /trigger=\{<a key=\{'editC' \+ record\.name\}>重命名<\/a>\}/);
    assert.match(categorySrc, /title=\{`重命名分类 "\$\{record\.name\}"`\}/);
    assert.match(categorySrc, /确定重命名分类 "\$\{record\.name\}" 吗？/);
    assert.doesNotMatch(categorySrc, /修改分类 "/);
    assert.doesNotMatch(categorySrc, /确定修改分类/);
    assert.doesNotMatch(categorySrc, /批量改名/);
  });

  it('uses 重命名 for tag trigger, modal title, and confirm', () => {
    assert.match(tagSrc, /trigger=\{<a key=\{'editC' \+ record\.name\}>重命名<\/a>\}/);
    assert.match(tagSrc, /title=\{`重命名标签 "\$\{record\.name\}"`\}/);
    assert.match(tagSrc, /确定重命名标签 "\$\{record\.name\}" 为 "\$\{values\.newName\}" 吗？/);
    assert.doesNotMatch(tagSrc, /批量改名/);
    assert.doesNotMatch(tagSrc, /批量修改标签/);
    assert.doesNotMatch(tagSrc, /确定修改标签/);
  });

  it('keeps category and tag rename API routes unchanged', () => {
    assert.match(apiSrc, /request\(`\/api\/admin\/category\/\$\{encodeQuerystring\(name\)\}`/);
    assert.match(apiSrc, /request\(`\/api\/admin\/tag\/\$\{name\}\?value=\$\{value\}`/);
    assert.match(categorySrc, /updateCategory\(record\.name, values\)/);
    assert.match(tagSrc, /updateTag\(record\.name, values\.newName\)/);
  });

  it('keeps docs and FAQ aligned with the unified 重命名 labels', () => {
    assert.match(tagDocs, /- 重命名: 对分类进行重命名/);
    assert.match(tagDocs, /- 重命名: 对标签进行重命名/);
    assert.match(tagDocs, /也可在「重命名」弹窗里改同一字段/);
    assert.doesNotMatch(tagDocs, /修改分类/);
    assert.doesNotMatch(tagDocs, /批量改名/);
    assert.doesNotMatch(tagDocs, /批量修改标签/);

    assert.match(usageFaq, /分类管理重命名后文章或草稿还是旧名称/);
    assert.match(usageFaq, /点「重命名」把分类从/);
    assert.doesNotMatch(usageFaq, /分类管理改名后文章或草稿还是旧名称/);
    assert.doesNotMatch(usageFaq, /批量改名/);
  });
});
