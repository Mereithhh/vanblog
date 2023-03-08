import AuthorCard, { AuthorCardProps } from "../components/AuthorCard";
import Layout from "../components/Layout";
import TimeLineItem from "../components/TimeLineItem";
import { Article } from "../types/article";
import { LayoutProps } from "../utils/getLayoutProps";
import { getCategoryPageProps } from "../utils/getPageProps";
import { revalidate } from "../utils/loadConfig";

export interface CategoryPageProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  sortedArticles: Record<string, Article[]>;
  wordTotal: number;
}
const CategoryPage = (props: CategoryPageProps) => {
  return (
    <Layout
      option={props.layoutProps}
      title="分类"
      sideBar={<AuthorCard option={props.authorCardProps} />}
    >
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 text-center dark:text-dark">
            分类
          </div>
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.authorCardProps.catelogNum} 分类 × ${props.authorCardProps.postNum} 文章 × ${props.authorCardProps.tagNum} 标签 × ${props.wordTotal} 字`}</div>
        </div>
        <div className="flex flex-col mt-2">
          {Object.keys(props.sortedArticles).map((key: string) => {
            return (
              <TimeLineItem
                openArticleLinksInNewWindow={
                  props.layoutProps.openArticleLinksInNewWindow == "true"
                }
                defaultOpen={false}
                key={key}
                date={key}
                articles={props.sortedArticles[key]}
                showYear={true}
              ></TimeLineItem>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
export async function getStaticProps(): Promise<{
  props: CategoryPageProps;
  revalidate?: number;
}> {
  return {
    props: await getCategoryPageProps(),
    ...revalidate,
  };
}
