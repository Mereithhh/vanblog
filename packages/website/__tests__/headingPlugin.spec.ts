import { describe, it, expect } from "vitest";
import { visit } from "unist-util-visit";
import { normalizeHeadingText } from "../utils/headingText";

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"];

/** Mirrors the public-article heading plugin so id/data-id stay aligned with TOC. */
function assignHeadingAnchors(tree: any) {
  visit(tree, (node: any) => {
    if (node.type === "element" && headings.includes(node.tagName)) {
      const title = normalizeHeadingText(node.children[0]?.value);
      node.properties = node.properties || {};
      node.properties["data-id"] = title;
      node.properties["id"] = title;
    }
  });
}

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
    assignHeadingAnchors(tree);
    expect(tree.children[0].properties.id).toBe("My Title");
    expect(tree.children[0].properties["data-id"]).toBe("My Title");
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
    assignHeadingAnchors(tree);
    expect(tree.children[0].properties.id).toBe("Clean Title");
  });
});
