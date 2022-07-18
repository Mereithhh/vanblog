import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Swal from "sweetalert2";
import Image from "next/image";
export default function (props: { content: string }) {
  return (
    <>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <div className="relative">
                <CopyToClipboard
                  text={String(children)}
                  onCopy={() => {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "复制成功！",
                      showConfirmButton: false,
                      timer: 1000,
                    });
                  }}
                >
                  <span
                    className="transition-all rounded inline-block cursor-pointer absolute top-2 right-2  bg-inherit  hover:bg-gray-600"
                    style={{ height: "32px", padding: "6px 10px" }}
                  >
                    <Image
                      src="/copy.svg"
                      width={20}
                      height={20}
                      style={{
                        backgroundColor: "inherit",
                      }}
                    ></Image>
                  </span>
                </CopyToClipboard>
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, "")}
                  style={vscDarkPlus as any}
                  language={match[1]}
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
        }}
        className="markdown-body"
        children={props.content}
        remarkPlugins={[remarkGfm]}
      />
    </>
  );
}
