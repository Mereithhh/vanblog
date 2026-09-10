import Link from "next/link";
import { useRouter } from "next/router";
import { CSSProperties, FormEvent, KeyboardEvent, useState } from "react";
import {
  PAGE_NAV_ITEM_ATTR,
  PAGE_NAV_LABEL,
  PageNavNode,
  describePageNav,
  handlePageNavKeyDown,
} from "./a11y";

import { PageItem, PageNavProps } from "./core";
import {
  pageNavControlClass,
  pageNavEllipsisCls,
  pageNavJumpFormCls,
  pageNavJumpGoCls,
  pageNavJumpInputCls,
  pageNavNumberClass,
} from "./classes";
import {
  PAGE_NAV_JUMP_GO_LABEL,
  PAGE_NAV_JUMP_INPUT_ATTR,
  PAGE_NAV_JUMP_INPUT_ID,
  PAGE_NAV_JUMP_INPUT_LABEL,
  PAGE_NAV_JUMP_LABEL,
  PAGE_NAV_JUMP_PREFIX,
  PAGE_NAV_JUMP_UNIT,
  describePageNavJump,
  handlePageNavJumpKeyDown,
  handlePageNavJumpSubmit,
  shouldShowPageNavJump,
} from "./jump";

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

const PageNavJump = (props: PageNavProps) => {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const model = describePageNavJump(props);
  const go = (href: string) => {
    void router.push(href);
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    handlePageNavJumpSubmit(event, raw, props, go);
  };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    handlePageNavJumpKeyDown(event, raw, props, go);
  };
  return (
    <form
      className={pageNavJumpFormCls}
      aria-label={PAGE_NAV_JUMP_LABEL}
      noValidate
      onSubmit={onSubmit}
    >
      <label htmlFor={PAGE_NAV_JUMP_INPUT_ID}>{PAGE_NAV_JUMP_PREFIX}</label>
      <input
        id={PAGE_NAV_JUMP_INPUT_ID}
        type="number"
        min={model.input.min}
        max={model.input.max}
        step={model.input.step}
        inputMode="numeric"
        aria-label={PAGE_NAV_JUMP_INPUT_LABEL}
        className={pageNavJumpInputCls}
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        onKeyDown={onInputKeyDown}
        {...{ [PAGE_NAV_JUMP_INPUT_ATTR]: "" }}
      />
      <span aria-hidden="true">{PAGE_NAV_JUMP_UNIT}</span>
      <button type="submit" aria-label={PAGE_NAV_JUMP_GO_LABEL} className={pageNavJumpGoCls}>
        {PAGE_NAV_JUMP_GO_LABEL}
      </button>
    </form>
  );
};

export const RenderItemList = (props: { items: PageItem[]; jump?: PageNavProps }) => {
  const nodes = describePageNav(props.items);
  const jump = props.jump;
  const showJump =
    jump != null && shouldShowPageNavJump(jump.total, jump.pageSize);
  return (
    <nav aria-label={PAGE_NAV_LABEL} onKeyDown={onPageNavKeyDown}>
      <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
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
        {showJump && jump ? <PageNavJump {...jump} /> : null}
      </div>
    </nav>
  );
};
