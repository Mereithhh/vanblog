import React from "react";
import { HeadingProps } from "react-markdown/lib/ast-to-react";

export const HeadingRender = (props: HeadingProps) => {
  const { node, children } = props;
  let text = "";
  try {
    text = children[0] as string;
  } catch (err) {
    text = "";
  }

  return React.createElement(node.tagName, { ["data-id"]: text }, text);
};
