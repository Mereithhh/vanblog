const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

describe('admin site setting page copy (#373)', () => {
  it('exposes friend-link and about copy fields on layout settings', () => {
    const src = readFileSync(
      path.join(__dirname, '../../src/components/SiteInfoForm/index.tsx'),
      'utf8',
    );
    assert.match(src, /name=\{'friendLinkIntro'\}/);
    assert.match(src, /友链页介绍文案/);
    assert.match(src, /name=\{'friendLinkApplyContent'\}/);
    assert.match(src, /友链页底部文案/);
    assert.match(src, /\{\{siteName\}\}/);
    assert.match(src, /\{\{description\}\}/);
    assert.match(src, /name=\{'aboutTitle'\}/);
    assert.match(src, /关于页标题/);
    assert.match(src, /编辑关于/);
  });
});
