import React from "react";
import { HeadingProps } from "react-markdown/lib/ast-to-react";
import { getChildrenText } from "./tools";

export const HeadingRender = (props: HeadingProps) => {
  const { node, children } = props;
  let text = getChildrenText(children);
  return React.createElement(node.tagName, { ["data-id"]: text }, children);
};
