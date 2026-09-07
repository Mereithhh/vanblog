import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { contrastRatio, parseCssColor } from "../utils/colorContrast";
import {
  MERMAID_DARK_CANVAS,
  MERMAID_DARK_LINE,
  MERMAID_DARK_NODE_FILL,
  MERMAID_DARK_TEXT,
  MERMAID_DARK_THEME_VARIABLES,
  MERMAID_LIGHT_CANVAS,
  MERMAID_THEME_ATTR,
  MERMAID_THEME_CLASS_DARK,
  MERMAID_THEME_CLASS_LIGHT,
  applyMermaidThemeClass,
  applyMermaidThemeToTree,
  detectPaintIsDark,
  isDarkPaintTheme,
  mermaidInitConfig,
  mermaidThemeName,
} from "../utils/mermaidTheme";
import { mermaidForViewer } from "../components/Markdown/mermaidViewer";

const WCAG_AA_NORMAL_TEXT = 4.5;
const WCAG_UI_CONTRAST = 3;

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) => readFileSync(path.join(websiteRoot, rel), "utf8");

function mockEl(className = "") {
  const classes = new Set(className.split(/\s+/).filter(Boolean));
  const attrs: Record<string, string> = {};
  return {
    classList: {
      add: (name: string) => {
        classes.add(name);
      },
      remove: (name: string) => {
        classes.delete(name);
      },
      contains: (name: string) => classes.has(name),
    },
    setAttribute: (name: string, value: string) => {
      attrs[name] = value;
    },
    getAttribute: (name: string) => attrs[name],
    get className() {
      return [...classes].join(" ");
    },
  };
}

describe("mermaid paint-theme detection", () => {
  it("treats dark / auto-dark as dark and light as light", () => {
    expect(isDarkPaintTheme("dark")).toBe(true);
    expect(isDarkPaintTheme("auto-dark")).toBe(true);
    expect(isDarkPaintTheme("light")).toBe(false);
    expect(isDarkPaintTheme("auto-light")).toBe(false);
    expect(isDarkPaintTheme(undefined)).toBe(false);
  });

  it("reads the document dark class and a .dark ancestor", () => {
    expect(
      detectPaintIsDark(null, { classList: { contains: (n) => n === "dark" } })
    ).toBe(true);
    expect(
      detectPaintIsDark(null, { classList: { contains: () => false } })
    ).toBe(false);
    expect(
      detectPaintIsDark(
        { closest: (sel) => (sel === ".dark" ? {} : null) },
        { classList: { contains: () => false } }
      )
    ).toBe(true);
  });
});

describe("mermaid init config", () => {
  it("uses mermaid theme dark plus contrast variables when the site is dark", () => {
    const cfg = mermaidInitConfig(true);
    expect(cfg.theme).toBe("dark");
    expect(mermaidThemeName(true)).toBe("dark");
    expect(cfg.themeVariables).toMatchObject({
      darkMode: true,
      background: MERMAID_DARK_CANVAS,
      primaryTextColor: MERMAID_DARK_TEXT,
      lineColor: MERMAID_DARK_LINE,
      primaryColor: MERMAID_DARK_NODE_FILL,
    });
    expect(cfg.themeVariables).toEqual(MERMAID_DARK_THEME_VARIABLES);
  });

  it("keeps mermaid default theme in light mode and does not force dark variables", () => {
    const cfg = mermaidInitConfig(false);
    expect(cfg.theme).toBe("default");
    expect(mermaidThemeName(false)).toBe("default");
    expect(cfg.themeVariables).toBeUndefined();
  });
});

