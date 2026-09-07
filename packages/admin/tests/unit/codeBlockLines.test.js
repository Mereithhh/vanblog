const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  CODE_LINE_CLASS,
  CODE_LINE_CONTENT_CLASS,
  CODE_LINE_NUMBER_CLASS,
  applyLineNumbersToCodeNode,
  readFencedCodeText,
  wrapCodeChildrenWithLineNumbers,
} = require('../../src/components/Editor/plugins/codeBlockLines');

const adminRoot = path.join(__dirname, '../..');
const pluginSrc = readFileSync(
  path.join(adminRoot, 'src/components/Editor/plugins/codeBlock.tsx'),
  'utf8',
);
const markdownCss = readFileSync(path.join(adminRoot, 'src/style/github-markdown.css'), 'utf8');

describe('admin preview code-block line numbers (#404)', () => {
  it('wraps fenced children with line / number / content markers', () => {
    const wrapped = wrapCodeChildrenWithLineNumbers([{ type: 'text', value: 'a\nb' }]);
    assert.equal(wrapped.length, 2);
    assert.equal(wrapped[0].properties.class, CODE_LINE_CLASS);
    assert.equal(wrapped[0].properties.dataLine, '1');
    assert.equal(wrapped[0].children[0].properties.class, CODE_LINE_NUMBER_CLASS);
    assert.equal(wrapped[0].children[0].properties.ariaHidden, 'true');
    assert.equal(wrapped[0].children[1].properties.class, CODE_LINE_CONTENT_CLASS);
    const code = {
      type: 'element',
      tagName: 'code',
      children: [{ type: 'text', value: 'only' }],
    };
    applyLineNumbersToCodeNode(code);
    assert.equal(code.children[0].properties.dataLine, '1');
  });

  it('copies line contents without gutter numbers', () => {
    assert.equal(
      readFencedCodeText({
        querySelectorAll: () => [{ textContent: 'const answer = 42;' }, { textContent: 'const again = 7;' }],
        innerText: '1const answer = 42;\n2const again = 7;',
      }),
      'const answer = 42;\nconst again = 7;',
    );
  });

  it('wires the shared helper into the admin ByteMD codeBlock plugin', () => {
    assert.match(pluginSrc, /applyLineNumbersToCodeNode/);
    assert.match(pluginSrc, /CODE_BLOCK_LINE_NUMBERS_CLASS/);
    assert.match(pluginSrc, /readFencedCodeText/);
    assert.match(pluginSrc, /if \(language === 'mermaid'\) return/);
  });

  it('keeps theme-safe gutter colors and mermaid dark canvas', () => {
    assert.match(markdownCss, /\.light \.markdown-body \.code-line-number\s*\{[\s\S]*color:\s*#57606a/);
    assert.match(markdownCss, /\.dark \.markdown-body \.code-line-number\s*\{[\s\S]*color:\s*#9b9b9b/);
    assert.match(markdownCss, /\.dark \.bytemd-mermaid[\s\S]*background-color:\s*#26282c/);
    assert.match(markdownCss, /\.dark \.bytemd-mermaid[\s\S]*color:\s*#e6edf3/);
  });
});
