/** Mermaid theme / contrast helpers for admin preview (keep in sync with website/utils/mermaidTheme.ts). */

const MERMAID_THEME_DARK = 'dark';
const MERMAID_THEME_LIGHT = 'default';
const MERMAID_THEME_CLASS_DARK = 'mermaid-theme-dark';
const MERMAID_THEME_CLASS_LIGHT = 'mermaid-theme-light';
const MERMAID_THEME_ATTR = 'data-mermaid-theme';
const MERMAID_CONTAINER_SELECTOR =
  '.bytemd-mermaid, .mermaid, pre > code.language-mermaid';

const MERMAID_DARK_CANVAS = '#26282c';
const MERMAID_DARK_NODE_FILL = '#3d444d';
const MERMAID_DARK_TEXT = '#e6edf3';
const MERMAID_DARK_LINE = '#c9d1d9';

const MERMAID_DARK_THEME_VARIABLES = {
  darkMode: true,
  background: MERMAID_DARK_CANVAS,
  primaryColor: MERMAID_DARK_NODE_FILL,
  primaryTextColor: MERMAID_DARK_TEXT,
  primaryBorderColor: MERMAID_DARK_LINE,
  lineColor: MERMAID_DARK_LINE,
  secondaryColor: '#2d333b',
  secondaryTextColor: MERMAID_DARK_TEXT,
  tertiaryColor: '#1e1e1e',
  tertiaryTextColor: MERMAID_DARK_TEXT,
  noteBkgColor: MERMAID_DARK_NODE_FILL,
  noteTextColor: MERMAID_DARK_TEXT,
  noteBorderColor: MERMAID_DARK_LINE,
  textColor: MERMAID_DARK_TEXT,
  nodeTextColor: MERMAID_DARK_TEXT,
  mainBkg: MERMAID_DARK_NODE_FILL,
  nodeBorder: MERMAID_DARK_LINE,
  clusterBkg: '#1e1e1e',
  titleColor: MERMAID_DARK_TEXT,
  edgeLabelBackground: MERMAID_DARK_CANVAS,
  actorBkg: MERMAID_DARK_NODE_FILL,
  actorTextColor: MERMAID_DARK_TEXT,
  actorBorder: MERMAID_DARK_LINE,
  signalColor: MERMAID_DARK_LINE,
  labelTextColor: MERMAID_DARK_TEXT,
};

function isDarkPaintTheme(theme) {
  return typeof theme === 'string' && theme.includes('dark');
}

function mermaidThemeName(isDark) {
  return isDark ? MERMAID_THEME_DARK : MERMAID_THEME_LIGHT;
}

function mermaidInitConfig(isDark) {
  if (isDark) {
    return {
      startOnLoad: false,
      theme: MERMAID_THEME_DARK,
      themeVariables: { ...MERMAID_DARK_THEME_VARIABLES },
    };
  }
  return {
    startOnLoad: false,
    theme: MERMAID_THEME_LIGHT,
  };
}

function detectPaintIsDark(markdownBody, root) {
  const docRoot =
    root || (typeof document !== 'undefined' ? document.documentElement : null);
  if (docRoot && docRoot.classList && docRoot.classList.contains('dark')) {
    return true;
  }
  if (markdownBody && typeof markdownBody.closest === 'function' && markdownBody.closest('.dark')) {
    return true;
  }
  return false;
}

function applyMermaidThemeClass(el, isDark) {
  el.classList.add(isDark ? MERMAID_THEME_CLASS_DARK : MERMAID_THEME_CLASS_LIGHT);
  el.classList.remove(isDark ? MERMAID_THEME_CLASS_LIGHT : MERMAID_THEME_CLASS_DARK);
  el.setAttribute(MERMAID_THEME_ATTR, mermaidThemeName(isDark));
}

function applyMermaidThemeToTree(root, isDark) {
  const nodes = root.querySelectorAll(MERMAID_CONTAINER_SELECTOR);
  for (let i = 0; i < nodes.length; i += 1) {
    applyMermaidThemeClass(nodes[i], isDark);
  }
  return nodes.length;
}

module.exports = {
  MERMAID_THEME_DARK,
  MERMAID_THEME_LIGHT,
  MERMAID_THEME_CLASS_DARK,
  MERMAID_THEME_CLASS_LIGHT,
  MERMAID_THEME_ATTR,
  MERMAID_CONTAINER_SELECTOR,
  MERMAID_DARK_CANVAS,
  MERMAID_DARK_NODE_FILL,
  MERMAID_DARK_TEXT,
  MERMAID_DARK_LINE,
  MERMAID_DARK_THEME_VARIABLES,
  isDarkPaintTheme,
  mermaidThemeName,
  mermaidInitConfig,
  detectPaintIsDark,
  applyMermaidThemeClass,
  applyMermaidThemeToTree,
};
