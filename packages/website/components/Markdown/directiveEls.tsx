//拓展 Markdown 的指令的组件
import { Element } from "hast";
import { createElement } from "react";
import { icons } from "./icons";
interface CustomElProps {
  children: React.ReactNode[];
  node: Element;
  title?: string;
}

const customContainerTitleMap: Record<string, string> = {
  note: "注",
  info: "相关信息",
  warning: "注意",
  danger: "警告",
  tip: "提示",
};

const customContainer = (props: CustomElProps) => {
  const { node, children, title } = props;
  const showTitle = title || customContainerTitleMap[node.tagName];

  const titleEl = createElement(
    "p",
    {
      className: `custom-container-title ${node.tagName}`,
    },
    [icons[node.tagName], showTitle]
  );
  return createElement(
    "div",
    { className: `custom-container ${node.tagName}` },
    [titleEl, ...children]
  );
};

export const Els = {
  warning: customContainer,
  info: customContainer,
  note: customContainer,
  danger: customContainer,
  tip: customContainer,
};
