import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import rawHTML from "../components/Markdown/rawHTML";
import { LinkTarget } from "../components/Markdown/linkTarget";
import { Heading } from "../components/Markdown/heading";
import {
  MARKDOWN_EXTRA_TAG_NAMES,
  MARKDOWN_FORBIDDEN_TAG_NAMES,
  sanitizeMarkdownSchema,
} from "../utils/markdownSanitize";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) => readFileSync(path.join(websiteRoot, rel), "utf8");

/** Same sanitize + raw-HTML path as the public article Viewer. */
function renderPublicArticle(markdown: string) {
  return getProcessor({
    plugins: [rawHTML(), gfm(), LinkTarget(), Heading()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

function defaultSchemaFixture() {
  return {
    strip: [] as string[],
    clobberPrefix: "user-content-",
    tagNames: ["p", "em", "strong", "a", "img", "div"],
    protocols: {
      src: ["http", "https"],
      href: ["http", "https", "mailto"],
    },
    attributes: {
      a: ["href", "onclick"],
      img: ["src", "onerror"],
      "*": ["id", "className", "open"],
    },
  };
}

describe("public markdown HTML pass-through (#490)", () => {
  it("keeps underline and other simple tags that Markdown has no syntax for", () => {
    const html = renderPublicArticle(
      "Hello <u>underlined</u> and <font color=\"red\">red</font> text.",
    );
    expect(html).toMatch(/<u>underlined<\/u>/);
    expect(html).toMatch(/<font[^>]*color="red"[^>]*>red<\/font>/);
    expect(html).not.toMatch(/&lt;u&gt;/);
  });

  it("keeps existing extras: center, style, and iframe embeds", () => {
    const html = renderPublicArticle(
      [
        '<center>middle</center>',
        "",
        '<span style="color: blue">blue</span>',
        "",
        '<iframe src="https://player.bilibili.com/player.html" allowfullscreen></iframe>',
      ].join("\n"),
    );
    expect(html).toContain("<center>middle</center>");
    expect(html).toMatch(/<span[^>]*style="color: blue"[^>]*>blue<\/span>/);
    expect(html).toMatch(
      /<iframe[^>]*src="https:\/\/player\.bilibili\.com\/player\.html"/,
    );
  });

  it("still renders normal Markdown around the HTML", () => {
    const html = renderPublicArticle("**bold** and <u>line</u>");
    expect(html).toMatch(/<strong>bold<\/strong>/);
    expect(html).toMatch(/<u>line<\/u>/);
  });
});

describe("markdown HTML sanitization (#490)", () => {
  it("strips script tags and leaves the surrounding text", () => {
    const html = renderPublicArticle(
      'Safe <script>alert("xss")</script> text after.',
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain('alert("xss")');
    expect(html).toContain("Safe");
    expect(html).toContain("text after");
  });

  it("strips event-handler attributes", () => {
    const html = renderPublicArticle(
      '<img src="https://example.com/a.png" onerror="alert(1)" />\n\n' +
        '<a href="https://example.com" onclick="alert(1)">link</a>',
    );
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/onclick/i);
    expect(html).not.toContain("alert(1)");
    expect(html).toMatch(/<img[^>]*src="https:\/\/example\.com\/a\.png"/);
    expect(html).toMatch(/<a[^>]*href="https:\/\/example\.com"/);
  });

  it("blocks javascript: URLs on links", () => {
    const html = renderPublicArticle(
      '<a href="javascript:alert(1)">click</a>',
    );
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain("click");
  });

  it("schema allow-list includes u/font and forbids script", () => {
    const schema = sanitizeMarkdownSchema(defaultSchemaFixture());
    expect(schema.tagNames).toEqual(
      expect.arrayContaining([...MARKDOWN_EXTRA_TAG_NAMES]),
    );
    expect(schema.tagNames).not.toContain("script");
    expect(schema.strip).toEqual(
      expect.arrayContaining([...MARKDOWN_FORBIDDEN_TAG_NAMES]),
    );
    expect(schema.attributes.a).not.toContain("onclick");
    expect(schema.attributes.img).not.toContain("onerror");
    expect(schema.attributes["*"]).toContain("open");
  });
});

describe("public Viewer and admin preview stay on the same HTML path (#490)", () => {
  it("public Markdown Viewer passes allowDangerousHtml and the shared sanitizer", () => {
    const src = readSrc("components/Markdown/index.tsx");
    expect(src).toMatch(/rawHTML\(\)/);
    expect(src).toMatch(/remarkRehype=\{\{\s*allowDangerousHtml:\s*true/);
    expect(src).toMatch(/sanitize={sanitize}/);
    expect(src).toMatch(/sanitizeMarkdownSchema/);
  });

  it("keeps underline rules in the site CSS and the RSS copy", () => {
    const markdownCss = readSrc("styles/github-markdown.css");
    const publicCss = readSrc("public/markdown.css");
    const rule = /\.markdown-body u\s*\{[\s\S]*text-decoration:\s*underline/;
    expect(markdownCss).toMatch(rule);
    expect(publicCss).toMatch(rule);
  });
});
