import { Article } from "../../types/article";
import { useState } from "react";
import ArticleList from "../ArticleList";
import {
  CATEGORY_EXPAND_CHEVRON,
  expandControlAriaExpanded,
} from "../../utils/categoryExpand";

export default function (props: {
  date: string;
  articles: Article[];
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showYear?: boolean;
  compact?: boolean;
  openArticleLinksInNewWindow: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(Boolean(props.defaultOpen));
  const isControlled = props.open !== undefined;
  const visible = isControlled ? Boolean(props.open) : internalOpen;
  const setVisible = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    props.onOpenChange?.(next);
  };
  const calMaxHeight = props.articles.length * 50;
  const dateClass = props.compact
    ? "text-lg md:text-xl font-bold dark:text-dark"
    : "text-xl md:text-2xl font-bold dark:text-dark";
  const panelId = `timeline-articles-${encodeURIComponent(props.date)}`;
  return (
    <div
      className="mb-4 overflow-hidden"
      data-timeline-item={props.date}
      data-expanded={expandControlAriaExpanded(visible)}
    >
      <button
        type="button"
        aria-expanded={visible}
        aria-controls={panelId}
        onClick={() => {
          setVisible(!visible);
        }}
        className="flex items-center mb-4 z-50 w-full text-left bg-transparent border-0 p-0 cursor-pointer group"
      >
        <div className={dateClass}>{props.date}</div>

        <div className="ml-2 text-sm md:text-base text-gray-400 font-normal dark:text-dark-400">{`${props.articles.length}篇`}</div>
        <span
          aria-hidden="true"
          data-expand-chevron=""
          style={{ width: 22.5 }}
          className="dark:text-dark-light dark:group-hover:bg-dark-light dark:group-hover:text-dark-r dark:bg-dark-1 inline-block text-center leading-tight font-normal text-lg bg-gray-200 rounded ml-2 group-hover:bg-gray-500 group-hover:text-gray-100 transition-all"
        >
          <span
            className={`inline-block transition-transform duration-200 ${
              visible ? "rotate-90" : ""
            }`}
          >
            {CATEGORY_EXPAND_CHEVRON}
          </span>
        </span>
      </button>
      <div
        id={panelId}
        className="transition-all z-0 "
        aria-hidden={!visible}
        style={{ maxHeight: visible ? `${calMaxHeight}px` : "0" }}
      >
        <ArticleList
          articles={props.articles}
          showYear={props.showYear}
          openArticleLinksInNewWindow={props.openArticleLinksInNewWindow}
        ></ArticleList>
      </div>
    </div>
  );
}
