const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  BYTEMD_SPLIT_MIN_WIDTH,
  MOBILE_TOOLBAR_ACTIONS,
  MOBILE_TOOLBAR_CLASS,
  applyToolbarAction,
  insertUploadedImages,
  isByteMDTabMode,
  mobileToolbarPlugin,
  syncMobileToolbar,
} = require('../../src/components/Editor/plugins/mobileToolbar');

const adminRoot = path.join(__dirname, '../..');
const editorSrc = readFileSync(path.join(adminRoot, 'src/components/Editor/index.tsx'), 'utf8');
const mobileCss = readFileSync(path.join(adminRoot, 'src/components/Editor/mobile-toolbar.css'), 'utf8');
const tocCss = readFileSync(path.join(adminRoot, 'src/components/Editor/toc-viewport.css'), 'utf8');

const MOBILE_IDS = MOBILE_TOOLBAR_ACTIONS.map((action) => action.id);
const DESKTOP_ONLY = [
  'mermaid',
  '表情',
  '自定义高亮块',
  '外链图片转存',
  '插入 more 标记',
  '撤销',
  '重做',
  '表格',
  '任务列表',
  '删除线',
];

function mockCtx() {
  const calls = [];
  return {
    calls,
    wrapText(...args) {
      calls.push(['wrapText', args]);
    },
    replaceLines(fn) {
      calls.push(['replaceLines', fn('hello', 0)]);
    },
    appendBlock(text) {
      calls.push(['appendBlock', text]);
      return { line: 3 };
    },
    editor: {
      focus() {
        calls.push(['focus']);
      },
      setSelection(from, to) {
        calls.push(['setSelection', from, to]);
      },
    },
    codemirror: {
      Pos(line, ch) {
        return { line, ch };
      },
    },
  };
}

function makeToolbarRoot(tabMode) {
  const tab = { className: 'bytemd-toolbar-tab', querySelector() { return null; } };
  const left = {
    className: 'bytemd-toolbar-left',
    children: tabMode ? [tab] : [],
    querySelector(sel) {
      if (sel === '.bytemd-toolbar-tab') {
        return this.children.find((child) => child.className === 'bytemd-toolbar-tab') || null;
      }
      if (sel === `.${MOBILE_TOOLBAR_CLASS}`) {
        return this.children.find((child) => child.className === MOBILE_TOOLBAR_CLASS) || null;
      }
      return null;
    },
    appendChild(el) {
      this.children.push(el);
      return el;
    },
  };
  return {
    left,
    querySelector(sel) {
      if (sel === '.bytemd-toolbar-left') return left;
      if (sel === '.bytemd-toolbar-tab') return left.querySelector(sel);
      if (sel === `.${MOBILE_TOOLBAR_CLASS}`) return left.querySelector(sel);
      return null;
    },
  };
}

