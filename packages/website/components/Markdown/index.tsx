import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import "katex/dist/katex.min.css";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";

import { HeadingRender } from "./heading";
import { Els } from "./directiveEls";
import { Code } from "./Code";
import Img from "./Img";
import a from "./a";
export default function (props: { content: string }) {
  return (
    <>
      <ReactMarkdown
        remarkRehypeOptions={{
          allowDangerousHtml: true,
        }}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        remarkPlugins={[
          remarkBreaks,
          remarkMath,
          remarkGfm,
          remarkDirective,
          remarkRehype
        ]}
        components={{
          code: Code,
          ...Els,
          h1: HeadingRender,
          h2: HeadingRender,
          h3: HeadingRender,
          h4: HeadingRender,
          h5: HeadingRender,
          h6: HeadingRender,
          img: Img,
          a: a,
        }}
        className={`markdown-body text-base`}
        children={props.content}
      />
    </>
  );
}
