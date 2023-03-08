import Link from "next/link";
import { useMemo } from "react";
import { encodeQuerystring } from "../../utils/encode";
import { getTarget } from "../Link/tools";
import { getArticlePath } from "../../utils/getArticlePath";

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
              >
                <div className=" border-b border-white hover:border-gray-500 dark:border-dark dark:hover:border-gray-300 dark:hover:text-gray-300">{`${tag}`}</div>
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
