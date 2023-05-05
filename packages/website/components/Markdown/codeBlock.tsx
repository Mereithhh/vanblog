import { BytemdPlugin } from "bytemd";
import { visit } from "unist-util-visit";
import copy from 'copy-to-clipboard';
import toast from "react-hot-toast";

// FIXME: Addd Types
const codeBlockPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === "element" && node.tagName === "pre") {
      const oldChildren = JSON.parse(JSON.stringify(node.children));
      const codeProperties = oldChildren.find(
        (child: any) => child.tagName === "code"
      ).properties;
      let language = "";
      if (codeProperties.className) {
        for (const each of codeProperties.className) {
          if (each.startsWith("language-")) {
            language = each.replace("language-", "");
            break;
          }
        }
      }
      if (language === "mermaid") return;
      // 复制按钮
      const codeCopyBtn = {
        type: "element",
        tagName: "div",
        properties: {
          class: "code-copy-btn",
        },
        children: [],
      };
      const languageTag = {
        type: "element",
        tagName: "span",
        properties: {
          class: "language-tag mr-1",
          style: "line-height: 21px",
        },
        children: [
          {
            type: "text",
            value: language,
          },
        ],
      };
      // 上方右侧 header
      const headerRight = {
        type: "element",
        tagName: "div",
        properties: {
          class: "header-right flex",
          style: "color: #6f7177",
        },
        children: [languageTag, codeCopyBtn],
      };
      // 包裹的 div
      const wrapperDiv = {
        type: "element",
        tagName: "div",
        properties: {
          class: "code-block-wrapper relative",
        },
        children: [headerRight, ...oldChildren],
      };
      node.children = [wrapperDiv];
    }
    if (node.type === "element" && node.tagName === "code") {
      if (!node?.properties?.className?.includes("hljs")) {
        node.properties.className = [
          "code-inline",
          ...(node?.properties?.className || []),
        ];
      }
    }
  });
};

const onClickCopyCode = (e: PointerEvent) => {
  const copyBtn = e.target as HTMLElement;
  const code = copyBtn.parentElement?.parentElement?.querySelector("code")?.innerText;
  copy(code);
  toast.success("复制成功", {
    className: "toast",
  })
}

export function customCodeBlock(): BytemdPlugin {
  return {
    rehype: (processor) =>
      processor.use(codeBlockPlugin),
    viewerEffect: ({ markdownBody }) => {
      markdownBody.querySelectorAll(".code-block-wrapper").forEach((codeBlock) => {
        const copyBtn = codeBlock.querySelector(".code-copy-btn")
        //remove first
        copyBtn.removeEventListener("click", onClickCopyCode);
        copyBtn.addEventListener("click", onClickCopyCode);
      })
    }
  };
}
