/**
 * ByteMD / rehype-sanitize schema used by the public article Viewer
 * and (kept in sync with) the admin editor preview.
 *
 * Pipeline (bytemd 1.21): remark-parse → remark-rehype({ allowDangerousHtml: true })
 * → rehype-raw → **rehype-sanitize(this schema)** → plugin rehype hooks → stringify.
 * Raw HTML is parsed; tags/attributes missing from the schema are dropped
 * (children are kept). That is why `<u>` previously “didn’t take effect”:
 * it is not in the default GitHub tag list.
 *
 * Safety stance (article Markdown only — not 定制化 / 自定义页面):
 * - Allowed: common formatting/embed HTML (`u`, `font`, `center`, `iframe`,
 *   `section`, `button`, plus the default GitHub tags) and existing extras
 *   (`style`, `data:` images).
 * - Not allowed: `<script>`, event-handler attributes (`onclick`, `onerror`,
 *   …), and `javascript:` URLs (blocked by default protocol lists).
 * - Site-wide JS/HTML still belongs in 定制化, not the article body.
 * - Admins are trusted authors; this is not a comment-field sanitizer.
 */
export const MARKDOWN_EXTRA_TAG_NAMES = [
  "center",
  "iframe",
  "section",
  "button",
  "u",
  "font",
] as const;

export const MARKDOWN_FORBIDDEN_TAG_NAMES = ["script"] as const;

const FORBIDDEN_TAG_NAME_SET = new Set<string>(MARKDOWN_FORBIDDEN_TAG_NAMES);

/** `open` (details) is 4 chars and must not be treated as an event handler. */
const EVENT_HANDLER_ATTR = /^on[a-z]{3,}$/i;

function withoutEventHandlers(attrs: unknown[] | undefined): unknown[] {
  return (attrs || []).filter((attr) => {
    const name = Array.isArray(attr) ? attr[0] : attr;
    return typeof name !== "string" || !EVENT_HANDLER_ATTR.test(name);
  });
}

export const sanitizeMarkdownSchema = (schema) => {
  schema.protocols.src.push("data");
  for (const tag of MARKDOWN_EXTRA_TAG_NAMES) {
    if (!schema.tagNames.includes(tag)) {
      schema.tagNames.push(tag);
    }
  }
  schema.tagNames = schema.tagNames.filter(
    (tag) => !FORBIDDEN_TAG_NAME_SET.has(tag),
  );
  schema.strip = Array.from(
    new Set([...(schema.strip || []), ...MARKDOWN_FORBIDDEN_TAG_NAMES]),
  );
  // Code-copy control is a native <button type="button">.
  if (!schema.tagNames.includes("button")) {
    schema.tagNames.push("button");
  }
  schema.attributes.button = Array.from(
    new Set([...(schema.attributes.button || []), "type", "disabled"])
  );
  schema.attributes.font = Array.from(
    new Set([...(schema.attributes.font || []), "color", "size", "face"])
  );
  schema.attributes["*"] = Array.from(
    new Set([
      ...(schema.attributes["*"] || []),
      "ariaLabel",
      "ariaHidden",
      "title",
      // Fenced-code line numbers: <span class="code-line" data-line="1">
      "dataLine",
    ])
  );
  // remark-rehype already prefixes footnote ids; a second prefix breaks hrefs.
  schema.clobberPrefix = "";
  schema.attributes["*"].push("style");
  schema.attributes["*"].push("src");
  schema.attributes["*"].push("scrolling");
  schema.attributes["*"].push("border");
  schema.attributes["*"].push("frameborder");
  schema.attributes["*"].push("framespacing");
  schema.attributes["*"].push("allowfullscreen");
  for (const key of Object.keys(schema.attributes)) {
    schema.attributes[key] = withoutEventHandlers(schema.attributes[key]);
  }
  return schema;
};
