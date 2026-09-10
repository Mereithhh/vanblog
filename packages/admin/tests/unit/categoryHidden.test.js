const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

describe('admin category hidden column (#359)', () => {
  it('shows 是否隐藏 next to encrypt and toggles via updateCategory', () => {
    const src = readFileSync(
      path.join(__dirname, '../../src/pages/DataManage/tabs/Category.jsx'),
      'utf8',
    );
    assert.match(src, /title:\s*'是否隐藏'/);
    assert.match(src, /dataIndex:\s*'hidden'/);
    assert.match(src, /updateCategory\(/);
    assert.match(src, /hidden:\s*checked/);
    assert.match(src, /data-category-hidden-toggle/);
    assert.match(src, /title:\s*'加密'/);
    assert.match(src, /dataIndex:\s*'private'/);
  });

  it('documents hide category in category docs and FAQ', () => {
    const tagDocs = readFileSync(path.join(__dirname, '../../../../docs/features/tag.md'), 'utf8');
    const faq = readFileSync(path.join(__dirname, '../../../../docs/faq/usage.md'), 'utf8');
    assert.match(tagDocs, /隐藏分类/);
    assert.match(faq, /如何隐藏 \/ 取消隐藏分类/);
  });
});
