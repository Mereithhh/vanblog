const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  applySoftBreaksToChange,
  completeSoftBreakLine,
  completeSoftBreaks,
  handleEditorSoftBreakChange,
  isInsideCodeFenceFromDoc,
  isSoftLineBreaksEnabled,
  shouldCompleteSoftBreak,
  shouldHandleSoftBreakChange,
  softLineBreaksPlugin,
} = require('../../src/components/Editor/plugins/softLineBreaks');

const adminRoot = path.join(__dirname, '../..');
const editorSrc = readFileSync(path.join(adminRoot, 'src/components/Editor/index.tsx'), 'utf8');
const modalSrc = readFileSync(
  path.join(adminRoot, 'src/components/EditorProfileModal/index.tsx'),
  'utf8',
);
const editorPageSrc = readFileSync(path.join(adminRoot, 'src/pages/Editor/index.jsx'), 'utf8');

describe('soft line-break helper (#311)', () => {
  it('treats missing or closed preference as disabled', () => {
    assert.equal(isSoftLineBreaksEnabled(undefined), false);
    assert.equal(isSoftLineBreaksEnabled('close'), false);
    assert.equal(isSoftLineBreaksEnabled(false), false);
    assert.equal(isSoftLineBreaksEnabled('open'), true);
    assert.equal(isSoftLineBreaksEnabled(true), true);
  });

  it('returns source unchanged when the toggle is disabled', () => {
    const src = 'hello\nworld\n# title\n';
    assert.equal(completeSoftBreaks(src, 'close'), src);
    assert.equal(completeSoftBreaks(src, false), src);
    assert.equal(completeSoftBreaks(src, undefined), src);
    assert.equal(completeSoftBreakLine('hello', { inCodeFence: true }), 'hello');
  });

  it('pads consecutive paragraph lines when enabled', () => {
    assert.equal(completeSoftBreaks('hello\nworld', 'open'), 'hello  \nworld');
    assert.equal(completeSoftBreaks('hello\nworld\n', true), 'hello  \nworld\n');
    assert.equal(completeSoftBreakLine('hello'), 'hello  ');
    assert.equal(completeSoftBreakLine('hello '), 'hello  ');
    assert.equal(completeSoftBreakLine('already  '), 'already  ');
  });

  it('does not rewrite blank lines, headings, fences, or existing breaks', () => {
    const src = [
      '# Title',
      'para one',
      '',
      'para two',
      '```js',
      'const x = 1;',
      'const y = 2;',
      '```',
      'after',
      '<!-- more -->',
      ':::tip',
      'hi',
      ':::',
      '---',
      'Setext',
      '=====',
    ].join('\n');

    assert.equal(
      completeSoftBreaks(src, 'open'),
      [
        '# Title',
        'para one',
        '',
        'para two',
        '```js',
        'const x = 1;',
        'const y = 2;',
        '```',
        'after',
        '<!-- more -->',
        ':::tip',
        'hi',
        ':::',
        '---',
        'Setext',
        '=====',
      ].join('\n'),
    );
    assert.equal(shouldCompleteSoftBreak('# Title'), false);
    assert.equal(shouldCompleteSoftBreak('```js'), false);
    assert.equal(shouldCompleteSoftBreak('<!-- more -->'), false);
    assert.equal(shouldCompleteSoftBreak('hello  '), false);
    assert.equal(shouldCompleteSoftBreak('hello\\'), false);
    assert.equal(shouldCompleteSoftBreak('hello', { inCodeFence: true }), false);
  });

  it('tracks fenced regions from a document slice', () => {
    const lines = ['intro', '```', 'code', '```', 'out'];
    assert.equal(
      isInsideCodeFenceFromDoc((i) => lines[i], lines.length, 2),
      true,
    );
    assert.equal(
      isInsideCodeFenceFromDoc((i) => lines[i], lines.length, 4),
      false,
    );
  });

  it('only rewrites Enter and paste/drop, never setValue/undo/redo', () => {
    assert.equal(shouldHandleSoftBreakChange({ origin: 'setValue', text: ['a', 'b'] }), false);
    assert.equal(shouldHandleSoftBreakChange({ origin: 'undo', text: ['', ''] }), false);
    assert.equal(shouldHandleSoftBreakChange({ origin: 'redo', text: ['', ''] }), false);
    assert.equal(shouldHandleSoftBreakChange({ origin: '+input', text: ['', ''] }), true);
    assert.equal(shouldHandleSoftBreakChange({ origin: 'paste', text: ['a', 'b'] }), true);
    assert.equal(shouldHandleSoftBreakChange({ origin: '+input', text: ['x'] }), false);
  });

  it('pads a plain Enter at the end of a paragraph', () => {
    assert.deepEqual(
      applySoftBreaksToChange({
        enabled: 'open',
        origin: '+input',
        changeText: ['', ''],
        linePrefix: 'hello',
        lineSuffix: '',
        inCodeFence: false,
      }),
      ['  ', ''],
    );
    assert.equal(
      applySoftBreaksToChange({
        enabled: 'close',
        origin: '+input',
        changeText: ['', ''],
        linePrefix: 'hello',
      }),
      null,
    );
    assert.equal(
      applySoftBreaksToChange({
        enabled: 'open',
        origin: '+input',
        changeText: ['', ''],
        linePrefix: '# Title',
      }),
      null,
    );
  });

  it('pads pasted paragraph lines but leaves the last fragment alone', () => {
    assert.deepEqual(
      applySoftBreaksToChange({
        enabled: true,
        origin: 'paste',
        changeText: ['one', 'two', 'three'],
        linePrefix: '',
        lineSuffix: '',
        inCodeFence: false,
      }),
      ['one  ', 'two  ', 'three'],
    );
    assert.equal(
      applySoftBreaksToChange({
        enabled: true,
        origin: 'paste',
        changeText: ['one', 'two', 'three'],
        linePrefix: '',
        inCodeFence: true,
      }),
      null,
    );
  });

  it('calls change.update when a pad is needed', () => {
    const calls = [];
    const change = {
      origin: '+input',
      text: ['', ''],
      from: { line: 0, ch: 5 },
      to: { line: 0, ch: 5 },
      update(from, to, text) {
        calls.push({ from, to, text });
      },
    };
    assert.equal(
      handleEditorSoftBreakChange(change, {
        enabled: 'open',
        linePrefix: 'hello',
        lineSuffix: '',
        inCodeFence: false,
      }),
      true,
    );
    assert.deepEqual(calls[0].text, ['  ', '']);

    assert.equal(
      handleEditorSoftBreakChange(
        { origin: '+input', text: ['', ''], update() {} },
        { enabled: 'close', linePrefix: 'hello' },
      ),
      false,
    );
  });

  it('wires the preference through the editor page, modal, and ByteMD plugin', () => {
    assert.match(editorPageSrc, /softLineBreaks:\s*'close'/);
    assert.match(editorPageSrc, /softLineBreaks=\{editorConfig/);
    assert.match(modalSrc, /name="softLineBreaks"/);
    assert.match(modalSrc, /id="softLineBreaks"/);
    assert.match(editorSrc, /softLineBreaksPlugin/);
    assert.doesNotMatch(editorSrc, /^import breaks from '@bytemd\/plugin-breaks'/m);
    const plugin = softLineBreaksPlugin({ enabled: 'close' });
    assert.equal(typeof plugin.editorEffect, 'function');
    assert.equal(plugin.editorEffect({}), undefined);
  });
});
