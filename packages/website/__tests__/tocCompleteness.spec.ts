import { describe, it, expect } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import rawHTML from "../components/Markdown/rawHTML";
import { customContainer } from "../components/Markdown/customContainer";
import { LinkTarget } from "../components/Markdown/linkTarget";
import { Heading } from "../components/Markdown/heading";
import { parseNavStructure } from "../components/MarkdownTocBar/tools";
import { hasToc } from "../utils/hasToc";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";

/** Public article Viewer heading path, without mermaid/math (not needed for TOC). */
function renderArticle(markdown: string) {
  return getProcessor({
    plugins: [rawHTML(), gfm(), customContainer(), LinkTarget(), Heading()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

function renderedHeadingIds(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const re = /<h([1-6])\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const attrs = match[2];
    if (
      /\bid="footnote-label"/.test(attrs) ||
      /\bid="user-content-footnote-label"/.test(attrs) ||
      /\bsr-only\b/.test(attrs)
    ) {
      continue;
    }
    const dataId = attrs.match(/\bdata-id="([^"]*)"/);
    const text = (dataId ? dataId[1] : "").trim();
    if (!text) continue;
    headings.push({ level: Number(match[1]), text });
  }
  return headings;
}

const NESTED_MD = `# 递归

intro

## 顺序查找(线性查找)

body

# 排序

## 冒泡排序

  ## 选择排序

## 插入排序

  ## 快速排序

## 希尔排序

## 桶排序

# 数据结构

## 列表/数组

## 栈

## 队列

## 栈和队列的应用:迷宫问题

  ### 栈: 深度优先搜索

  ### 队列: 广度优先搜索

## 链表

  ### 双链表

## 总结：链表与顺序表

## 哈希表
`;

const INLINE_MD = `# Intro

## **Bold Title**

## Title with \`code\`

## [Link Heading](https://example.com)

## Closed Title ##
`;

describe("public TOC completeness vs rendered article headings (#409)", () => {
  it("lists every nested heading that the article body renders, including indented ATX", () => {
    const html = renderArticle(NESTED_MD);
    const body = renderedHeadingIds(html);
    const toc = parseNavStructure(NESTED_MD);

    expect(body.map((item) => `${item.level}:${item.text}`)).toEqual([
      "1:递归",
      "2:顺序查找(线性查找)",
      "1:排序",
      "2:冒泡排序",
      "2:选择排序",
      "2:插入排序",
      "2:快速排序",
      "2:希尔排序",
      "2:桶排序",
      "1:数据结构",
      "2:列表/数组",
      "2:栈",
      "2:队列",
      "2:栈和队列的应用:迷宫问题",
      "3:栈: 深度优先搜索",
      "3:队列: 广度优先搜索",
      "2:链表",
      "3:双链表",
      "2:总结：链表与顺序表",
      "2:哈希表",
    ]);
    expect(toc.map((item) => `${item.level}:${item.text}`)).toEqual(
      body.map((item) => `${item.level}:${item.text}`)
    );
    expect(hasToc(NESTED_MD)).toBe(true);
  });

  it("keeps headings with inline markdown, links, and closing hashes aligned with the body", () => {
    const html = renderArticle(INLINE_MD);
    const body = renderedHeadingIds(html);
    const toc = parseNavStructure(INLINE_MD);
    expect(body.map((item) => item.text)).toEqual([
      "Intro",
      "Bold Title",
      "Title with code",
      "Link Heading",
      "Closed Title",
    ]);
    expect(toc.map((item) => item.text)).toEqual(body.map((item) => item.text));
  });

  it("does not treat fenced code # comments as TOC entries", () => {
    const markdown = [
      "# Real",
      "",
      "```js",
      "# not a heading",
      "## also not",
      "```",
      "",
      "## After",
      "",
    ].join("\n");
    const html = renderArticle(markdown);
    const body = renderedHeadingIds(html);
    const toc = parseNavStructure(markdown);
    expect(body.map((item) => item.text)).toEqual(["Real", "After"]);
    expect(toc.map((item) => item.text)).toEqual(["Real", "After"]);
  });

  it("omits the GFM footnotes heading from the public TOC", () => {
    const markdown = [
      "# Real",
      "",
      "See the note.[^1]",
      "",
      "[^1]: a footnote",
      "",
    ].join("\n");
    const html = renderArticle(markdown);
    expect(html).toContain("footnote-label");
    const toc = parseNavStructure(markdown);
    expect(toc.map((item) => item.text)).toEqual(["Real"]);
    expect(toc.some((item) => /footnote/i.test(item.text))).toBe(false);
  });

  it("still finds a TOC when the only headings are indented nested titles", () => {
    const markdown = [
      "lead paragraph",
      "",
      "  ## Only Nested",
      "",
      "  ### Deeper",
      "",
    ].join("\n");
    const html = renderArticle(markdown);
    const body = renderedHeadingIds(html);
    expect(body.map((item) => item.text)).toEqual(["Only Nested", "Deeper"]);
    expect(parseNavStructure(markdown).map((item) => item.text)).toEqual([
      "Only Nested",
      "Deeper",
    ]);
    expect(hasToc(markdown)).toBe(true);
  });
});
