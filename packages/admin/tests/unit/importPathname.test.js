const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const fm = require('front-matter');
const { pathnameFromFrontMatter } = require('../../src/services/van-blog/importPathname');

const adminSrc = path.join(__dirname, '../../src');

function parseFm(markdown) {
  return fm(markdown).attributes;
}

describe('pathnameFromFrontMatter (#383)', () => {
  it('defaults pathname from hexo-addlink abbrlink', () => {
    assert.equal(pathnameFromFrontMatter({ abbrlink: 'cb933e30' }), 'cb933e30');
    assert.equal(
      pathnameFromFrontMatter(
        parseFm('---\ntitle: 迁移\nabbrlink: cb933e30\n---\n\nbody\n'),
      ),
      'cb933e30',
    );
  });

  it('prefers an explicit pathname over abbrlink', () => {
    assert.equal(
      pathnameFromFrontMatter({ pathname: 'my-post', abbrlink: 'cb933e30' }),
      'my-post',
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
    assert.equal(pathnameFromFrontMatter({ permalink: '/archives/cb933e30.html' }), undefined);
    assert.equal(pathnameFromFrontMatter({ path: 'cb933e30' }), undefined);
    assert.equal(pathnameFromFrontMatter({ abbrlink: ['cb933e30'] }), undefined);
  });

  it('wires import parse + modal to the same create-article pathname field', () => {
    const parseSrc = readFileSync(
      path.join(adminSrc, 'services/van-blog/parseMarkdownFile.jsx'),
      'utf8',
    );
    assert.match(parseSrc, /pathnameFromFrontMatter/);
    assert.match(parseSrc, /vals\.pathname = pathname/);

    const importSrc = readFileSync(
      path.join(adminSrc, 'components/ImportArticleModal/index.jsx'),
      'utf8',
    );
    const createSrc = readFileSync(
      path.join(adminSrc, 'components/NewArticleModal/index.jsx'),
      'utf8',
    );
    assert.match(importSrc, /id="pathname"/);
    assert.match(importSrc, /name="pathname"/);
    assert.match(importSrc, /label="自定义路径名"/);
    assert.match(createSrc, /label="自定义路径名"/);
    assert.match(
      importSrc,
      /文章发布后的路径将为 \/post\/\[自定义路径名\]，如果未设置则使用文章 id 作为路径名/,
    );
    assert.match(
      createSrc,
      /文章发布后的路径将为 \/post\/\[自定义路径名\]，如果未设置则使用文章 id 作为路径名/,
    );
    assert.match(importSrc, /parseMarkdownFile/);
    assert.match(importSrc, /createArticle/);
  });
});
