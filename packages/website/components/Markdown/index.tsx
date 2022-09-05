import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import ImageBox from "../ImageBox";
import dynamic from "next/dynamic";
import { HeadingRender } from "./heading";
export default function (props: { content: string }) {
  return (
    <>
      <ReactMarkdown
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        remarkPlugins={[remarkMath, remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.length ? match[1] : undefined;
            const id = node.position?.end?.offset;
            if (lang == "mermaid") {
              const DynamicMermaid = dynamic(() => import("./mermaid"));
              return (
                <DynamicMermaid
                  id={id}
                  children={children}
                  className={className}
                />
              );
            }

            return !inline ? (
              <div className="relative">
                <CopyToClipboard
                  text={String(children)}
                  onCopy={() => {
                    toast.success("复制成功！", {
                      className: "toast",
                    });
                  }}
                >
                  <span
                    className="transition-all rounded inline-block cursor-pointer absolute top-2 right-2  bg-inherit  hover:bg-gray-700"
                    style={{ padding: "6px 10px" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 15 19"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0475 0.905273H1.67197C0.812542 0.905273 0.109375 1.60844 0.109375 2.46787V13.406H1.67197V2.46787H11.0475V0.905273ZM13.3914 4.03046H4.79716C3.93773 4.03046 3.23456 4.73363 3.23456 5.59306V16.5312C3.23456 17.3906 3.93773 18.0938 4.79716 18.0938H13.3914C14.2509 18.0938 14.954 17.3906 14.954 16.5312V5.59306C14.954 4.73363 14.2509 4.03046 13.3914 4.03046ZM13.3914 16.5312H4.79716V5.59306H13.3914V16.5312Z"
                        fill="#6f7177"
                      ></path>
                    </svg>
                  </span>
                </CopyToClipboard>
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, "")}
                  style={vscDarkPlus as any}
                  language={match?.length ? match[1] : undefined}
                  wrapLines={true}
                  lineProps={() => {
                    return {
                      style: {
                        display: "block",
                        whiteSpace: "pre",
                      },
                    };
                  }}
                  PreTag="pre"
                  {...props}
                />
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: HeadingRender,
          h2: HeadingRender,
          h3: HeadingRender,
          h4: HeadingRender,
          h5: HeadingRender,
          h6: HeadingRender,
          img(props) {
            return (
              <ImageBox
                alt={props.alt}
                src={(props.src as string) || ""}
                lazyLoad={true}
              />
            );
          },
        }}
        className={`markdown-body text-base`}
        children={props.content}
      />
    </>
  );
}
