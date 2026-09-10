const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const fm = require('front-matter');
const {
  PATHNAME_FIELD,
  pathnameFromFrontMatter,
} = require('../../src/services/van-blog/importPathname');

const adminSrc = path.join(__dirname, '../../src');
const repoRoot = path.join(__dirname, '../../../..');

function parseFm(markdown) {
  return fm(markdown).attributes;
}

describe('pathnameFromFrontMatter (#383 / #487)', () => {
  it('defaults pathname from hexo-addlink abbrlink', () => {
    assert.equal(pathnameFromFrontMatter({ abbrlink: 'cb933e30' }), 'cb933e30');
    assert.equal(
      pathnameFromFrontMatter(
        parseFm('---\ntitle: 迁移\nabbrlink: cb933e30\n---\n\nbody\n'),
      ),
      'cb933e30',
    );
  });

  it('defaults pathname from Hugo slug', () => {
    assert.equal(pathnameFromFrontMatter({ slug: 'my-old-post' }), 'my-old-post');
    assert.equal(
      pathnameFromFrontMatter(
        parseFm('---\ntitle: Hugo 迁移\nslug: my-old-post\n---\n\nbody\n'),
      ),
      'my-old-post',
    );
    assert.equal(pathnameFromFrontMatter({ slug: '  hello-world  ' }), 'hello-world');
    assert.equal(pathnameFromFrontMatter({ slug: '/post/nested-slug' }), 'nested-slug');
  });

  it('defaults pathname from a simple /post/<slug> url', () => {
    assert.equal(pathnameFromFrontMatter({ url: '/post/from-url' }), 'from-url');
    assert.equal(pathnameFromFrontMatter({ url: '/post/from-url/' }), 'from-url');
    assert.equal(pathnameFromFrontMatter({ url: 'from-url' }), 'from-url');
    assert.equal(
      pathnameFromFrontMatter({ url: 'https://example.com/post/from-abs' }),
      'from-abs',
    );
    assert.equal(
      pathnameFromFrontMatter(
        parseFm('---\ntitle: Hugo url\nurl: /post/keep-slug\n---\n\nbody\n'),
      ),
      'keep-slug',
    );
  });

  it('prefers pathname, then slug, then url, then abbrlink', () => {
    assert.equal(
      pathnameFromFrontMatter({ pathname: 'my-post', abbrlink: 'cb933e30' }),
      'my-post',
    );
    assert.equal(
      pathnameFromFrontMatter({ pathname: 'my-post', slug: 'hugo-slug' }),
      'my-post',
    );
    assert.equal(
      pathnameFromFrontMatter({ slug: 'hugo-slug', url: '/post/from-url', abbrlink: 'cb933e30' }),
      'hugo-slug',
    );
    assert.equal(
      pathnameFromFrontMatter({ url: '/post/from-url', abbrlink: 'cb933e30' }),
      'from-url',
    );
  });

  it('stringifies a numeric abbrlink and trims whitespace', () => {
    assert.equal(pathnameFromFrontMatter({ abbrlink: 12345 }), '12345');
    assert.equal(pathnameFromFrontMatter({ pathname: '  hello-path  ' }), 'hello-path');
    assert.equal(pathnameFromFrontMatter({ abbrlink: '  cb933e30  ' }), 'cb933e30');
  });

  it('ignores empty, blank, or unrecognized aliases', () => {
    assert.equal(pathnameFromFrontMatter({}), undefined);
    assert.equal(pathnameFromFrontMatter(null), undefined);
    assert.equal(pathnameFromFrontMatter({ pathname: '' }), undefined);
    assert.equal(pathnameFromFrontMatter({ abbrlink: '   ' }), undefined);
    assert.equal(pathnameFromFrontMatter({ slug: '   ' }), undefined);
    assert.equal(pathnameFromFrontMatter({ permalink: '/archives/cb933e30.html' }), undefined);
    assert.equal(pathnameFromFrontMatter({ path: 'cb933e30' }), undefined);
    assert.equal(pathnameFromFrontMatter({ abbrlink: ['cb933e30'] }), undefined);
    assert.equal(pathnameFromFrontMatter({ url: '/post/2020/01/title' }), undefined);
    assert.equal(pathnameFromFrontMatter({ url: '/archives/cb933e30.html' }), undefined);
    assert.equal(pathnameFromFrontMatter({ aliases: 'my-old-post' }), undefined);
  });

  it('states Hugo /post/:slug, default numeric id, and SEO migration', () => {
    assert.equal(PATHNAME_FIELD.name, 'pathname');
    assert.equal(PATHNAME_FIELD.label, '自定义路径名');
    assert.match(PATHNAME_FIELD.placeholder, /Hugo/);
    assert.match(PATHNAME_FIELD.placeholder, /id/i);
    assert.match(PATHNAME_FIELD.tooltip, /\/post\/\[自定义路径名\]/);
    assert.match(PATHNAME_FIELD.tooltip, /Hugo/);
    assert.match(PATHNAME_FIELD.tooltip, /:slug/);
    assert.match(PATHNAME_FIELD.tooltip, /SEO/);
    assert.match(PATHNAME_FIELD.tooltip, /数字 id|数字 ID/);
    assert.match(PATHNAME_FIELD.tooltip, /没有站点级|没有.*固定链接模板/);
  });

  it('wires import parse + shared PathnameField on create / import / edit / publish', () => {
    const parseSrc = readFileSync(
      path.join(adminSrc, 'services/van-blog/parseMarkdownFile.jsx'),
      'utf8',
    );
    assert.match(parseSrc, /pathnameFromFrontMatter/);
    assert.match(parseSrc, /vals\.pathname = pathname/);

    const fieldSrc = readFileSync(
      path.join(adminSrc, 'components/PathnameField/index.jsx'),
      'utf8',
    );
    const importSrc = readFileSync(
      path.join(adminSrc, 'components/ImportArticleModal/index.jsx'),
      'utf8',
    );
    const createSrc = readFileSync(
      path.join(adminSrc, 'components/NewArticleModal/index.jsx'),
      'utf8',
    );
    const updateSrc = readFileSync(
      path.join(adminSrc, 'components/UpdateModal/index.tsx'),
      'utf8',
    );
    const publishSrc = readFileSync(
      path.join(adminSrc, 'components/PublishDraftModal/index.jsx'),
      'utf8',
    );

    assert.match(fieldSrc, /PATHNAME_FIELD/);
    assert.match(fieldSrc, /label=\{PATHNAME_FIELD\.label\}/);
    assert.match(importSrc, /PathnameField/);
    assert.match(createSrc, /PathnameField/);
    assert.match(createSrc, /name="pathnameC"/);
    assert.match(updateSrc, /PathnameField/);
    assert.match(publishSrc, /PathnameField/);
    assert.doesNotMatch(importSrc, /label="自定义路径名"/);
    assert.doesNotMatch(createSrc, /label="自定义路径名"/);
    assert.doesNotMatch(updateSrc, /label="自定义路径名"/);
    assert.doesNotMatch(publishSrc, /label="自定义路径名"/);
    assert.match(importSrc, /parseMarkdownFile/);
    assert.match(importSrc, /createArticle/);
  });

  it('documents Hugo permalink mapping in article / migrate / SEO / FAQ', () => {
    const articleDocs = readFileSync(path.join(repoRoot, 'docs/features/article.md'), 'utf8');
    const migrateDocs = readFileSync(path.join(repoRoot, 'docs/advanced/migrate.md'), 'utf8');
    const seoDocs = readFileSync(path.join(repoRoot, 'docs/advanced/seo.md'), 'utf8');
    const usageFaq = readFileSync(path.join(repoRoot, 'docs/faq/usage.md'), 'utf8');

    for (const doc of [articleDocs, migrateDocs, usageFaq]) {
      assert.match(doc, /自定义路径名/);
      assert.match(doc, /Hugo/);
      assert.match(doc, /\/post\/:slug|\/post\/<slug>/);
      assert.match(doc, /数字 id|数字ID|数字 ID/i);
    }
    assert.match(usageFaq, /从 Hugo 迁移固定链接/);
    assert.match(seoDocs, /自定义路径名/);
    assert.match(seoDocs, /Hugo/);
    assert.match(articleDocs, /slug/);
    assert.match(migrateDocs, /slug/);
    assert.match(articleDocs, /abbrlink/);
    assert.match(migrateDocs, /abbrlink/);
  });
});
