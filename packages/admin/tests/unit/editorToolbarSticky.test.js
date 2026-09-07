const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const adminRoot = path.join(__dirname, '../..');
const tocCss = readFileSync(path.join(adminRoot, 'src/components/Editor/toc-viewport.css'), 'utf8');
const globalLess = readFileSync(path.join(adminRoot, 'src/global.less'), 'utf8');
const editorSrc = readFileSync(path.join(adminRoot, 'src/components/Editor/index.tsx'), 'utf8');
const tocPlugin = readFileSync(path.join(adminRoot, 'src/components/Editor/plugins/tocViewport.ts'), 'utf8');

describe('admin editor toolbar stays on long articles (#298)', () => {
  it('pins the ByteMD toolbar and contains editor chrome overflow', () => {
    assert.match(tocCss, /\.bytemd-toolbar\s*\{[\s\S]*position:\s*sticky/);
    assert.match(tocCss, /\.bytemd-toolbar\s*\{[\s\S]*top:\s*0/);
    assert.match(tocCss, /\.bytemd\s*\{[\s\S]*overflow:\s*clip\s*!important/);
    assert.match(tocCss, /\.bytemd-body\s*\{[\s\S]*min-height:\s*0/);
    assert.match(tocCss, /#298/);
  });

  it('locks the article editor layout so height:100% resolves against the viewport', () => {
    assert.match(globalLess, /#root:has\(\.editor-full\)/);
    assert.match(globalLess, /\.editor-full\s*\{[\s\S]*min-height:\s*0/);
    assert.match(globalLess, /\.editor-full\s*\{[\s\S]*overflow:\s*hidden/);
    assert.match(globalLess, /body \.editor-full \.bytemd/);
    assert.match(editorSrc, /editor-shell/);
  });

  it('resets layout ancestors on TOC heading jump, not only .bytemd-body', () => {
    assert.match(tocPlugin, /export function resetAncestorScroll/);
    assert.match(tocPlugin, /EDITOR_CHROME_SELECTORS[\s\S]*'\.bytemd'/);
    assert.match(tocPlugin, /resetAncestorScroll\(root/);
    assert.match(tocPlugin, /window\.scrollTo\(0, 0\)/);
  });
});
