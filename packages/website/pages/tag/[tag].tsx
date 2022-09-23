import { getPublicMeta } from "../../api/getAllData";
import AuthorCard, { AuthorCardProps } from "../../components/AuthorCard";
import Layout from "../../components/Layout";
import TimeLineItem from "../../components/TimeLineItem";
import { Article } from "../../types/article";
import { LayoutProps } from "../../utils/getLayoutProps";
import { getTagPagesProps } from "../../utils/getPageProps";
import { revalidate } from "../../utils/loadConfig";
import Custom404 from "../404";
export interface TagPagesProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  currTag: string;
  sortedArticles: Record<string, Article[]>;
  curNum: number;
  wordTotal: number;
}
const TagPages = (props: TagPagesProps) => {
  if (Object.keys(props.sortedArticles).length == 0) {
    return <Custom404 name="标签" />;
  }
  return (
    <Layout
      option={props.layoutProps}
      title={props.currTag}
      sideBar={<AuthorCard option={props.authorCardProps}></AuthorCard>}
    >
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 text-center dark:text-dark">
            {props.currTag}
          </div>
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.curNum} 文章 × ${props.wordTotal} 字`}</div>
        </div>
        <div className="flex flex-col mt-2">
          {Object.keys(props.sortedArticles)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((eachDate: string) => {
              return (
                <TimeLineItem
                  openArticleLinksInNewWindow={
                    props.layoutProps.openArticleLinksInNewWindow == "true"
                  }
                  defaultOpen={true}
                  key={eachDate}
                  date={eachDate}
                  articles={props.sortedArticles[eachDate]}
                ></TimeLineItem>
              );
            })}
        </div>
      </div>
    </Layout>
  );
};

export default TagPages;
export async function getStaticPaths() {
  const data = await getPublicMeta();
  const paths = data.tags.map((tag) => ({
    params: {
      tag: tag,
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
}
export async function getStaticProps({
  params,
}: any): Promise<{ props: TagPagesProps; revalidate?: number }> {
  return {
    props: await getTagPagesProps(params.tag),
    ...revalidate,
  };
}
