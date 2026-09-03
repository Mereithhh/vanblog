import { describe, it, expect } from "vitest";
import { headingRehypePlugin, isFootnotesHeading } from "../components/Markdown/heading";

describe("heading plugin anchors", () => {
  it("strips trailing spaces from id and data-id", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [{ type: "text", value: "My Title " }],
        },
      ],
    };
    headingRehypePlugin()(tree);
    expect(tree.children[0].properties.id).toBe("My Title");
    expect(tree.children[0].properties["data-id"]).toBe("My Title");
  });

  it("uses the full visible text when a heading has inline markdown", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h3",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "strong",
              children: [{ type: "text", value: "Bold Title" }],
            },
          ],
        },
      ],
    };
    headingRehypePlugin()(tree);
    expect(tree.children[0].properties.id).toBe("Bold Title");
    expect(tree.children[0].properties["data-id"]).toBe("Bold Title");
  });

  it("does not rewrite the GFM footnotes section heading", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "footnote-label", className: ["sr-only"] },
          children: [{ type: "text", value: "Footnotes" }],
        },
      ],
    };
    headingRehypePlugin()(tree);
    expect(tree.children[0].properties.id).toBe("footnote-label");
    expect(tree.children[0].properties.className).toEqual(["sr-only"]);
    expect(tree.children[0].properties["data-id"]).toBeUndefined();
    expect(isFootnotesHeading(tree.children[0])).toBe(true);
  });

  it("leaves already-clean titles unchanged", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [{ type: "text", value: "Clean Title" }],
        },
      ],
    };
    headingRehypePlugin()(tree);
    expect(tree.children[0].properties.id).toBe("Clean Title");
  });
});
