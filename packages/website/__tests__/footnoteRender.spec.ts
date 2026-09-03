import { describe, it, expect } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import { LinkTarget } from "../components/Markdown/linkTarget";
import { Heading } from "../components/Markdown/heading";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";

const FOOTNOTE_MD = `Here is a footnote reference.[^1]

See also [example](https://example.com).

[^1]: Here is the footnote.
`;

function render(markdown: string) {
  return getProcessor({
    plugins: [gfm(), LinkTarget(), Heading()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

describe("GFM footnote public render (#290)", () => {
  const html = render(FOOTNOTE_MD);

  it("keeps the footnotes section wrapper used for the separator", () => {
    expect(html).toContain('class="footnotes"');
    expect(html).toMatch(/<section[^>]*class="footnotes"/);
    expect(html).toContain('id="footnote-label"');
    expect(html).toContain("sr-only");
  });

  it("keeps footnote hrefs pointing at the matching ids on the same document", () => {
    expect(html).toContain('href="#user-content-fn-1"');
    expect(html).toContain('id="user-content-fn-1"');
    expect(html).toContain('href="#user-content-fnref-1"');
    expect(html).toContain('id="user-content-fnref-1"');
    expect(html).not.toContain("user-content-user-content-");
  });

  it("does not open footnote refs or back-links in a new tab", () => {
    const ref = html.match(
      /<a href="#user-content-fn-1"[^>]*>/,
    )?.[0];
    const back = html.match(
      /<a href="#user-content-fnref-1"[^>]*>/,
    )?.[0];
    expect(ref).toBeTruthy();
    expect(back).toBeTruthy();
    expect(ref).not.toContain('target="_blank"');
    expect(back).not.toContain('target="_blank"');
  });

  it("still opens normal external links in a new tab", () => {
    const external = html.match(/<a href="https:\/\/example\.com"[^>]*>/)?.[0];
    expect(external).toBeTruthy();
    expect(external).toContain('target="_blank"');
  });
});
