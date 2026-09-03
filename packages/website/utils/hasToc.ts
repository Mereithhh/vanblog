import { parseNavStructure } from "../components/MarkdownTocBar/tools";

export const hasToc = (content: string) => parseNavStructure(content).length > 0;
