import { Article } from "../../types/article";
import dayjs from "dayjs";
import Link from "next/link";
export default function (props: { articles: Article[]; showYear?: boolean }) {
  return (
    <div className="space-y-2">
      {props.articles.map((article) => {
        return (
          <Link href={`/post/${article.id}`}>
            <a
              className="flex items-center border-b pb-1 border-dashed cursor-pointer group border-gray-200 hover:border-gray-400"
              key={article.id}
            >
              <div className="text-gray-400 text-base group-hover:text-gray-600">
                {dayjs(article.createdAt).format(
                  props.showYear ? "YYYY-MM-DD" : "MM-DD"
                )}
              </div>
              <div className="ml-4 text-lg text-gray-600 group-hover:text-gray-800">
                {article.title}
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
