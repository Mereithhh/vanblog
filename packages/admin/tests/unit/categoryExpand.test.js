const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

describe('admin site setting defaultExpandAllCategories (#260)', () => {
  it('exposes 分类页默认展开全部分类 on layout settings', () => {
    const src = readFileSync(
      path.join(__dirname, '../../src/components/SiteInfoForm/index.tsx'),
      'utf8',
    );
    assert.match(src, /name=\{'defaultExpandAllCategories'\}/);
    assert.match(src, /分类页默认展开全部分类/);
    assert.match(src, /默认展开/);
    assert.match(src, /默认收起/);
  });
});
