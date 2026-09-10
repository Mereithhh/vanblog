import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  parseNavStructure,
  washMarkdownContent,
} from "../components/MarkdownTocBar/tools";

const toolsSrc = readFileSync(
  path.join(__dirname, "../components/MarkdownTocBar/tools.ts"),
  "utf8"
);

const FENCED_WITH_HASH = [
  "# Real",
  "",
  "```js",
  "# not a heading",
  "## also not",
  "const x = 1;",
  "```",
  "",
  "## After",
  "",
].join("\n");

const FENCED_WITH_INNER_BACKTICKS = [
  "# Title",
  "",
  "```md",
  "use `code` in docs",
  "# fake heading inside fence",
  "```",
  "",
  "## Still here",
  "",
].join("\n");

describe("washMarkdownContent fence stripping (#203)", () => {
  it("does not use a three-backtick character class (same as not-a-backtick)", () => {
    expect(toolsSrc).not.toContain("[^```]");
    expect(toolsSrc).toContain("/```([\\s\\S]*?)```[\\s]*/g");
  });

  it("returns empty string for empty input", () => {
    expect(washMarkdownContent("")).toBe("");
  });

  it("strips fenced blocks that contain # lines and keeps real headings", () => {
    const washed = washMarkdownContent(FENCED_WITH_HASH);
    expect(washed).not.toContain("not a heading");
    expect(washed).not.toContain("also not");
    expect(washed).not.toContain("const x = 1");
    expect(washed).toContain("# Real");
    expect(washed).toContain("## After");
  });

  it("strips fences whose body contains inline backticks", () => {
    const washed = washMarkdownContent(FENCED_WITH_INNER_BACKTICKS);
    expect(washed).not.toContain("fake heading");
    expect(washed).not.toContain("use `code`");
    expect(washed).toContain("# Title");
    expect(washed).toContain("## Still here");
  });

  it("strips multiple fenced blocks including language tags", () => {
    const markdown = [
      "```",
      "# one",
      "```",
      "",
      "# Keep",
      "",
      "```python",
      "# two",
      "print(1)",
      "```",
      "",
    ].join("\n");
    const washed = washMarkdownContent(markdown);
    expect(washed).not.toContain("# one");
    expect(washed).not.toContain("# two");
    expect(washed).not.toContain("print(1)");
    expect(washed).toContain("# Keep");
  });
});

describe("parseNavStructure with fenced # lines (#203)", () => {
  it("extracts only real headings when fences contain # comments", () => {
    const markdown = [
      "# Intro",
      "",
      "lead",
      "",
      "```bash",
      "# not a heading",
      "echo hi",
      "```",
      "",
      "## Nested",
      "",
      "```js",
      "const x = `# also not`;",
      "## still not",
      "```",
      "",
      "### Deeper",
      "",
    ].join("\n");
    expect(
      parseNavStructure(markdown).map((item) => `${item.level}:${item.text}`)
    ).toEqual(["1:Intro", "2:Nested", "3:Deeper"]);
  });

  it("still lists typical nested headings around fenced code", () => {
    const markdown = [
      "# 递归",
      "",
      "```c",
      "#include <stdio.h>",
      "```",
      "",
      "## 顺序查找",
      "",
      "body",
      "",
    ].join("\n");
    expect(parseNavStructure(markdown).map((item) => item.text)).toEqual([
      "递归",
      "顺序查找",
    ]);
  });
});
