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
    expect(washed).toBe("# Real\n\n## After\n");
  });

  it("strips fences whose body contains inline backticks", () => {
    const washed = washMarkdownContent(FENCED_WITH_INNER_BACKTICKS);
    expect(washed).not.toContain("fake heading");
    expect(washed).not.toContain("use `code`");
    expect(washed).toContain("# Title");
    expect(washed).toContain("## Still here");
    expect(washed).toBe("# Title\n\n## Still here\n");
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
    expect(washed).toBe("# Keep\n");
  });
});

describe("washMarkdownContent pipeline (#208)", () => {
  it("returns empty string for empty input and a lone newline after trim for whitespace-only", () => {
    expect(washMarkdownContent("")).toBe("");
    expect(washMarkdownContent("   ")).toBe("\n");
    expect(washMarkdownContent("\n")).toBe("\n");
  });

  it("drops the whole preamble before the first # (not only the first line)", () => {
    expect(
      washMarkdownContent(["hello", "world", "# Title", ""].join("\n"))
    ).toBe("# Title\n");
    expect(
      washMarkdownContent(
        ["intro paragraph", "", "# Real", "", "body", ""].join("\n")
      )
    ).toBe("# Real\n\nbody\n");
  });

  it("turns a document with no # into a trailing newline", () => {
    expect(washMarkdownContent("just a paragraph\nwith two lines\n")).toBe(
      "\n"
    );
  });

  it("unwraps inline code ticks in heading text", () => {
    expect(washMarkdownContent("# Title with `code`\n")).toBe(
      "# Title with code\n"
    );
  });

  it("strips a backtick-hash pair so inline `#id` code does not look like a heading", () => {
    const markdown = [
      "# Real",
      "",
      "see `#not-heading` here",
      "",
      "## After",
      "",
    ].join("\n");
    expect(washMarkdownContent(markdown)).toBe(
      "# Real\n\nsee not-heading` here\n\n## After\n"
    );
  });

  it("drops mid-line # spans that are not ATX headings", () => {
    expect(
      washMarkdownContent(
        "# Title\n\nA sentence with # not-a-heading word\n\n## Next\n"
      )
    ).toBe("# Title\n\n## Next\n");
    expect(
      washMarkdownContent(
        ["# Real", "", "foo ## bar baz", "", "## After", ""].join("\n")
      )
    ).toBe("# Real\n\n## After\n");
  });

  it("unwraps bold/italic asterisk and underscore markers", () => {
    expect(
      washMarkdownContent(
        ["# **Bold**", "", "## *Italic* Title", "", "### Mix **a** and *b*", ""].join(
          "\n"
        )
      )
    ).toBe("# Bold\n\n## Italic Title\n\n### Mix a and b\n");
    expect(
      washMarkdownContent(["# __Bold__", "", "## _Italic_ Title", ""].join("\n"))
    ).toBe("# Bold\n\n## Italic Title\n");
    expect(washMarkdownContent("# **Title** with `code` and _em_\n")).toBe(
      "# Title with code and em\n"
    );
    expect(washMarkdownContent("# **_both_**\n")).toBe("# both\n");
    expect(washMarkdownContent("# *open\n")).toBe("# *open\n");
  });

  it("treats indented ATX as an inline-hash line (spaces before #)", () => {
    expect(
      washMarkdownContent(
        ["lead", "", "  ## Nested", "", "body", ""].join("\n")
      )
    ).toBe("body\n");
    expect(washMarkdownContent("  # Title  \n  ")).toBe("\n");
  });

  it("keeps a heading that already starts at column 0 and ends with a newline", () => {
    expect(washMarkdownContent("# Only\n")).toBe("# Only\n");
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
