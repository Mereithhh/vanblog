import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it, vi } from "vitest";
import {
  ARTICLE_TAG_ATTR,
  ArticleTagIcon,
  PostBottom,
  TAG_ICON_ATTR,
} from "../components/PostCard/bottom";

vi.mock("next/link", () => ({
  default: ({
    children,
    ...rest
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => createElement("a", rest, children),
}));

(globalThis as { React?: typeof React }).React = React;

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const articleBottomProps = {
  type: "article" as const,
  lock: false,
  tags: ["js", "随笔"],
  openArticleLinksInNewWindow: false,
  pre: { id: 2, title: "上一篇" },
  next: { id: 3, title: "下一篇" },
};

function renderBottom(
  overrides: Partial<React.ComponentProps<typeof PostBottom>> = {}
) {
  return renderToStaticMarkup(
    createElement(PostBottom, { ...articleBottomProps, ...overrides })
  );
}

function tagBlocks(html: string, tag: string) {
  const attr = `${ARTICLE_TAG_ATTR}="${tag}"`;
  const start = html.indexOf(attr);
  expect(start).toBeGreaterThan(-1);
  const slice = html.slice(Math.max(0, start - 80), start + 400);
  return slice;
}

describe("article-bottom tag icon (#178)", () => {
  it("renders a decorative tag icon before each article tag link", () => {
    const html = renderBottom();

    expect(html).toContain(`${ARTICLE_TAG_ATTR}="js"`);
    expect(html).toContain(`${ARTICLE_TAG_ATTR}="随笔"`);
    expect(html).toContain('href="/tag/js"');
    expect(html).toContain('href="/tag/随笔"');

    for (const tag of ["js", "随笔"]) {
      const block = tagBlocks(html, tag);
      expect(block).toContain(TAG_ICON_ATTR);
      expect(block).toContain(tag);
      expect(block).toContain("aria-hidden");
    }

    const iconCount = html.split(TAG_ICON_ATTR).length - 1;
    expect(iconCount).toBe(2);

    const prevNext = html.slice(html.indexOf("<hr"));
    expect(prevNext).not.toContain(TAG_ICON_ATTR);
    expect(prevNext).not.toContain(ARTICLE_TAG_ATTR);
  });

  it("keeps hover and dark-mode classes on the tag row and icon fill", () => {
    const html = renderBottom();
    expect(html).toContain("dark:text-dark");
    expect(html).toContain("dark:hover:border-gray-300");
    expect(html).toContain("dark:hover:text-gray-300");
    expect(html).toContain("hover:border-gray-500");
    expect(html).toContain("fill-current");
    expect(html).toContain("inline-flex");
    expect(html).toContain("items-center");

    const icon = renderToStaticMarkup(createElement(ArticleTagIcon));
    expect(icon).toContain(TAG_ICON_ATTR);
    expect(icon).toContain("aria-hidden");
    expect(icon).toContain("fill-current");
    expect(icon).toContain('fill="currentColor"');
    expect(icon).toMatch(/width="16"/);
    expect(icon).toMatch(/<svg[\s\S]*<path/);
  });

  it("hides tags on overview cards, locked articles, and empty tag lists", () => {
    expect(renderBottom({ type: "overview" })).not.toContain(ARTICLE_TAG_ATTR);
    expect(renderBottom({ type: "overview" })).not.toContain(TAG_ICON_ATTR);
    expect(renderBottom({ lock: true })).not.toContain(ARTICLE_TAG_ATTR);
    expect(renderBottom({ tags: [] })).not.toContain(ARTICLE_TAG_ATTR);
    expect(renderBottom({ tags: undefined })).not.toContain(ARTICLE_TAG_ATTR);
    expect(renderBottom({ type: "about" })).toBe("");
  });

  it("encodes # and / in tag hrefs and still shows an icon", () => {
    const html = renderBottom({ tags: ["c#", "a/b"] });
    expect(html).toContain('href="/tag/c%23"');
    expect(html).toContain('href="/tag/a%2Fb"');
    expect(html).toContain(`${ARTICLE_TAG_ATTR}="c#"`);
    expect(html).toContain(`${ARTICLE_TAG_ATTR}="a/b"`);
    expect(html.split(TAG_ICON_ATTR).length - 1).toBe(2);
  });

  it("wires PostBottom into the article PostCard only", () => {
    const src = readSrc("components/PostCard/bottom.tsx");
    const postCard = readSrc("components/PostCard/index.tsx");

    expect(src).toMatch(/data-tag-icon/);
    expect(src).toMatch(/data-article-tag/);
    expect(src).toMatch(/ArticleTagIcon/);
    expect(src).toMatch(/aria-hidden/);
    expect(src).toMatch(/fill-current/);
    expect(src).toMatch(/dark:hover:text-gray-300/);
    expect(postCard).toMatch(/<PostBottom/);
    expect(postCard).toMatch(/tags=\{props\.tags\}/);
  });
});
