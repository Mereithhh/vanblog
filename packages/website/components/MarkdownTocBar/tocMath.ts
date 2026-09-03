import { getProcessor } from "bytemd";
import math from "@bytemd/plugin-math-ssr";
import { sanitizeMarkdownSchema } from "../../utils/markdownSanitize";

/** True when a TOC label may contain `$...$` / `$$...$$` TeX. */
export function tocLabelNeedsMath(text: string): boolean {
  return String(text || "").includes("$");
}

function unwrapSingleParagraph(html: string): string {
  const trimmed = html.trim();
  const wrapped = trimmed.match(/^<p>([\s\S]*)<\/p>$/i);
  return wrapped ? wrapped[1] : trimmed;
}

/**
 * Render a public TOC label with the same KaTeX path as the article body.
 * Scroll matching stays on the unparsed heading text; only the visible label
 * goes through `@bytemd/plugin-math-ssr`.
 */
export function renderTocLabelHtml(text: string): string {
  const source = String(text || "");
  if (!tocLabelNeedsMath(source)) {
    return source;
  }
  const html = getProcessor({
    plugins: [math()],
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(source)
    .toString();
  return unwrapSingleParagraph(html);
}