describe("mermaid container theme class / attr", () => {
  it("marks a dark-mode mermaid container with the dark theme class and config attr", () => {
    const el = mockEl("bytemd-mermaid");
    applyMermaidThemeClass(el, true);
    expect(el.classList.contains(MERMAID_THEME_CLASS_DARK)).toBe(true);
    expect(el.classList.contains(MERMAID_THEME_CLASS_LIGHT)).toBe(false);
    expect(el.getAttribute(MERMAID_THEME_ATTR)).toBe("dark");
  });

  it("marks a light-mode mermaid container without the dark theme class", () => {
    const el = mockEl("bytemd-mermaid mermaid-theme-dark");
    applyMermaidThemeClass(el, false);
    expect(el.classList.contains(MERMAID_THEME_CLASS_LIGHT)).toBe(true);
    expect(el.classList.contains(MERMAID_THEME_CLASS_DARK)).toBe(false);
    expect(el.getAttribute(MERMAID_THEME_ATTR)).toBe("default");
  });

  it("applies the contract to mermaid / bytemd-mermaid / language-mermaid nodes", () => {
    const diagram = mockEl("bytemd-mermaid");
    const fence = mockEl("language-mermaid");
    const legacy = mockEl("mermaid");
    const ignored = mockEl("hljs");
    const root = {
      querySelectorAll: (sel: string) => {
        expect(sel).toContain(".bytemd-mermaid");
        return [diagram, fence, legacy];
      },
    };
    expect(applyMermaidThemeToTree(root, true)).toBe(3);
    expect(diagram.getAttribute(MERMAID_THEME_ATTR)).toBe("dark");
    expect(fence.getAttribute(MERMAID_THEME_ATTR)).toBe("dark");
    expect(legacy.getAttribute(MERMAID_THEME_ATTR)).toBe("dark");
    expect(ignored.getAttribute(MERMAID_THEME_ATTR)).toBeUndefined();
  });
});

describe("public mermaid viewer wiring", () => {
  it("exposes a bytemd plugin whose viewerEffect paints with mermaid theme config", () => {
    const plugin = mermaidForViewer({ theme: "dark" });
    expect(typeof plugin.viewerEffect).toBe("function");
    expect(plugin).toHaveProperty("actions");
  });

  it("public Markdown viewer uses mermaidForViewer instead of unthemed mermaid()", () => {
    const src = readSrc("components/Markdown/index.tsx");
    expect(src).toMatch(/mermaidForViewer\(\s*\{\s*theme/);
    expect(src).toMatch(/key=\{paintKey\}/);
    expect(src).not.toMatch(/mermaid\(\s*\)/);
  });
});

describe("dark-mode mermaid contrast contract", () => {
  const markdownCss = readSrc("styles/github-markdown.css");
  const publicCss = readSrc("public/markdown.css");

  it("dark node text and strokes meet WCAG against the mermaid canvas / fill", () => {
    expect(
      contrastRatio(MERMAID_DARK_TEXT, MERMAID_DARK_NODE_FILL)
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    expect(
      contrastRatio(MERMAID_DARK_TEXT, MERMAID_DARK_CANVAS)
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    expect(
      contrastRatio(MERMAID_DARK_LINE, MERMAID_DARK_CANVAS)
    ).toBeGreaterThanOrEqual(WCAG_UI_CONTRAST);
    expect(parseCssColor(MERMAID_LIGHT_CANVAS)).toEqual([255, 255, 255]);
  });

  it("github-markdown.css gives dark mermaid containers a dark canvas and light text", () => {
    expect(markdownCss).toMatch(
      /\.dark \.bytemd-mermaid[\s\S]*background-color:\s*#26282c/
    );
    expect(markdownCss).toMatch(
      /\.dark \.mermaid-theme-dark[\s\S]*background-color:\s*#26282c/
    );
    expect(markdownCss).toMatch(/\.dark \.bytemd-mermaid[\s\S]*color:\s*#e6edf3/);
    expect(markdownCss).toMatch(
      /\.mermaid-theme-light\s*\{[\s\S]*background-color:\s*white/
    );
  });

  it("keeps the same mermaid dark canvas in the RSS markdown.css copy", () => {
    expect(publicCss).toMatch(
      /\.dark \.bytemd-mermaid[\s\S]*background-color:\s*#26282c/
    );
    expect(publicCss).toMatch(/\.dark \.mermaid-theme-dark[\s\S]*color:\s*#e6edf3/);
  });

  it("does not change the #541 fenced-code dark token colors", () => {
    const darkCss = readSrc("styles/code-dark.css");
    expect(darkCss).toMatch(/\.hljs-regexp[\s\S]*#d16969/);
    expect(darkCss).not.toMatch(/#9a5334/i);
    expect(darkCss).not.toContain("mermaid");
  });
});
