import { BytemdPlugin } from "bytemd";
import { visit } from "unist-util-visit";
import copy from 'copy-to-clipboard';
import toast from "react-hot-toast";
import {
  CODE_COPY_CLASS,
  CODE_COPY_LABEL,
  readCodeFromCopyButton,
} from "./codeCopyA11y";

export { CODE_COPY_CLASS, CODE_COPY_LABEL, readCodeFromCopyButton };
export {
  CODE_COPY_CONTROL,
  codeCopyIsKeyboardActivatable,
  describeCodeCopyControl,
} from "./codeCopyA11y";

// FIXME: Addd Types
export const codeBlockPlugin = () => (tree) => {
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
        tagName: "button",
        properties: {
          class: CODE_COPY_CLASS,
          type: "button",
          ariaLabel: CODE_COPY_LABEL,
          title: CODE_COPY_LABEL,
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

export function copyCodeFromButton(
  copyBtn: Parameters<typeof readCodeFromCopyButton>[0],
  deps: {
    copy: (text: string) => void;
    toastSuccess: (message: string, opts?: { className: string }) => void;
  } = {
    copy,
    toastSuccess: (message, opts) => toast.success(message, opts),
  }
) {
  const code = readCodeFromCopyButton(copyBtn);
  deps.copy(code);
  deps.toastSuccess("复制成功", {
    className: "toast",
  });
}

export const onClickCopyCode = (e: Event) => {
  const copyBtn = (e.currentTarget || e.target) as HTMLElement;
  copyCodeFromButton(copyBtn);
}

export function bindCodeCopyButtons(markdownBody: ParentNode) {
  markdownBody.querySelectorAll(".code-block-wrapper").forEach((codeBlock) => {
    const copyBtn = codeBlock.querySelector(`.${CODE_COPY_CLASS}`);
    if (!copyBtn) return;
    copyBtn.removeEventListener("click", onClickCopyCode);
    copyBtn.addEventListener("click", onClickCopyCode);
  });
}

export function customCodeBlock(): BytemdPlugin {
  return {
    rehype: (processor) =>
      processor.use(codeBlockPlugin),
    viewerEffect: ({ markdownBody }) => {
      bindCodeCopyButtons(markdownBody);
    }
  };
}
