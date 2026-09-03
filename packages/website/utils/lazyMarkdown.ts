/** Long articles render a first chunk; the rest loads on scroll or TOC jump. */
export const LAZY_MARKDOWN_MIN_CHARS = 8000;
/** Split after this many characters, at the next heading boundary. */
export const LAZY_MARKDOWN_INITIAL_CHARS = 3500;
export const LOAD_REMAINING_MARKDOWN_EVENT = "vanblog:load-remaining-markdown";

export function requestRemainingMarkdown() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LOAD_REMAINING_MARKDOWN_EVENT));
}

const isFenceLine = (line: string) => line.trimStart().startsWith("```");
const isHeadingLine = (line: string) => /^#{1,6} /.test(line);

export function splitLazyMarkdown(content: string): { head: string; tail: string } {
  if (!content || content.length < LAZY_MARKDOWN_MIN_CHARS) {
    return { head: content || "", tail: "" };
  }
  const lines = content.split("\n");
  let offset = 0;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isFenceLine(line)) {
      inFence = !inFence;
    }
    if (
      !inFence &&
      offset >= LAZY_MARKDOWN_INITIAL_CHARS &&
      isHeadingLine(line)
    ) {
      const head = content.slice(0, offset);
      const tail = content.slice(offset);
      if (!tail.trim()) {
        return { head: content, tail: "" };
      }
      return { head, tail };
    }
    offset += line.length + (i === lines.length - 1 ? 0 : 1);
  }
  return { head: content, tail: "" };
}
