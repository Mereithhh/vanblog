import { Viewer } from "@bytemd/react"
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math-ssr';
import { customContainer } from './customContainer';
import "katex/dist/katex.min.css";
import rawHTML from "./rawHTML";
import { customCodeBlock } from "./codeBlock";
import { LinkTarget } from "./linkTarget";
import { Heading } from "./heading";
import { Img } from "./img";
import { sanitizeMarkdownSchema } from "../../utils/markdownSanitize";
import { useContext, useMemo } from "react";
import { ThemeContext } from "../../utils/themeContext";
import { isDarkPaintTheme } from "../../utils/mermaidTheme";
import { mermaidForViewer } from "./mermaidViewer";

export const sanitize = sanitizeMarkdownSchema;
export default function ({ content }: { content: string }) {
  const { theme } = useContext(ThemeContext);
  const paintKey = isDarkPaintTheme(theme) ? "dark" : "light";
  const plugins = useMemo(
    () => [
      rawHTML(),
      gfm(),
      highlight(),
      math(),
      mermaidForViewer({ theme }),
      customContainer(),
      customCodeBlock(),
      LinkTarget(),
      Heading(),
      Img(),
    ],
    [theme],
  );
  return <div className="markdown-body">
    <Viewer key={paintKey} value={content} plugins={plugins} remarkRehype={{ allowDangerousHtml: true }} sanitize={sanitize} />
  </div>
}
