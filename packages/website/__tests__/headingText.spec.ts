import { describe, it, expect } from "vitest";
import { collectHeadingText, normalizeHeadingText } from "../utils/headingText";
import { parseNavStructure } from "../components/MarkdownTocBar/tools";

describe("normalizeHeadingText", () => {
  it("trims trailing and leading spaces", () => {
    expect(normalizeHeadingText("My Title ")).toBe("My Title");
    expect(normalizeHeadingText("  Extra Spaces   ")).toBe("Extra Spaces");
  });

  it("keeps internal spaces", () => {
    expect(normalizeHeadingText("My Title")).toBe("My Title");
  });

  it("treats empty values as empty string", () => {
    expect(normalizeHeadingText(undefined)).toBe("");
    expect(normalizeHeadingText(null)).toBe("");
  });
});

describe("collectHeadingText", () => {
  it("reads a plain text node", () => {
    expect(collectHeadingText({ type: "text", value: "My Title " })).toBe(
      "My Title "
    );
  });

  it("joins nested inline children", () => {
    expect(
      collectHeadingText({
        type: "element",
        children: [
          { type: "text", value: "Title with " },
          {
            type: "element",
            children: [{ type: "text", value: "code" }],
          },
        ],
      })
    ).toBe("Title with code");
  });
});

describe("parseNavStructure heading whitespace", () => {
  const markdown = [
    "# Intro",
    "",
    "lead",
    "",
    "## My Title ",
    "",
    "body",
    "",
    "##   Extra Spaces   ",
    "",
    "more",
    "",
    "## Clean Title",
    "",
    "clean",
    "",
  ].join("\n");

  it("trims trailing and extra spaces so TOC text matches heading ids", () => {
    const items = parseNavStructure(markdown);
    expect(items.map((item) => item.text)).toEqual([
      "Intro",
      "My Title",
      "Extra Spaces",
      "Clean Title",
    ]);
  });

  it("still parses headings that have no extra spaces", () => {
    const items = parseNavStructure("## Clean Title\n\nhello\n");
    expect(items).toHaveLength(1);
    expect(items[0].text).toBe("Clean Title");
    expect(items[0].level).toBe(2);
  });
});