describe('admin editor mobile toolbar (#504)', () => {
  it('curates common actions and does not dump the desktop plugin row', () => {
    assert.equal(BYTEMD_SPLIT_MIN_WIDTH, 800);
    assert.deepEqual(MOBILE_IDS, [
      'heading',
      'bold',
      'italic',
      'quote',
      'link',
      'image',
      'ul',
      'code',
    ]);
    assert.ok(MOBILE_TOOLBAR_ACTIONS.some((action) => action.title === '粗体'));
    assert.ok(MOBILE_TOOLBAR_ACTIONS.some((action) => action.title === '链接'));
    assert.ok(MOBILE_TOOLBAR_ACTIONS.some((action) => action.title === '图片'));
    const serialized = JSON.stringify(MOBILE_TOOLBAR_ACTIONS);
    DESKTOP_ONLY.forEach((name) => {
      assert.equal(serialized.includes(name), false, `mobile set should not include ${name}`);
    });
    assert.ok(MOBILE_TOOLBAR_ACTIONS.length < 12);
  });

  it('applies the same markdown transforms ByteMD uses on desktop', () => {
    const bold = mockCtx();
    applyToolbarAction(bold, 'bold');
    assert.deepEqual(bold.calls[0], ['wrapText', ['**']]);
    assert.ok(bold.calls.some((call) => call[0] === 'focus'));

    const italic = mockCtx();
    applyToolbarAction(italic, 'italic');
    assert.deepEqual(italic.calls[0], ['wrapText', ['*']]);

    const link = mockCtx();
    applyToolbarAction(link, 'link');
    assert.deepEqual(link.calls[0], ['wrapText', ['[', '](url)']]);

    const code = mockCtx();
    applyToolbarAction(code, 'code');
    assert.deepEqual(code.calls[0], ['wrapText', ['`']]);

    const quote = mockCtx();
    applyToolbarAction(quote, 'quote');
    assert.deepEqual(quote.calls[0], ['replaceLines', '> hello']);

    const list = mockCtx();
    applyToolbarAction(list, 'ul');
    assert.deepEqual(list.calls[0], ['replaceLines', '- hello']);

    const heading = mockCtx();
    applyToolbarAction(heading, 'heading', 2);
    assert.deepEqual(heading.calls[0], ['replaceLines', '## hello']);

    const unknown = mockCtx();
    applyToolbarAction(unknown, 'mermaid');
    assert.deepEqual(unknown.calls, []);
  });

  it('inserts uploaded images at the caret via appendBlock', () => {
    const ctx = mockCtx();
    insertUploadedImages(ctx, [{ url: '/static/a.png', alt: 'shot', title: 'shot' }]);
    assert.equal(ctx.calls[0][0], 'appendBlock');
    assert.match(ctx.calls[0][1], /!\[shot\]\(\/static\/a\.png "shot"\)/);
  });

  it('mounts the extra row only in ByteMD tab mode', () => {
    assert.equal(isByteMDTabMode({ querySelector: (sel) => (sel.includes('toolbar-tab') ? {} : null) }), true);
    assert.equal(isByteMDTabMode({ querySelector: () => null }), false);
    assert.equal(isByteMDTabMode(null), false);

    const mobile = makeToolbarRoot(true);
    const created = [];
    const attachRemove = (bar, parent) => {
      bar.remove = () => {
        const idx = parent.children.indexOf(bar);
        if (idx >= 0) parent.children.splice(idx, 1);
      };
      return bar;
    };
    const mobileState = syncMobileToolbar(mobile, () => {
      const bar = attachRemove({ className: MOBILE_TOOLBAR_CLASS }, mobile.left);
      created.push(bar);
      return bar;
    });
    assert.equal(mobileState.mounted, true);
    assert.equal(created.length, 1);
    assert.equal(syncMobileToolbar(mobile, () => created[0]).mounted, true);
    assert.equal(created.length, 1);

    const desktop = makeToolbarRoot(false);
    attachRemove(created[0], desktop.left);
    desktop.left.children.push(created[0]);
    const desktopState = syncMobileToolbar(desktop, () => created[0]);
    assert.equal(desktopState.mounted, false);
    assert.equal(desktop.left.querySelector(`.${MOBILE_TOOLBAR_CLASS}`), null);
  });

  it('wires mode=auto plus the plugin, and keeps the sticky toolbar CSS', () => {
    assert.match(editorSrc, /mode="auto"/);
    assert.match(editorSrc, /mobileToolbarPlugin/);
    assert.match(editorSrc, /mobile-toolbar\.css/);
    assert.match(mobileCss, /#504/);
    assert.match(mobileCss, /overflow-x:\s*auto/);
    assert.match(mobileCss, /:has\(\.vanblog-mobile-toolbar\)/);
    assert.doesNotMatch(mobileCss, /\.bytemd-toolbar-left\s+\.bytemd-toolbar-icon\s*\{[^}]*display:\s*none/);
    assert.match(tocCss, /\.bytemd-toolbar\s*\{[\s\S]*position:\s*sticky/);
    const plugin = mobileToolbarPlugin({});
    assert.equal(typeof plugin.editorEffect, 'function');
    assert.equal(plugin.editorEffect({}), undefined);
  });
});
