import { getRecentTimeDes } from '@/services/van-blog/tool';
import './index.css';
export default function (props: {
  articles: any[];
  showViewerNum: boolean;
  showRecentViewTime: boolean;
}) {
  return (
    <div>
      {props.articles.map((article) => {
        return (
          <a
            className="article-list-item  uaa"
            key={article.id}
            href={`/post/${article.id}`}
            target={'_blank'}
            rel="noreferrer"
          >
            <div className="">{article.title}</div>
            {props.showViewerNum && <div>{`${article.viewer || 0}人次`}</div>}
            {props.showRecentViewTime && <div>{getRecentTimeDes(article.lastVisitedTime)}</div>}
          </a>
        );
      })}
    </div>
  );
}
