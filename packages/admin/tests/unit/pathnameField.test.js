const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  PATHNAME_ADMIN_HINT,
  PATHNAME_FIELD,
  pathnameFromFrontMatter,
} = require('../../src/utils/pathnameField');

const repoRoot = path.join(__dirname, '../../../..');
const fieldSrc = readFileSync(
  path.join(__dirname, '../../src/components/PathnameField/index.jsx'),
  'utf8',
);
const updateModalSrc = readFileSync(
  path.join(__dirname, '../../src/components/UpdateModal/index.tsx'),
  'utf8',
);
const newArticleSrc = readFileSync(
  path.join(__dirname, '../../src/components/NewArticleModal/index.jsx'),
  'utf8',
);
const publishDraftSrc = readFileSync(
  path.join(__dirname, '../../src/components/PublishDraftModal/index.jsx'),
  'utf8',
);
const importArticleSrc = readFileSync(
  path.join(__dirname, '../../src/components/ImportArticleModal/index.jsx'),
  'utf8',
);
const parseMarkdownSrc = readFileSync(
  path.join(__dirname, '../../src/services/van-blog/parseMarkdownFile.jsx'),
  'utf8',
);
const articleDocs = readFileSync(path.join(repoRoot, 'docs/features/article.md'), 'utf8');
const migrateDocs = readFileSync(path.join(repoRoot, 'docs/advanced/migrate.md'), 'utf8');
const seoDocs = readFileSync(path.join(repoRoot, 'docs/advanced/seo.md'), 'utf8');
const usageFaq = readFileSync(path.join(repoRoot, 'docs/faq/usage.md'), 'utf8');

describe('pathname / Hugo slug field copy (#487)', () => {
  it('keeps the article field name aligned with Article.pathname', () => {
    assert.equal(PATHNAME_FIELD.name, 'pathname');
  });

  it('states Hugo /post/:slug, default numeric id, and SEO migration', () => {
    assert.match(PATHNAME_ADMIN_HINT, /修改信息/);
    assert.match(PATHNAME_FIELD.label, /自定义路径名/);
    assert.match(PATHNAME_FIELD.label, /slug/);
    assert.match(PATHNAME_FIELD.placeholder, /id/i);
    assert.match(PATHNAME_FIELD.tooltip, /\/post\/\[此项\]|\/post\/\[/);
    assert.match(PATHNAME_FIELD.tooltip, /Hugo/);
    assert.match(PATHNAME_FIELD.tooltip, /:slug/);
    assert.match(PATHNAME_FIELD.tooltip, /SEO/);
    assert.match(PATHNAME_FIELD.tooltip, /数字 id|数字 ID/);
    assert.match(PATHNAME_FIELD.tooltip, /没有站点级|没有.*固定链接模板/);
  });

  it('wires create / edit / publish / import through the shared field', () => {
    assert.match(fieldSrc, /PATHNAME_FIELD/);
    assert.match(fieldSrc, /label=\{PATHNAME_FIELD\.label\}/);
    assert.match(updateModalSrc, /PathnameField/);
    assert.match(newArticleSrc, /PathnameField/);
    assert.match(newArticleSrc, /name="pathnameC"/);
    assert.match(publishDraftSrc, /PathnameField/);
    assert.match(importArticleSrc, /PathnameField/);
    assert.doesNotMatch(updateModalSrc, /label="自定义路径名"/);
    assert.doesNotMatch(newArticleSrc, /label="自定义路径名"/);
    assert.doesNotMatch(publishDraftSrc, /label="自定义路径名"/);
  });

  it('maps Hugo Front Matter slug / pathname /post url onto pathname', () => {
    assert.match(parseMarkdownSrc, /pathnameFromFrontMatter/);
    assert.equal(pathnameFromFrontMatter({ slug: 'my-old-post' }), 'my-old-post');
    assert.equal(pathnameFromFrontMatter({ pathname: 'custom-path' }), 'custom-path');
    assert.equal(pathnameFromFrontMatter({ pathname: 'custom-path', slug: 'ignored' }), 'custom-path');
    assert.equal(pathnameFromFrontMatter({ url: '/post/from-url' }), 'from-url');
    assert.equal(pathnameFromFrontMatter({ url: 'https://example.com/post/from-abs' }), 'from-abs');
    assert.equal(pathnameFromFrontMatter({ slug: '/post/nested-slug' }), 'nested-slug');
    assert.equal(pathnameFromFrontMatter({ slug: '  hello-world  ' }), 'hello-world');
    assert.equal(pathnameFromFrontMatter({ url: '/post/2020/01/title' }), '');
    assert.equal(pathnameFromFrontMatter({}), '');
  });

  it('documents admin path, default id, Hugo permalink, and Front Matter mapping', () => {
    for (const doc of [articleDocs, migrateDocs, usageFaq]) {
      assert.match(doc, /自定义路径名/);
      assert.match(doc, /Hugo/);
      assert.match(doc, /\/post\/:slug|\/post\/<slug>/);
      assert.match(doc, /数字 id|数字ID|数字 ID/i);
      assert.match(doc, /修改信息/);
    }
    assert.match(usageFaq, /从 Hugo 迁移固定链接/);
    assert.match(seoDocs, /自定义路径名/);
    assert.match(seoDocs, /Hugo/);
    assert.match(articleDocs, /slug \/ pathname/);
    assert.match(migrateDocs, /slug \/ pathname/);
  });
});
