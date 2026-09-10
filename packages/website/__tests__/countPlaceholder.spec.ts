import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it, vi } from "vitest";
import PostViewer from "../components/PostViewer";
import { SubTitle } from "../components/PostCard/title";
import {
  ARTICLE_VIEWER_ATTR,
  COUNT_LOADING_PLACEHOLDER,
  formatCountDisplay,
  resolveArticleViewer,
} from "../utils/countPlaceholder";

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    createElement("a", { href: props.href }, props.children),
}));

(globalThis as { React?: typeof React }).React = React;

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const subtitleProps = {
  type: "article" as const,
  updatedAt: new Date("2024-03-15T12:00:00.000Z"),
  createdAt: new Date("2024-03-15T12:00:00.000Z"),
  catelog: "随笔",
  enableComment: "true" as const,
  id: 1,
  openArticleLinksInNewWindow: false,
};

describe("formatCountDisplay (#230)", () => {
  it("shows a placeholder before a number has loaded", () => {
    expect(formatCountDisplay(null)).toBe(COUNT_LOADING_PLACEHOLDER);
    expect(formatCountDisplay(null)).toBe("...");
    expect(formatCountDisplay(null)).not.toBe("0");
  });

  it("shows the real number after load, including a legitimate zero", () => {
    expect(formatCountDisplay(0)).toBe("0");
    expect(formatCountDisplay(0)).not.toBe(COUNT_LOADING_PLACEHOLDER);
    expect(formatCountDisplay(42)).toBe("42");
    expect(formatCountDisplay(1)).toBe("1");
  });
});

describe("resolveArticleViewer (#230)", () => {
  it("treats a stored 0 as loaded rather than missing", () => {
    expect(
      resolveArticleViewer(
        { viewer: 0 },
        { shouldAddViewer: false, noViewer: false }
      )
    ).toBe(0);
    expect(
      resolveArticleViewer(
        { viewer: 0 },
        { shouldAddViewer: true, noViewer: false }
      )
    ).toBe(1);
  });

  it("increments on the article page and leaves list counts as stored", () => {
    expect(
      resolveArticleViewer(
        { viewer: 41 },
        { shouldAddViewer: true, noViewer: false }
      )
    ).toBe(42);
    expect(
      resolveArticleViewer(
        { viewer: 41 },
        { shouldAddViewer: false, noViewer: false }
      )
    ).toBe(41);
  });

  it("falls back when there is no visit record yet", () => {
    expect(
      resolveArticleViewer(null, { shouldAddViewer: true, noViewer: false })
    ).toBe(1);
    expect(
      resolveArticleViewer(undefined, {
        shouldAddViewer: false,
        noViewer: false,
      })
    ).toBe(0);
    expect(
      resolveArticleViewer({}, { shouldAddViewer: true, noViewer: false })
    ).toBe(0);
    expect(
      resolveArticleViewer(null, { shouldAddViewer: true, noViewer: true })
    ).toBe(0);
    expect(
      resolveArticleViewer(
        { viewer: 9 },
        { shouldAddViewer: true, noViewer: true }
      )
    ).toBe(9);
  });
});

describe("PostViewer and comment count markup (#230)", () => {
  it("SSR-renders a placeholder instead of 0 for pageviews before load", () => {
    const html = renderToStaticMarkup(
      createElement(PostViewer, { shouldAddViewer: true, id: 1 })
    );
    expect(html).toContain(ARTICLE_VIEWER_ATTR);
    expect(html).toContain(COUNT_LOADING_PLACEHOLDER);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toMatch(
      new RegExp(`${ARTICLE_VIEWER_ATTR}[^>]*>\\s*0\\s*<`)
    );

    const src = readSrc("components/PostViewer/index.tsx");
    expect(src).toMatch(/useState<number \| null>\(null\)/);
    expect(src).not.toMatch(/useState\(0\)/);
    expect(src).toMatch(/formatCountDisplay/);
  });

  it("SSR-renders a placeholder instead of 0 for comment counts before Waline fills them", () => {
    const html = renderToStaticMarkup(createElement(SubTitle, subtitleProps));
    expect(html).toMatch(
      /waline-comment-count[^>]*>\s*\.\.\.\s*</
    );
    expect(html).not.toMatch(/waline-comment-count[^>]*>\s*0\s*</);
    expect(html).toContain(COUNT_LOADING_PLACEHOLDER);

    const listHtml = renderToStaticMarkup(
      createElement(SubTitle, { ...subtitleProps, type: "overview" })
    );
    expect(listHtml).toMatch(/waline-comment-count[^>]*>\s*\.\.\.\s*</);
    expect(listHtml).toContain(`data-article-viewer`);
    expect(listHtml).toContain(COUNT_LOADING_PLACEHOLDER);

    const src = readSrc("components/PostCard/title.tsx");
    expect(src).toMatch(/COUNT_LOADING_PLACEHOLDER/);
    expect(src).not.toMatch(
      /waline-comment-count[^\n]*\n\s*0\s*\n/
    );
  });

  it("omits the comment count when comments are disabled", () => {
    const html = renderToStaticMarkup(
      createElement(SubTitle, {
        ...subtitleProps,
        enableComment: "false",
      })
    );
    expect(html).not.toContain("waline-comment-count");
    expect(html).toContain(ARTICLE_VIEWER_ATTR);
  });
});
