const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  MERMAID_DARK_CANVAS,
  MERMAID_DARK_LINE,
  MERMAID_DARK_NODE_FILL,
  MERMAID_DARK_TEXT,
  MERMAID_THEME_ATTR,
  MERMAID_THEME_CLASS_DARK,
  MERMAID_THEME_CLASS_LIGHT,
  applyMermaidThemeClass,
  detectPaintIsDark,
  isDarkPaintTheme,
  mermaidInitConfig,
  mermaidThemeName,
} = require('../../src/components/Editor/plugins/mermaidTheme');

describe('admin mermaid theme', () => {
  it('maps site dark / auto-dark to mermaid theme dark', () => {
    assert.equal(isDarkPaintTheme('dark'), true);
    assert.equal(isDarkPaintTheme('auto-dark'), true);
    assert.equal(isDarkPaintTheme('light'), false);
    assert.equal(mermaidThemeName(true), 'dark');
    assert.equal(mermaidThemeName(false), 'default');
  });

  it('dark init config uses theme dark and high-contrast variables', () => {
    const cfg = mermaidInitConfig(true);
    assert.equal(cfg.theme, 'dark');
    assert.equal(cfg.themeVariables.darkMode, true);
    assert.equal(cfg.themeVariables.background, MERMAID_DARK_CANVAS);
    assert.equal(cfg.themeVariables.primaryTextColor, MERMAID_DARK_TEXT);
    assert.equal(cfg.themeVariables.lineColor, MERMAID_DARK_LINE);
    assert.equal(cfg.themeVariables.primaryColor, MERMAID_DARK_NODE_FILL);
  });

  it('light init config keeps mermaid default and omits dark variables', () => {
    const cfg = mermaidInitConfig(false);
    assert.equal(cfg.theme, 'default');
    assert.equal(cfg.themeVariables, undefined);
  });

  it('marks a container with the dark theme class and data-mermaid-theme', () => {
    const classes = new Set(['bytemd-mermaid']);
    const attrs = {};
    const el = {
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
      },
      setAttribute: (name, value) => {
        attrs[name] = value;
      },
    };
    applyMermaidThemeClass(el, true);
    assert.equal(classes.has(MERMAID_THEME_CLASS_DARK), true);
    assert.equal(classes.has(MERMAID_THEME_CLASS_LIGHT), false);
    assert.equal(attrs[MERMAID_THEME_ATTR], 'dark');
  });

  it('detects html.dark and a .dark ancestor for admin preview', () => {
    assert.equal(
      detectPaintIsDark(null, { classList: { contains: (name) => name === 'dark' } }),
      true,
    );
    assert.equal(
      detectPaintIsDark(
        { closest: (sel) => (sel === '.dark' ? {} : null) },
        { classList: { contains: () => false } },
      ),
      true,
    );
    assert.equal(
      detectPaintIsDark(null, { classList: { contains: () => false } }),
      false,
    );
  });
});
