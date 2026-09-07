import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { contrastRatio, parseCssColor } from "../utils/colorContrast";

const WCAG_AA_NORMAL_TEXT = 4.5;

const websiteRoot = path.join(__dirname, "..");

const readStyle = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

type CssRule = {
  selectors: string[];
  color?: string;
  background?: string;
  vars: Record<string, string>;
};

function parseCssRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  const re = /([^{}]+)\{([^{}]+)\}/g;
  const src = stripComments(css);
  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    const selectors = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = match[2];
    const color = body.match(/(?:^|[;\s])color\s*:\s*([^;]+)/i)?.[1]?.trim();
    const background = body.match(
      /(?:^|[;\s])background(?:-color)?\s*:\s*([^;]+)/i
    )?.[1]?.trim();
    const vars: Record<string, string> = {};
    const varRe = /(--[a-z0-9-]+)\s*:\s*([^;]+)/gi;
    let varMatch: RegExpExecArray | null;
    while ((varMatch = varRe.exec(body))) {
      vars[varMatch[1]] = varMatch[2].trim();
    }
    rules.push({ selectors, color, background, vars });
  }
  return rules;
}

/** Last simple selector is `className`, e.g. `.dark .hljs-keyword` → `.hljs-keyword`. */
function colorForClass(rules: CssRule[], className: string): string | undefined {
  const hits: { color: string; depth: number }[] = [];
  for (const rule of rules) {
    if (!rule.color) continue;
    for (const sel of rule.selectors) {
      const parts = sel.split(/\s+/);
      if (parts[parts.length - 1] === className) {
        hits.push({ color: rule.color, depth: parts.length });
      }
    }
  }
  hits.sort((a, b) => a.depth - b.depth);
  return hits[0]?.color;
}

function customProperty(
  rules: CssRule[],
  selector: string,
  prop: string
): string | undefined {
  for (const rule of rules) {
    if (rule.selectors.includes(selector) && rule.vars[prop]) {
      return rule.vars[prop];
    }
  }
}

function resolveDarkCodePanelBackground(): string {
  const darkRules = parseCssRules(readStyle("styles/code-dark.css"));
  const markdownRules = parseCssRules(readStyle("styles/github-markdown.css"));
  const globalCss = readStyle("styles/globals.css");

  const hljsBg = darkRules.find((r) =>
    r.selectors.some((s) => s.split(/\s+/).pop() === ".hljs")
  )?.background;
  if (hljsBg && parseCssColor(hljsBg)) return hljsBg;

  const canvas = customProperty(
    markdownRules,
    ".dark .markdown-body",
    "--color-canvas-subtle"
  );
  if (canvas && parseCssColor(canvas)) return canvas;

  const darkCard = globalCss.match(
    /\.bg-dark\s*\{[^}]*background-color:\s*([^;]+)/
  )?.[1]?.trim();
  if (darkCard && parseCssColor(darkCard)) return darkCard;

  throw new Error("Could not resolve the dark code-block background");
}

function resolveLightCodePanelBackground(): string {
  const lightRules = parseCssRules(readStyle("styles/code-light.css"));
  const markdownRules = parseCssRules(readStyle("styles/github-markdown.css"));

  const hljsBg = lightRules.find((r) =>
    r.selectors.some((s) => s.split(/\s+/).pop() === ".hljs")
  )?.background;
  if (hljsBg && parseCssColor(hljsBg)) return hljsBg;

  const canvas = customProperty(
    markdownRules,
    ".light .markdown-body",
    "--color-canvas-subtle"
  );
  if (canvas && parseCssColor(canvas)) return canvas;

  throw new Error("Could not resolve the light code-block background");
}

