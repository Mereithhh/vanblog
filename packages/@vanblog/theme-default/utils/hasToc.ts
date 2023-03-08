import { washMarkdownContent } from "../components/MarkdownTocBar/tools";

const HASH_REG = /#+\s+/;

export const hasToc = (content: string) =>
  HASH_REG.test(washMarkdownContent(content));
