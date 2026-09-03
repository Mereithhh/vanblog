/**
 * ByteMD/rehype-sanitize schema used by the public article Viewer.
 *
 * GFM footnotes render as <section class="footnotes"> with in-page hash links
 * whose ids are already prefixed by remark-rehype (`user-content-fn-1`).
 * The default sanitizer would drop `section` (so the separator CSS never
 * applies) and prefix ids a second time (so `#user-content-fn-1` misses).
 */
export const sanitizeMarkdownSchema = (schema) => {
  schema.protocols.src.push("data");
  schema.tagNames.push("center");
  schema.tagNames.push("iframe");
  schema.tagNames.push("script");
  schema.tagNames.push("section");
  // remark-rehype already prefixes footnote ids; a second prefix breaks hrefs.
  schema.clobberPrefix = "";
  schema.attributes["*"].push("style");
  schema.attributes["*"].push("src");
  schema.attributes["*"].push("scrolling");
  schema.attributes["*"].push("border");
  schema.attributes["*"].push("frameborder");
  schema.attributes["*"].push("framespacing");
  schema.attributes["*"].push("allowfullscreen");
  schema.strip = [];
  return schema;
};