describe("colorContrast helper", () => {
  it("parses hex, rgb, and named colors", () => {
    expect(parseCssColor("#dcdcdc")).toEqual([220, 220, 220]);
    expect(parseCssColor("#fff")).toEqual([255, 255, 255]);
    expect(parseCssColor("rgb(30, 30, 30)")).toEqual([30, 30, 30]);
    expect(parseCssColor("rgb(30 30 30)")).toEqual([30, 30, 30]);
    expect(parseCssColor("green")).toEqual([0, 128, 0]);
    expect(parseCssColor("inherit")).toBeNull();
  });

  it("matches WCAG reference contrast pairs", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#000", "white")).toBeCloseTo(21, 5);
    expect(contrastRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT
    );
    expect(contrastRatio("#777777", "#ffffff")).toBeLessThan(WCAG_AA_NORMAL_TEXT);
  });
});

describe("public fenced-code contrast", () => {
  const darkCss = readStyle("styles/code-dark.css");
  const lightCss = readStyle("styles/code-light.css");
  const markdownCss = readStyle("styles/github-markdown.css");
  const darkRules = parseCssRules(darkCss);
  const lightRules = parseCssRules(lightCss);
  const darkBg = resolveDarkCodePanelBackground();
  const lightBg = resolveLightCodePanelBackground();

  it("measures tokens against the real pre / canvas-subtle panel", () => {
    expect(markdownCss).toMatch(
      /\.markdown-body\s+pre\s*\{[\s\S]*background-color:\s*var\(--color-canvas-subtle\)/
    );
    expect(parseCssColor(darkBg)).toEqual([30, 30, 30]);
    expect(parseCssColor(lightBg)).toEqual([246, 248, 250]);
    expect(darkCss).toMatch(/\.hljs\s*\{[^}]*background:\s*inherit/);
  });

  it.each([
    [".hljs", "default text"],
    [".hljs-keyword", "keyword"],
    [".hljs-string", "string"],
    [".hljs-comment", "comment"],
    [".hljs-regexp", "regexp"],
    [".hljs-doctag", "doctag"],
    [".header-right", "language / copy chrome"],
    [".language-tag", "language label"],
  ])("dark %s (%s) is ≥ 4.5:1", (className) => {
    const color = colorForClass(darkRules, className);
    expect(color).toBeTruthy();
    expect(contrastRatio(color as string, darkBg)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT
    );
  });

  it("every dark hljs color token meets AA against the code panel", () => {
    const checked: string[] = [];
    for (const rule of darkRules) {
      if (!rule.color || !parseCssColor(rule.color)) continue;
      const hljsSelectors = rule.selectors.filter((s) =>
        s.split(/\s+/).some((part) => part.startsWith(".hljs"))
      );
      if (hljsSelectors.length === 0) continue;
      const ratio = contrastRatio(rule.color, darkBg);
      if (ratio < WCAG_AA_NORMAL_TEXT) {
        throw new Error(
          `${hljsSelectors.join(", ")} color ${rule.color} on ${darkBg} is ${ratio.toFixed(2)}:1`
        );
      }
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      checked.push(...hljsSelectors);
    }
    expect(checked.length).toBeGreaterThan(4);
  });

  it.each([
    [".hljs", "default text"],
    [".hljs-keyword", "keyword"],
    [".hljs-string", "string"],
    [".hljs-comment", "comment"],
  ])("light %s (%s) is ≥ 4.5:1", (className) => {
    const color = colorForClass(lightRules, className);
    expect(color).toBeTruthy();
    expect(contrastRatio(color as string, lightBg)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT
    );
  });

  it("does not hard-code the old low-contrast rust on dark regexp tokens", () => {
    expect(darkCss).not.toMatch(/#9a5334/i);
    expect(darkCss).not.toMatch(/#608b4e/i);
    expect(colorForClass(darkRules, ".hljs-regexp")).toBe("#d16969");
  });

  it("does not pin the language chrome to the old #6f7177 inline color", () => {
    const codeBlock = readStyle("components/Markdown/codeBlock.tsx");
    expect(codeBlock).not.toMatch(/#6f7177/);
    expect(codeBlock).toMatch(/header-right/);
  });
});
