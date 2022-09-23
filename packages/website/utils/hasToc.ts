import { washMarkdownContent } from "../components/MarkdownTocBar/tools";

export function hasToc(content: string) {
  const r = /#+\s+/;
  return r.test(washMarkdownContent(content));
}
