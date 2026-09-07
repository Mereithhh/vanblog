const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

describe('admin site setting articlesPerPage (#346)', () => {
  it('exposes 每页文章数 on layout settings with 1–50 bounds', () => {
    const src = readFileSync(
      path.join(__dirname, '../../src/components/SiteInfoForm/index.tsx'),
      'utf8',
    );
    assert.match(src, /name=\{'articlesPerPage'\}/);
    assert.match(src, /每页文章数/);
    assert.match(src, /min=\{1\}/);
    assert.match(src, /max=\{50\}/);
  });
});
