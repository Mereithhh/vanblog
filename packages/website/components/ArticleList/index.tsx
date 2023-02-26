import { Article } from "../../types/article";
import dayjs from "dayjs";
import Link from "../Link";
import { getTarget } from "../Link/tools";
import { getArticlePath } from "../../utils/getArticlePath";
export default function (props: {
  articles: Article[];
  showYear?: boolean;
  openArticleLinksInNewWindow: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="space-y-2" onClick={props.onClick}>
      {props.articles.map((article, index) => {
        return (
          <Link
            href={`/post/${getArticlePath(article)}`}
            key={article.id}
            newTab={props.openArticleLinksInNewWindow}
          >
            <a
              className="dark:border-dark-2  dark:hover:border-nav-dark-light flex items-center border-b pb-1 border-dashed cursor-pointer group border-gray-200 hover:border-gray-400 "
              key={article.id}
              target={getTarget(props.openArticleLinksInNewWindow)}
              href={`/post/${getArticlePath(article)}`}
            >
              <div className="text-gray-400 flex-grow-0 flex-shrink-0 text-sm  group-hover:text-gray-600 dark:text-dark-400 dark:group-hover:text-dark-light">
                {props.showYear
                  ? dayjs(article.createdAt).format("YYYY-MM-DD")
                  : dayjs(article.createdAt).format("MM-DD")}
              </div>
              <div className="ml-2 md:ml-4 text-base flex-grow flex-shrink overflow-hidden text-gray-600 group-hover:text-gray-800 dark:text-dark dark:group-hover:text-dark">
                {article.title}
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
