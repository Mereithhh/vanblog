import { describe, it, expect } from "vitest";
import {
  LAZY_MARKDOWN_INITIAL_CHARS,
  LAZY_MARKDOWN_MIN_CHARS,
  splitLazyMarkdown,
} from "../utils/lazyMarkdown";

const filler = `占位内容`.repeat(220);

function longArticle() {
  const block = (n: number) =>
    Array.from({ length: 8 }, (_, i) => `段落${n}-${i}\n\n${filler}`).join("\n\n");
  return [
    "# Intro\n",
    `## 1. 概述\n\n${block(1)}\n`,
    `## 2. 准备\n\n${block(2)}\n`,
    `## 3. 安装\n\n${block(3)}\n`,
    "## 4. 配置DHCP引导选项\n\nDHCP 正文\n",
    "## My Title \n\ntrailing\n",
    "## Clean Title\n\nclean\n",
  ].join("\n");
}

describe("splitLazyMarkdown", () => {
  it("does not split short articles", () => {
    const markdown = "## Clean Title\n\nhello\n";
    expect(markdown.length).toBeLessThan(LAZY_MARKDOWN_MIN_CHARS);
    expect(splitLazyMarkdown(markdown)).toEqual({
      head: markdown,
      tail: "",
    });
  });

  it("keeps a later heading out of the initial chunk on a long article", () => {
    const markdown = longArticle();
    expect(markdown.length).toBeGreaterThanOrEqual(LAZY_MARKDOWN_MIN_CHARS);
    const { head, tail } = splitLazyMarkdown(markdown);
    expect(head.length).toBeGreaterThanOrEqual(LAZY_MARKDOWN_INITIAL_CHARS);
    expect(head).toContain("1. 概述");
    expect(head).not.toContain("4. 配置DHCP引导选项");
    expect(tail).toContain("4. 配置DHCP引导选项");
    expect(tail).toContain("My Title ");
    expect(tail).toContain("Clean Title");
  });

  it("does not split on a heading inside a fenced code block", () => {
    const markdown = [
      "# Intro",
      "",
      "a".repeat(LAZY_MARKDOWN_MIN_CHARS),
      "",
      "```",
      "# not a heading",
      "```",
      "",
      "## Real Heading",
      "",
      "tail",
      "",
    ].join("\n");
    expect(markdown.length).toBeGreaterThanOrEqual(LAZY_MARKDOWN_MIN_CHARS);
    const { head, tail } = splitLazyMarkdown(markdown);
    expect(head).toContain("```");
    expect(head).not.toContain("## Real Heading");
    expect(tail.startsWith("## Real Heading")).toBe(true);
  });
});
