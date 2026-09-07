import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import {
  CODE_BLOCK_LINE_NUMBERS_CLASS,
  CODE_LINE_CLASS,
  CODE_LINE_CONTENT_CLASS,
  CODE_LINE_NUMBER_CLASS,
  applyLineNumbersToCodeNode,
  customCodeBlock,
  readCodeFromCopyButton,
  wrapCodeChildrenWithLineNumbers,
} from "../components/Markdown/codeBlock";
import { readFencedCodeText } from "../components/Markdown/codeBlockLines";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";
import { contrastRatio, parseCssColor } from "../utils/colorContrast";

const WCAG_AA_NORMAL_TEXT = 4.5;

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) => readFileSync(path.join(websiteRoot, rel), "utf8");

const FENCED_JS = "```js\nconst answer = 42;\nconst again = 7;\n```\n";
const FENCED_BLANK = "```js\nfirst\n\nthird\n```\n";
const FENCED_MERMAID = "```mermaid\ngraph TD\n  A-->B\n```\n";

function renderPublicCode(markdown: string, withHighlight = true) {
  return getProcessor({
    plugins: withHighlight
      ? [gfm(), highlight(), customCodeBlock()]
      : [gfm(), customCodeBlock()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

function countAttr(html: string, re: RegExp) {
  return (html.match(re) || []).length;
}

describe("wrapCodeChildrenWithLineNumbers", () => {
  it("numbers plain text lines and drops a trailing newline", () => {
    const wrapped = wrapCodeChildrenWithLineNumbers([
      { type: "text", value: "alpha\nbeta\n" },
    ]);
    expect(wrapped).toHaveLength(2);
    expect(wrapped[0].properties).toMatchObject({
      class: CODE_LINE_CLASS,
      dataLine: "1",
    });
    expect(wrapped[1].properties?.dataLine).toBe("2");
    const numbers = wrapped.map(
      (line) => (line.children?.[0].children?.[0] as { value?: string }).value
    );
    expect(numbers).toEqual(["1", "2"]);
    expect(wrapped[0].children?.[0].properties?.ariaHidden).toBe("true");
    expect(wrapped[0].children?.[1].properties?.class).toBe(CODE_LINE_CONTENT_CLASS);
  });

  it("keeps highlight spans on the correct line", () => {
    const wrapped = wrapCodeChildrenWithLineNumbers([
      {
        type: "element",
        tagName: "span",
        properties: { className: ["hljs-keyword"] },
        children: [{ type: "text", value: "const" }],
      },
      { type: "text", value: " x = 1;\n" },
      {
        type: "element",
        tagName: "span",
        properties: { className: ["hljs-keyword"] },
        children: [{ type: "text", value: "const" }],
      },
      { type: "text", value: " y = 2;" },
    ]);
    expect(wrapped).toHaveLength(2);
    const firstContent = wrapped[0].children?.[1].children || [];
    expect(firstContent[0]).toMatchObject({
      tagName: "span",
      properties: { className: ["hljs-keyword"] },
    });
  });

  it("applies markers on a code node and skips non-code nodes", () => {
    const code = {
      type: "element",
      tagName: "code",
      properties: { className: ["language-js"] },
      children: [{ type: "text", value: "one\ntwo" }],
    };
    applyLineNumbersToCodeNode(code);
    expect(code.children).toHaveLength(2);
    applyLineNumbersToCodeNode({ type: "element", tagName: "pre" });
  });
});

describe("public fenced-code line numbers (#404)", () => {
  it("emits line markers, classes, and aria-hidden gutters through the sanitizer", () => {
    const html = renderPublicCode(FENCED_JS);
    expect(html).toContain(`class="code-block-wrapper relative ${CODE_BLOCK_LINE_NUMBERS_CLASS}"`);
    expect(html).toMatch(/<span[^>]*class="code-line"[^>]*data-line="1"/);
    expect(html).toMatch(/<span[^>]*class="code-line"[^>]*data-line="2"/);
    expect(countAttr(html, /data-line="\d+"/g)).toBe(2);
    expect(html).toMatch(
      /<span[^>]*class="code-line-number"[^>]*aria-hidden="true"[^>]*>1<\/span>/
    );
    expect(html).toMatch(/<span[^>]*class="code-line-content"/);
    expect(html).toContain("const answer = 42;");
    expect(html).toContain("const again = 7;");
  });

  it("still numbers lines when highlight-ssr is in the public plugin list", () => {
    const html = renderPublicCode(FENCED_JS, true);
    expect(html).toMatch(/hljs/);
    expect(html).toMatch(/data-line="1"/);
    expect(html).toMatch(/data-line="2"/);
  });

  it("keeps a blank middle line numbered", () => {
    const html = renderPublicCode(FENCED_BLANK);
    expect(html).toMatch(/data-line="1"/);
    expect(html).toMatch(/data-line="2"/);
    expect(html).toMatch(/data-line="3"/);
    expect(html).toContain("first");
    expect(html).toContain("third");
  });

  it("does not add line numbers on mermaid fences", () => {
    const html = renderPublicCode(FENCED_MERMAID);
    expect(html).not.toContain(`class="${CODE_LINE_CLASS}"`);
    expect(html).not.toContain("data-line=");
    expect(html).toMatch(/language-mermaid/);
  });

  it("copies fenced text without gutter numbers", () => {
    expect(
      readFencedCodeText({
        querySelectorAll: (selector: string) => {
          expect(selector).toBe(`.${CODE_LINE_CONTENT_CLASS}`);
          return [{ textContent: "const answer = 42;" }, { textContent: "const again = 7;" }];
        },
        innerText: "1const answer = 42;\n2const again = 7;",
      })
    ).toBe("const answer = 42;\nconst again = 7;");

    expect(
      readCodeFromCopyButton({
        parentElement: {
          parentElement: {
            querySelector: () => ({ innerText: "const answer = 42;" }),
          },
        },
      })
    ).toBe("const answer = 42;");
  });
});

describe("line-number theme-safe contrast", () => {
  const markdownCss = readSrc("styles/github-markdown.css");
  const publicCss = readSrc("public/markdown.css");
  const darkCss = readSrc("styles/code-dark.css");

  it("gutter colors meet WCAG AA on the real code-panel backgrounds", () => {
    expect(markdownCss).toMatch(
      /\.light \.markdown-body \.code-line-number\s*\{[\s\S]*color:\s*#57606a/
    );
    expect(markdownCss).toMatch(
      /\.dark \.markdown-body \.code-line-number\s*\{[\s\S]*color:\s*#9b9b9b/
    );
    expect(contrastRatio("#57606a", "#f6f8fa")).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT
    );
    expect(contrastRatio("#9b9b9b", "rgb(30, 30, 30)")).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT
    );
    expect(parseCssColor("#57606a")).toEqual([87, 96, 106]);
    expect(parseCssColor("#9b9b9b")).toEqual([155, 155, 155]);
  });

  it("keeps the same gutter rules in the shared RSS markdown.css copy", () => {
    expect(publicCss).toMatch(
      /\.light \.markdown-body \.code-line-number\s*\{[\s\S]*color:\s*#57606a/
    );
    expect(publicCss).toMatch(
      /\.dark \.markdown-body \.code-line-number\s*\{[\s\S]*color:\s*#9b9b9b/
    );
  });

  it("does not regress #549 mermaid dark canvas or #541 regexp tokens", () => {
    expect(markdownCss).toMatch(
      /\.dark \.bytemd-mermaid[\s\S]*background-color:\s*#26282c/
    );
    expect(markdownCss).toMatch(/\.dark \.bytemd-mermaid[\s\S]*color:\s*#e6edf3/);
    expect(darkCss).toMatch(/\.hljs-regexp[\s\S]*#d16969/);
    expect(darkCss).not.toMatch(/#9a5334/i);
    expect(darkCss).not.toContain("code-line-number");
  });
});
