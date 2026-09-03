import { describe, it, expect } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import math from "@bytemd/plugin-math-ssr";
import { Heading } from "../components/Markdown/heading";
import { parseNavStructure } from "../components/MarkdownTocBar/tools";
import {
  renderTocLabelHtml,
  tocLabelNeedsMath,
} from "../components/MarkdownTocBar/tocMath";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";

const COMPARE_MD = "## 比较 $A$<$B$\n\nbody\n";
const MIXED_MD =
  "## 由方程 $F(x,y)=0$ 确定的隐函数 $y=y(x)$\n\nbody\n";
const FRAC_MD = "## 偏导数 $\\frac{\\partial z}{\\partial x}$\n\nbody\n";
const DISPLAY_MD = "## Display $$E=mc^2$$\n\nbody\n";
const PLAIN_MD = "## Clean Title\n\nhello\n";
const NESTED_MD = `# 递归

## 顺序查找(线性查找)

# 排序

  ## 选择排序
`;

function headingDataIds(markdown: string): string[] {
  const ids: string[] = [];
  getProcessor({
    plugins: [
      gfm(),
      math(),
      Heading(),
      {
        rehype: (processor) =>
          processor.use(() => (tree: { children?: unknown[] }) => {
            const walk = (node: any) => {
              if (!node) return;
              if (node.type === "element" && /^h[1-6]$/.test(String(node.tagName || ""))) {
                const dataId = node.properties?.["data-id"];
                if (dataId) ids.push(String(dataId));
              }
              if (Array.isArray(node.children)) {
                node.children.forEach(walk);
              }
            };
            walk(tree);
          }),
      },
    ],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  }).processSync(markdown);
  return ids;
}

function visibleLabelWithoutKatex(html: string): string {
  return html
    .replace(/<span class="katex-mathml"[\s\S]*?<\/span>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x3C;/gi, "<")
    .trim();
}

describe("public TOC math labels (#264)", () => {
  it("keeps source $A$<$B$ on NavItem.text / data-id and renders KaTeX in the label", () => {
    const items = parseNavStructure(COMPARE_MD);
    expect(items).toHaveLength(1);
    expect(items[0].text).toBe("比较 $A$<$B$");
    expect(items[0].text).toContain("$A$");
    expect(items[0].text).toContain("$B$");
    expect(tocLabelNeedsMath(items[0].text)).toBe(true);

    const html = renderTocLabelHtml(items[0].text);
    expect(html).toMatch(/class="katex"/);
    expect(html).not.toContain("$A$");
    expect(html).not.toContain("$B$");
    expect(visibleLabelWithoutKatex(html)).not.toMatch(/\$A\$/);
    expect(visibleLabelWithoutKatex(html)).toMatch(/A/);
    expect(visibleLabelWithoutKatex(html)).toMatch(/B/);
  });

  it("renders mixed prose plus multiple inline formulas", () => {
    const items = parseNavStructure(MIXED_MD);
    expect(items[0].text).toBe("由方程 $F(x,y)=0$ 确定的隐函数 $y=y(x)$");
    const html = renderTocLabelHtml(items[0].text);
    expect(html).toMatch(/class="katex"/);
    expect(html).toContain("由方程");
    expect(html).toContain("确定的隐函数");
    expect(html).not.toContain("$F(x,y)=0$");
    expect(html).not.toContain("$y=y(x)$");
  });

  it("renders TeX commands such as \\\\frac in the TOC label", () => {
    const items = parseNavStructure(FRAC_MD);
    expect(items[0].text).toContain("$\\frac{\\partial z}{\\partial x}$");
    const html = renderTocLabelHtml(items[0].text);
    expect(html).toMatch(/class="katex"/);
    expect(html).not.toContain("$\\frac");
  });

  it("renders $$display$$ math in a heading label when present", () => {
    const items = parseNavStructure(DISPLAY_MD);
    expect(items[0].text).toContain("$$E=mc^2$$");
    const html = renderTocLabelHtml(items[0].text);
    expect(html).toMatch(/class="katex"/);
    expect(html).not.toContain("$$E=mc^2$$");
  });

  it("leaves headings without math unchanged", () => {
    const items = parseNavStructure(PLAIN_MD);
    expect(items[0].text).toBe("Clean Title");
    expect(tocLabelNeedsMath(items[0].text)).toBe(false);
    expect(renderTocLabelHtml(items[0].text)).toBe("Clean Title");
  });

  it("keeps nested TOC completeness for plain headings", () => {
    const toc = parseNavStructure(NESTED_MD);
    expect(toc.map((item) => `${item.level}:${item.text}`)).toEqual([
      "1:递归",
      "2:顺序查找(线性查找)",
      "1:排序",
      "2:选择排序",
    ]);
  });

  it("matches article Viewer heading data-id so TOC click/hash still use source TeX", () => {
    const items = parseNavStructure(COMPARE_MD);
    const bodyIds = headingDataIds(COMPARE_MD);
    expect(bodyIds).toEqual([items[0].text]);
    expect(bodyIds[0]).toBe("比较 $A$<$B$");
  });
});
