import { describe, it, expect } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import { LinkTarget } from "../components/Markdown/linkTarget";
import { Heading } from "../components/Markdown/heading";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";
import { articleOverviewMarkdown } from "../utils/articleExcerpt";

const ISSUE_410_LINK_TEXT = "1".repeat(36);
const ISSUE_410_HREF = "https://www.baidu.com";
const ISSUE_410_MARKDOWN = `[${ISSUE_410_LINK_TEXT}](${ISSUE_410_HREF})`;

const FOOTNOTE_MD = `Here is a footnote reference.[^1]

See also [example](https://example.com).

[^1]: Here is the footnote.
`;

function renderPublicArticle(markdown: string) {
  return getProcessor({
    plugins: [gfm(), LinkTarget(), Heading()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

function decodedHref(attr: string): string {
  return attr
    .replace(/&amp;/g, "&")
    .replace(/&#x26;/gi, "&")
    .replace(/&#38;/g, "&");
}

function anchors(html: string): { href: string; text: string; attrs: string }[] {
  const out: { href: string; text: string; attrs: string }[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const hrefMatch = attrs.match(/\bhref="([^"]*)"/);
    const text = match[2].replace(/<[^>]+>/g, "");
    out.push({
      href: hrefMatch ? decodedHref(hrefMatch[1]) : "",
      text,
      attrs,
    });
  }
  return out;
}

describe("public markdown link render (#410)", () => {
  it("keeps the screenshot [text](url) complete on the full article", () => {
    const html = renderPublicArticle(ISSUE_410_MARKDOWN);
    const link = anchors(html).find((a) => a.href === ISSUE_410_HREF);
    expect(link).toBeTruthy();
    expect(link?.text).toBe(ISSUE_410_LINK_TEXT);
    expect(html).not.toContain("](https://www");
  });

  it("keeps href and visible text after the homepage 50-character excerpt", () => {
    const excerpt = articleOverviewMarkdown(ISSUE_410_MARKDOWN);
    const html = renderPublicArticle(excerpt);
    const link = anchors(html).find((a) => a.href === ISSUE_410_HREF);
    expect(link).toBeTruthy();
    expect(link?.text).toBe(ISSUE_410_LINK_TEXT);
    expect(html).not.toMatch(/\]\(https:\/\/www/);
  });

  it("keeps backticks in the label, query strings, and parentheses in the URL", () => {
    const queryHref = "https://example.com/search?q=hello+world&lang=zh-CN";
    const parenHref = "https://en.wikipedia.org/wiki/Example_(disambiguation)";
    const markdown = [
      `[\`code label\`](${queryHref})`,
      "",
      `[wiki parens](${parenHref})`,
      "",
    ].join("\n");
    const html = renderPublicArticle(markdown);
    const links = anchors(html);
    const withCode = links.find((a) => a.href === queryHref);
    const withParen = links.find((a) => a.href === parenHref);
    expect(withCode?.text).toBe("code label");
    expect(html).toMatch(
      /<a[^>]*href="[^"]*search\?q=hello\+world(?:&amp;|&#x26;)lang=zh-CN"[^>]*>[\s\S]*<code>code label<\/code>/,
    );
    expect(withParen?.text).toBe("wiki parens");
  });

  it("still keeps footnote in-page hash links on the same page (#290)", () => {
    const html = renderPublicArticle(`${ISSUE_410_MARKDOWN}\n\n${FOOTNOTE_MD}`);
    const links = anchors(html);
    const ref = links.find((a) => a.href === "#user-content-fn-1");
    const back = links.find((a) => a.href === "#user-content-fnref-1");
    const external = links.find((a) => a.href === "https://example.com");
    const long = links.find((a) => a.href === ISSUE_410_HREF);
    expect(ref).toBeTruthy();
    expect(back).toBeTruthy();
    expect(ref?.attrs).not.toContain('target="_blank"');
    expect(back?.attrs).not.toContain('target="_blank"');
    expect(external?.attrs).toContain('target="_blank"');
    expect(long?.attrs).toContain('target="_blank"');
  });
});
