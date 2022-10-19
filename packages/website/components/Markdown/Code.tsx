import dynamic from "next/dynamic";
import { useContext } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { CodeComponent, CodeProps } from "react-markdown/lib/ast-to-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import light from "./style/prism";
import dark from "./style/vsc-dark-plus";
import { ThemeContext } from "../../utils/themeContext";
export function CodeBlock(props: { children: any; match: any }) {
  const code = props.children.replace(/\n$/, "");
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <div className="relative">
        <CopyToClipboard
          text={String(props.children)}
          onCopy={() => {
            toast.success("复制成功！", {
              className: "toast",
            });
          }}
        >
          <span
            className="transition-all rounded inline-block cursor-pointer absolute top-2 right-2  bg-inherit hover:bg-gray-200  dark:hover:bg-gray-700"
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
          style={theme.includes("dark") ? dark : (light as any)}
          language={props.match?.length ? props.match[1] : undefined}
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
          children={code}
        />
      </div>
    </>
  );
}
export const Code: CodeComponent = (props: CodeProps) => {
  const { node, inline, className, children } = props;
  const match = /language-(\w+)/.exec(className || "");
  const lang = match?.length ? match[1] : undefined;
  const id = node.position?.end?.offset;
  if (lang == "mermaid") {
    const DynamicMermaid = dynamic(() => import("./mermaid"));
    return <DynamicMermaid id={id} children={children} className={className} />;
  }
  return !inline ? (
    <CodeBlock children={String(children)} match={match} />
  ) : (
    <code className={className}>{children}</code>
  );
};
