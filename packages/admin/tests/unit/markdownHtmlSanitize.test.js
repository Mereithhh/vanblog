const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const adminRoot = path.join(__dirname, '../..');
const editorSrc = readFileSync(
  path.join(adminRoot, 'src/components/Editor/index.tsx'),
  'utf8',
);
const websiteSanitize = readFileSync(
  path.join(adminRoot, '../website/utils/markdownSanitize.ts'),
  'utf8',
);
const adminCss = readFileSync(
  path.join(adminRoot, 'src/style/github-markdown.css'),
  'utf8',
);

describe('admin editor HTML-in-Markdown sanitizer (#490)', () => {
  it('allows underline/font and does not allow script', () => {
    assert.match(editorSrc, /tagNames\.push\('u'\)/);
    assert.match(editorSrc, /tagNames\.push\('font'\)/);
    assert.match(editorSrc, /tag !== 'script'/);
    assert.match(editorSrc, /schema\.strip[\s\S]*'script'/);
    assert.doesNotMatch(editorSrc, /tagNames\.push\('script'\)/);
  });

  it('uses the same extra tags as the public sanitizer', () => {
    assert.match(websiteSanitize, /"u"/);
    assert.match(websiteSanitize, /"font"/);
    assert.match(websiteSanitize, /MARKDOWN_FORBIDDEN_TAG_NAMES = \["script"\]/);
  });

  it('passes allowDangerousHtml so preview parses raw HTML like the public Viewer', () => {
    assert.match(editorSrc, /remarkRehype=\{\{\s*allowDangerousHtml:\s*true/);
    assert.match(adminCss, /\.markdown-body u\s*\{[\s\S]*text-decoration:\s*underline/);
  });
});
