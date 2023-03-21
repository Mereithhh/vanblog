import { Viewer } from "@bytemd/react"
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math-ssr';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid'
import { customContainer } from './customContainer';;
import "katex/dist/katex.min.css";
import rawHTML from "./rawHTML";
import { customCodeBlock } from "./codeBlock";
import { LinkTarget } from "./linkTarget";
import { Heading } from "./heading";
const plugins = [
  rawHTML(),
  gfm(),
  highlight(),
  math(),
  mediumZoom(),
  mermaid(),
  customContainer(),
  customCodeBlock(),
  LinkTarget(),
  Heading(),
]

export default function ({ content }: { content: string }) {
  return <div className="markdown-body">
    <Viewer value={content} plugins={plugins} remarkRehype={{ allowDangerousHtml: true }} />
  </div>
}
