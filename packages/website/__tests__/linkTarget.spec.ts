import { describe, it, expect } from "vitest";
import { isInPageHashHref, linkTargetRehypePlugin } from "../components/Markdown/linkTarget";

describe("isInPageHashHref", () => {
  it("treats fragment-only hrefs as in-page", () => {
    expect(isInPageHashHref("#user-content-fn-1")).toBe(true);
    expect(isInPageHashHref("#user-content-fnref-1")).toBe(true);
  });

  it("does not treat document or external hrefs as in-page", () => {
    expect(isInPageHashHref("https://example.com")).toBe(false);
    expect(isInPageHashHref("/post/2")).toBe(false);
    expect(isInPageHashHref("fn-1")).toBe(false);
    expect(isInPageHashHref(undefined)).toBe(false);
  });
});

describe("linkTarget plugin", () => {
  it("does not force target=_blank on footnote hash links", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "#user-content-fn-1", id: "user-content-fnref-1" },
          children: [{ type: "text", value: "1" }],
        },
        {
          type: "element",
          tagName: "a",
          properties: {
            href: "#user-content-fnref-1",
            className: ["data-footnote-backref"],
          },
          children: [{ type: "text", value: "↩" }],
        },
      ],
    };
    linkTargetRehypePlugin()(tree);
    expect(tree.children[0].properties.target).toBeUndefined();
    expect(tree.children[1].properties.target).toBeUndefined();
  });

  it("still opens external links in a new tab", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "https://example.com" },
          children: [{ type: "text", value: "example" }],
        },
      ],
    };
    linkTargetRehypePlugin()(tree);
    expect(tree.children[0].properties.target).toBe("_blank");
    expect(tree.children[0].properties.rel).toBe("noopener noreferrer");
  });
});
