const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const {
  TAG_TOKEN_SEPARATORS,
  TAG_FIELD_PLACEHOLDER,
  TAG_FIELD_TOOLTIP,
  splitTagInput,
} = require('../../src/services/van-blog/tagTokens');

const adminSrc = path.join(__dirname, '../../src');

const TAG_FORM_FILES = [
  'components/NewArticleModal/index.jsx',
  'components/NewDraftModal/index.jsx',
  'components/UpdateModal/index.tsx',
  'components/ImportArticleModal/index.jsx',
  'components/ImportDraftModal/index.jsx',
  'components/TagSelectField/index.jsx',
];

function walkJsFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(full));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('tag token separators (#489)', () => {
  it('includes English/Chinese commas, semicolons, and newlines, but not space', () => {
    assert.deepEqual([...TAG_TOKEN_SEPARATORS], [',', '，', ';', '；', '\n', '\r']);
    assert.equal(TAG_TOKEN_SEPARATORS.includes(' '), false);
    assert.equal(TAG_TOKEN_SEPARATORS.includes('\t'), false);
  });

  it('splits mixed English/Chinese commas into trimmed tags', () => {
    assert.deepEqual(splitTagInput('tag1,tag2，tag3'), ['tag1', 'tag2', 'tag3']);
    assert.deepEqual(splitTagInput('tag1, tag2， tag3'), ['tag1', 'tag2', 'tag3']);
  });

  it('splits semicolons and newlines, including CRLF', () => {
    assert.deepEqual(splitTagInput('a;b；c'), ['a', 'b', 'c']);
    assert.deepEqual(splitTagInput('one\ntwo\nthree'), ['one', 'two', 'three']);
    assert.deepEqual(splitTagInput('one\r\ntwo\r\nthree'), ['one', 'two', 'three']);
  });

  it('keeps multi-word tags because space is not a separator', () => {
    assert.deepEqual(splitTagInput('machine learning,deep learning'), [
      'machine learning',
      'deep learning',
    ]);
    assert.deepEqual(splitTagInput('React Hooks'), ['React Hooks']);
  });

  it('drops empty tokens and trims surrounding whitespace', () => {
    assert.deepEqual(splitTagInput('  ,tag1,,，tag2；  '), ['tag1', 'tag2']);
    assert.deepEqual(splitTagInput('\n\nfoo\n\n'), ['foo']);
    assert.deepEqual(splitTagInput(''), []);
    assert.deepEqual(splitTagInput('   '), []);
    assert.deepEqual(splitTagInput(null), []);
    assert.deepEqual(splitTagInput(undefined), []);
  });

  it('documents bulk paste in placeholder and tooltip', () => {
    assert.match(TAG_FIELD_PLACEHOLDER, /粘贴/);
    assert.match(TAG_FIELD_PLACEHOLDER, /逗号/);
    assert.match(TAG_FIELD_TOOLTIP, /粘贴多个标签/);
    assert.match(TAG_FIELD_TOOLTIP, /空格不会拆开/);
  });

  it('wires every article/draft tag Select through the shared field', () => {
    for (const rel of TAG_FORM_FILES.slice(0, 5)) {
      const src = readFileSync(path.join(adminSrc, rel), 'utf8');
      assert.match(src, /TagSelectField/);
      assert.doesNotMatch(src, /tokenSeparators=\{\[','\]\}/);
      assert.doesNotMatch(src, /请选择或输入标签/);
    }

    const fieldSrc = readFileSync(path.join(adminSrc, 'components/TagSelectField/index.jsx'), 'utf8');
    assert.match(fieldSrc, /TAG_TOKEN_SEPARATORS/);
    assert.match(fieldSrc, /TAG_FIELD_PLACEHOLDER/);
    assert.match(fieldSrc, /TAG_FIELD_TOOLTIP/);
    assert.match(fieldSrc, /mode="tags"/);
  });

  it('does not leave comma-only tag separators on other article forms', () => {
    const leftover = [];
    for (const file of walkJsFiles(path.join(adminSrc, 'components'))) {
      const src = readFileSync(file, 'utf8');
      if (src.includes("tokenSeparators={[',']}")) {
        leftover.push(path.relative(adminSrc, file));
      }
    }
    assert.deepEqual(leftover, []);
  });
});
