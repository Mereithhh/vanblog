import { Article } from "../../types/article";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function (props: {
  articles: Article[];
  showYear?: boolean;
  onClick?: () => void;
}) {
  const [dateArr, setDateArr] = useState(
    props.articles.map((a) => a.createdAt)
  );
  useEffect(() => {
    let fmt = "YYYY-MM-DD";
    if (!props.showYear) {
      fmt = "MM-DD";
    }
    const newArr = dateArr.map((a) => dayjs(a).format(fmt));
    setDateArr(newArr);
  }, [dateArr, setDateArr, props]);
  return (
    <div className="space-y-2" onClick={props.onClick}>
      {props.articles.map((article, index) => {
        return (
          <Link href={`/post/${article.id}`} key={article.id}>
            <a
              className="dark:border-dark-2  dark:hover:border-nav-dark-light flex items-center border-b pb-1 border-dashed cursor-pointer group border-gray-200 hover:border-gray-400 "
              key={article.id}
            >
              <div className="text-gray-400 flex-grow-0 flex-shrink-0 text-sm  group-hover:text-gray-600 dark:text-dark-400 dark:group-hover:text-dark-light">
                {dateArr[index]}
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
