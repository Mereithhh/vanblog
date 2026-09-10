import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import ArticleCover, { ARTICLE_COVER_ATTR } from "../components/ArticleCover";
import {
  articleShareImageMeta,
  normalizeArticleCover,
  resolveArticleCoverUrl,
} from "../utils/articleCover";

(globalThis as { React?: typeof React }).React = React;

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

describe("article cover helpers (#288)", () => {
  it("treats missing, blank, and whitespace cover as unset", () => {
    expect(normalizeArticleCover(undefined)).toBeUndefined();
    expect(normalizeArticleCover(null)).toBeUndefined();
    expect(normalizeArticleCover("")).toBeUndefined();
    expect(normalizeArticleCover("   ")).toBeUndefined();
    expect(normalizeArticleCover("/static/img/hero.webp")).toBe(
      "/static/img/hero.webp"
    );
    expect(normalizeArticleCover("  /static/img/hero.webp  ")).toBe(
      "/static/img/hero.webp"
    );
  });

  it("resolves relative covers against the site URL and keeps absolute ones", () => {
    expect(
      resolveArticleCoverUrl("/static/img/hero.webp", "https://blog.example.com")
    ).toBe("https://blog.example.com/static/img/hero.webp");
    expect(
      resolveArticleCoverUrl(
        "https://cdn.example.com/a.png",
        "https://blog.example.com"
      )
    ).toBe("https://cdn.example.com/a.png");
    expect(resolveArticleCoverUrl("/static/img/hero.webp", "")).toBe(
      "/static/img/hero.webp"
    );
    expect(resolveArticleCoverUrl("", "https://blog.example.com")).toBeUndefined();
  });

  it("emits og/twitter image tags only when a cover exists", () => {
    expect(articleShareImageMeta(undefined, "https://blog.example.com")).toEqual(
      []
    );
    expect(articleShareImageMeta("  ", "https://blog.example.com")).toEqual([]);
    expect(
      articleShareImageMeta("/static/img/hero.webp", "https://blog.example.com")
    ).toEqual([
      {
        property: "og:image",
        content: "https://blog.example.com/static/img/hero.webp",
      },
      {
        name: "twitter:image",
        content: "https://blog.example.com/static/img/hero.webp",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ]);
  });
});

describe("ArticleCover markup (#288)", () => {
  it("renders the cover image when set and omits the block when unset", () => {
    const withCover = renderToStaticMarkup(
      createElement(ArticleCover, {
        src: "/static/img/hero.webp",
        alt: "题头",
      })
    );
    expect(withCover).toContain(ARTICLE_COVER_ATTR);
    expect(withCover).toContain('src="/static/img/hero.webp"');
    expect(withCover).toContain('alt="题头"');

    expect(renderToStaticMarkup(createElement(ArticleCover, {}))).toBe("");
    expect(
      renderToStaticMarkup(createElement(ArticleCover, { src: "   " }))
    ).toBe("");
  });
});

describe("article page wires cover and share meta (#288)", () => {
  it("shows the cover only on the article PostCard and adds OG tags on the post page", () => {
    const postCard = readSrc("components/PostCard/index.tsx");
    const postPage = readSrc("pages/post/[id].tsx");
    const pageProps = readSrc("utils/getPageProps.ts");

    expect(postCard).toMatch(/ArticleCover/);
    expect(postCard).toMatch(/type == "article" && \(/);
    expect(postCard).toMatch(/<ArticleCover src=\{props\.cover\}/);

    expect(postPage).toMatch(/articleShareImageMeta/);
    expect(postPage).toMatch(/cover=\{props\.article\.cover\}/);
    expect(postPage).toMatch(/og:image|property=\{tag\.property\}/);
    expect(pageProps).toMatch(/siteUrl:\s*data\.meta\.siteInfo\?\.baseUrl/);
  });
});
