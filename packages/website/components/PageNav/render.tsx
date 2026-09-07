import Link from "next/link";
import { CSSProperties, KeyboardEvent } from "react";
import {
  PAGE_NAV_ITEM_ATTR,
  PAGE_NAV_LABEL,
  PageNavNode,
  describePageNav,
  handlePageNavKeyDown,
} from "./a11y";

import { PageItem } from "./core";
import {
  pageNavControlClass,
  pageNavEllipsisCls,
  pageNavNumberClass,
} from "./classes";

const commonStyle: CSSProperties = {
  height: "28px",
  width: "28px",
  borderRadius: "4px",
  fontSize: "14px",
};

const renderNode = (node: PageNavNode) => {
  if (node.kind === "ellipsis") {
    return (
      <span aria-hidden="true">
        <div style={commonStyle} className={pageNavEllipsisCls}>
          {node.content}
        </div>
      </span>
    );
  }
  if (node.kind === "disabled") {
    return (
      <span aria-disabled="true" aria-label={node.ariaLabel}>
        <div style={commonStyle} className={pageNavControlClass(true)}>
          {node.content}
        </div>
      </span>
    );
  }
  const innerClass =
    node.type === "link" || node.type === "link-cur"
      ? pageNavNumberClass(node.type === "link-cur")
      : pageNavControlClass(false);
  return (
    <Link
      href={node.href as string}
      aria-current={node.ariaCurrent}
      aria-label={node.ariaLabel}
      {...{ [PAGE_NAV_ITEM_ATTR]: "" }}
    >
      <div style={commonStyle} className={innerClass}>
        {node.content}
      </div>
    </Link>
  );
};

const onPageNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
  handlePageNavKeyDown(event);
};

export const RenderItemList = (props: { items: PageItem[] }) => {
  const nodes = describePageNav(props.items);
  return (
    <nav aria-label={PAGE_NAV_LABEL} onKeyDown={onPageNavKeyDown}>
      <ul
        role="list"
        className="inline-flex list-none justify-center space-x-2 p-0 m-0 text-center"
      >
        {nodes.map((node, index) => (
          <li
            key={`pagenav-${node.type}-${node.page}-${index}`}
            className="inline-flex"
            aria-hidden={node.ariaHidden || undefined}
          >
            {renderNode(node)}
          </li>
        ))}
      </ul>
    </nav>
  );
};
