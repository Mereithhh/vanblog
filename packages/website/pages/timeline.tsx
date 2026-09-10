import AuthorCard, { AuthorCardProps } from "../components/AuthorCard";
import Layout from "../components/Layout";
import TimelineArchives from "../components/TimelineArchives";
import { Article } from "../types/article";
import { LayoutProps } from "../utils/getLayoutProps";
import { getTimeLinePageProps } from "../utils/getPageProps";
import { TimelineYearGroup } from "../utils/timelineMonths";
import { revalidate } from "../utils/loadConfig";
export interface TimeLinePageProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  sortedArticles: Record<string, Article[]>;
  yearGroups: TimelineYearGroup<Article>[];
  wordTotal: number;
}
const TimeLine = (props: TimeLinePageProps) => {
  return (
    <Layout
      title={"时间线"}
      option={props.layoutProps}
      sideBar={<AuthorCard option={props.authorCardProps} />}
    >
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 text-center dark:text-dark">
            时间线
          </div>
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.authorCardProps.catelogNum} 分类 × ${props.authorCardProps.postNum} 文章 × ${props.authorCardProps.tagNum} 标签 × ${props.wordTotal} 字`}</div>
        </div>
        <TimelineArchives
          yearGroups={props.yearGroups}
          openArticleLinksInNewWindow={
            props.layoutProps.openArticleLinksInNewWindow == "true"
          }
        />
      </div>
    </Layout>
  );
};

export default TimeLine;
export async function getStaticProps(): Promise<{
  props: TimeLinePageProps;
  revalidate?: number;
}> {
  return {
    props: await getTimeLinePageProps(),
    ...revalidate,
  };
}
