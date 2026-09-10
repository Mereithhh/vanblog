import Link from "next/link";
import { useMemo } from "react";
import { encodeQuerystring } from "../../utils/encode";
import { getTarget } from "../Link/tools";
import { getArticlePath } from "../../utils/getArticlePath";

export const ARTICLE_TAG_ATTR = "data-article-tag";
export const TAG_ICON_ATTR = "data-tag-icon";

const TAG_ICON_SIZE = 14;

/** Decorative price-tag glyph shown before each article-bottom tag label. */
export function ArticleTagIcon() {
  return (
    <svg
      data-tag-icon
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={TAG_ICON_SIZE}
      height={TAG_ICON_SIZE}
      fill="currentColor"
      className="mr-0.5 flex-shrink-0 fill-current"
    >
      <path d="M21.41 11.58l-9-9A1.99 1.99 0 0010.99 2H4a2 2 0 00-2 2v7c0 .55.22 1.05.59 1.42l9 9a2 2 0 002.83 0l7-7a2 2 0 00-.01-2.84zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
    </svg>
  );
}

export function PostBottom(props: {
  type: "overview" | "article" | "about";
  lock: boolean;
  tags?: string[];
  next?: { id: number; title: string; pathname?: string };
  pre?: { id: number; title: string; pathname?: string };
  openArticleLinksInNewWindow: boolean;
}) {
  const show = useMemo(() => {
    if (props.type == "article" && !props.lock) {
      return true;
    }
    return false;
  }, [props]);
  return show ? (
    <div className="mt-4">
      {props.tags && props.tags.length > 0 && (
        <div className="text-sm flex-wrap text-gray-500 flex justify-center space-x-2 select-none dark:text-dark">
          {props.tags.map((tag) => (
            <div key={`article-tag-${tag}`}>
              <Link
                href={`/tag/${encodeQuerystring(tag)}`}
                target={getTarget(props.openArticleLinksInNewWindow)}
                data-article-tag={tag}
              >
                <div className="inline-flex items-center border-b border-white hover:border-gray-500 dark:border-dark dark:hover:border-gray-300 dark:hover:text-gray-300">
                  <ArticleTagIcon />
                  {tag}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      <hr className="mt-3 dark:border-hr-dark" />
      <div className="flex justify-between text-sm mt-2 whitespace-nowrap overflow-hidden ">
        <div className="" style={{ maxWidth: "50%" }}>
          {props.pre?.id && (
            <Link
              href={`/post/${getArticlePath(props.pre)}`}
              target={getTarget(props.openArticleLinksInNewWindow)}
            >
              <div
                style={{ whiteSpace: "break-spaces" }}
                className="dark:text-dark dark:border-dark dark-border-hover border-b pb border-dashed hover:border-gray-800 border-white hover:text-gray-800"
              >{`< ${props.pre?.title}`}</div>
            </Link>
          )}
        </div>
        <div className="" style={{ maxWidth: "50%" }}>
          {props.next?.id && (
            <Link
              href={`/post/${getArticlePath(props.next)}`}
              target={getTarget(props.openArticleLinksInNewWindow)}
            >
              <div
                style={{ whiteSpace: "break-spaces" }}
                className="dark:text-dark dark:border-dark  dark-border-hover border-b pb border-dashed hover:border-gray-800 border-white hover:text-gray-800"
              >{`${props.next?.title} >`}</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  ) : null;
}
