import Link from "next/link";
import { CSSProperties } from "react";
import { PageItem } from "./core";
const commonCls =
  "inline-flex justify-center items-center   transition-all text-gray-600";
const btnCls =
  "bg-white hover:bg-gray-200 dark:hover:bg-dark-hover dark:hover:pg-text-dark-hover";
const commonStyle: CSSProperties = {
  height: "28px",
  width: "28px",
  borderRadius: "4px",
  fontSize: "14px",
};
const renderLink = (item: PageItem, isCur: boolean) => {
  return (
    <Link
      href={item.href}
      key={`LinkItem-${item.page}-${item.type}-${item.href}`}
    >
      <div
        style={commonStyle}
        className={`${commonCls} ${btnCls}  ${isCur
          ? "bg-gray-200 dark:bg-dark-hover dark:pg-text-dark-hover"
          : "dark:bg-dark-1 dark:pg-text-dark "
          }`}
      >
        {item.page}
      </div>
    </Link>
  );
};
const renderBtn = (item: PageItem, disable: boolean, isNext: boolean) => {
  return (
    <Link
      href={item.href}
      key={`pagenav-btn-${item.page}-${item.href}-${isNext}`}
    // className="justify-center items-center "
    >
      <div
        style={commonStyle}
        className={`${commonCls} dark:bg-dark-1 dark:pg-text-dark  ${btnCls}`}
      >
        {isNext ? "›" : "‹"}
      </div>
    </Link>
  );
};
const renderMore = (item: PageItem, isNext: boolean) => {
  return (
    <Link
      href={item.href}
      key={`pagenav-more-${item.page}-${item.href}-${isNext}`}
    >
      <div style={commonStyle} className={`dark:pg-text-dark ${commonCls}`}>
        •••
      </div>
    </Link>
  );
};

export const RenderItemList = (props: { items: PageItem[] }) => {
  const res: React.ReactElement[] = [];
  for (const item of props.items) {
    switch (item.type) {
      case "link":
        res.push(renderLink(item, false));
        break;
      case "link-cur":
        res.push(renderLink(item, true));
        break;
      case "next-btn":
        res.push(renderBtn(item, false, true));
        break;
      case "next-btn-disable":
        res.push(renderBtn(item, true, true));
        break;
      case "next-more":
        res.push(renderMore(item, true));
        break;
      case "pre-more":
        res.push(renderMore(item, false));
        break;
      case "pre-btn":
        res.push(renderBtn(item, false, false));
        break;
      case "pre-btn-disable":
        res.push(renderBtn(item, true, false));
        break;
    }
  }
  return <ul className="space-x-2 text-center">{res}</ul>;
};
