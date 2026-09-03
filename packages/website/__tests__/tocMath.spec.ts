import { describe, it, expect } from "vitest";
import { parseNavStructure } from "../components/MarkdownTocBar/tools";
import {
  renderTocLabelHtml,
  tocLabelNeedsMath,
} from "../components/MarkdownTocBar/tocMath";

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
  it("keeps source $A$<$B$ on NavItem.text and renders KaTeX in the visible label", () => {
    const items = parseNavStructure(COMPARE_MD);
    expect(items).toHaveLength(1);
    expect(items[0].text).toBe("比较 $A$<$B$");
    expect(items[0].text).toContain("$A$");
    expect(items[0].text).toContain("$B$");
    expect(tocLabelNeedsMath(items[0].text)).toBe(true);

    const html = renderTocLabelHtml(items[0].text);
    expect(html).toMatch(/class="katex"/);
    expect(html).toContain('class="katex"');
    expect((html.match(/class="katex"/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain("$A$");
    expect(html).not.toContain("$B$");
    expect(visibleLabelWithoutKatex(html)).not.toMatch(/\$A\$/);
    expect(visibleLabelWithoutKatex(html)).not.toContain("$");
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
});
