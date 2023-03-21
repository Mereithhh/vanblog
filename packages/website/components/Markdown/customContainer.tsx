import { BytemdPlugin } from "bytemd";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

const CUSTOM_CONTAINER_TITLE: Record<string, string> = {
  note: "注",
  info: "相关信息",
  warning: "注意",
  danger: "警告",
  tip: "提示",
};

// FIXME: Addd Types
const customContainerPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (
      node.type === "textDirective" ||
      node.type === "leafDirective" ||
      node.type === "containerDirective"
    ) {
      if (node.type == "containerDirective") {
        const { attributes, name: tagName } = node;
        const data = node.data ??= {};
        const title = attributes?.title || CUSTOM_CONTAINER_TITLE[tagName];
        const cls = `custom-container ${tagName}`;

        data.hName = "div";
        data.hProperties = {
          class: cls,
          ["type"]: title,
        };
        const toAppendP = {
          type: "paragraph",
          data: {
            hProperties: {
              class: `custom-container-title ${tagName}`
            }
          },
          children: [
            {
              type: "text",
              value: title,
            }
          ]
        }
        node.children = [
          toAppendP,
          ...node.children
        ]
      }
    }
  });
};

export function customContainer(): BytemdPlugin {
  return {
    remark: (processor) =>
      processor.use(remarkDirective).use(customContainerPlugin),
  };
}
