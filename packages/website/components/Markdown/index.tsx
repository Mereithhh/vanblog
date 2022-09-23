import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import { HeadingRender } from "./heading";
import { Els } from "./directiveEls";
import { Code } from "./Code";
import Img from "./Img";
export default function (props: { content: string }) {
  return (
    <>
      <ReactMarkdown
        remarkRehypeOptions={{
          allowDangerousHtml: true,
        }}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        remarkPlugins={[
          remarkMath,
          remarkGfm,
          remarkDirective,
          remarkDirectiveRehype,
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
        }}
        className={`markdown-body text-base`}
        children={props.content}
      />
    </>
  );
}
