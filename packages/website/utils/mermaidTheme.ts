/** Mermaid theme / contrast helpers shared by the public viewer. */

export const MERMAID_THEME_DARK = "dark";
export const MERMAID_THEME_LIGHT = "default";
export const MERMAID_THEME_CLASS_DARK = "mermaid-theme-dark";
export const MERMAID_THEME_CLASS_LIGHT = "mermaid-theme-light";
export const MERMAID_THEME_ATTR = "data-mermaid-theme";
export const MERMAID_CONTAINER_SELECTOR =
  ".bytemd-mermaid, .mermaid, pre > code.language-mermaid";

/** Dark-page canvas; matches `.dark .markdown-body` `--color-canvas-default`. */
export const MERMAID_DARK_CANVAS = "#26282c";
/** Node / actor fill on dark diagrams. */
export const MERMAID_DARK_NODE_FILL = "#3d444d";
/** Labels and node text on dark diagrams. */
export const MERMAID_DARK_TEXT = "#e6edf3";
/** Edges / borders on dark diagrams. */
export const MERMAID_DARK_LINE = "#c9d1d9";
export const MERMAID_LIGHT_CANVAS = "#ffffff";

/**
 * High-contrast overrides on mermaid's built-in `theme: 'dark'`.
 * Default dark strokes are washed-out grey on VanBlog's canvas.
 */
export const MERMAID_DARK_THEME_VARIABLES = {
  darkMode: true,
  background: MERMAID_DARK_CANVAS,
  primaryColor: MERMAID_DARK_NODE_FILL,
  primaryTextColor: MERMAID_DARK_TEXT,
  primaryBorderColor: MERMAID_DARK_LINE,
  lineColor: MERMAID_DARK_LINE,
  secondaryColor: "#2d333b",
  secondaryTextColor: MERMAID_DARK_TEXT,
  tertiaryColor: "#1e1e1e",
  tertiaryTextColor: MERMAID_DARK_TEXT,
  noteBkgColor: MERMAID_DARK_NODE_FILL,
  noteTextColor: MERMAID_DARK_TEXT,
  noteBorderColor: MERMAID_DARK_LINE,
  textColor: MERMAID_DARK_TEXT,
  nodeTextColor: MERMAID_DARK_TEXT,
  mainBkg: MERMAID_DARK_NODE_FILL,
  nodeBorder: MERMAID_DARK_LINE,
  clusterBkg: "#1e1e1e",
  titleColor: MERMAID_DARK_TEXT,
  edgeLabelBackground: MERMAID_DARK_CANVAS,
  actorBkg: MERMAID_DARK_NODE_FILL,
  actorTextColor: MERMAID_DARK_TEXT,
  actorBorder: MERMAID_DARK_LINE,
  signalColor: MERMAID_DARK_LINE,
  labelTextColor: MERMAID_DARK_TEXT,
};

export function isDarkPaintTheme(theme?: string | null): boolean {
  return typeof theme === "string" && theme.includes("dark");
}

export function mermaidThemeName(isDark: boolean): "dark" | "default" {
  return isDark ? MERMAID_THEME_DARK : MERMAID_THEME_LIGHT;
}

export function mermaidInitConfig(isDark: boolean): {
  startOnLoad: false;
  theme: "dark" | "default";
  themeVariables?: typeof MERMAID_DARK_THEME_VARIABLES;
} {
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

export function detectPaintIsDark(
  markdownBody?: { closest?: (selector: string) => unknown } | null,
  root?: { classList?: { contains: (name: string) => boolean } } | null
): boolean {
  const docRoot =
    root ??
    (typeof document !== "undefined" ? document.documentElement : null);
  if (docRoot?.classList?.contains("dark")) {
    return true;
  }
  if (markdownBody?.closest?.(".dark")) {
    return true;
  }
  return false;
}

export function applyMermaidThemeClass(
  el: {
    classList: {
      add: (name: string) => void;
      remove: (name: string) => void;
    };
    setAttribute: (name: string, value: string) => void;
  },
  isDark: boolean
): void {
  el.classList.add(isDark ? MERMAID_THEME_CLASS_DARK : MERMAID_THEME_CLASS_LIGHT);
  el.classList.remove(
    isDark ? MERMAID_THEME_CLASS_LIGHT : MERMAID_THEME_CLASS_DARK
  );
  el.setAttribute(MERMAID_THEME_ATTR, mermaidThemeName(isDark));
}

export function applyMermaidThemeToTree(
  root: { querySelectorAll: (selector: string) => ArrayLike<{ classList: { add: (n: string) => void; remove: (n: string) => void }; setAttribute: (n: string, v: string) => void }> },
  isDark: boolean
): number {
  const nodes = root.querySelectorAll(MERMAID_CONTAINER_SELECTOR);
  for (let i = 0; i < nodes.length; i += 1) {
    applyMermaidThemeClass(nodes[i], isDark);
  }
  return nodes.length;
}

export function watchMermaidContainers(
  root: {
    querySelectorAll: (selector: string) => ArrayLike<{ classList: { add: (n: string) => void; remove: (n: string) => void }; setAttribute: (n: string, v: string) => void }>;
  } & { ownerDocument?: Document },
  isDark: boolean
): () => void {
  applyMermaidThemeToTree(root, isDark);
  if (typeof MutationObserver === "undefined") {
    return () => undefined;
  }
  const obs = new MutationObserver(() => applyMermaidThemeToTree(root, isDark));
  obs.observe(root as Node, { childList: true, subtree: true });
  return () => obs.disconnect();
}
