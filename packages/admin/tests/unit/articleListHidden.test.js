const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

describe('admin article list hidden column (#268)', () => {
  it('shows 是否隐藏 on the first-level table and toggles via updateArticle', () => {
    const src = readFileSync(path.join(__dirname, '../../src/pages/Article/columns.jsx'), 'utf8');
    assert.match(src, /title:\s*'是否隐藏'/);
    assert.match(src, /dataIndex:\s*'hidden'/);
    assert.match(src, /updateArticle\(/);
    assert.match(src, /hidden:\s*checked/);
    assert.match(src, /articleKeys[\s\S]*'hidden'/);
    assert.match(src, /articleKeysSmall[\s\S]*'hidden'/);
    assert.match(src, /data-article-hidden-toggle/);
  });

  it('documents the list-page toggle in article docs and FAQ', () => {
    const articleDocs = readFileSync(path.join(__dirname, '../../../../docs/features/article.md'), 'utf8');
    const faq = readFileSync(path.join(__dirname, '../../../../docs/faq/usage.md'), 'utf8');
    assert.match(articleDocs, /文章管理一级表格有「是否隐藏」列/);
    assert.match(faq, /如何在文章列表里隐藏 \/ 取消隐藏/);
  });
});
