import AuthorCard, { AuthorCardProps } from "../components/AuthorCard";
import Layout from "../components/Layout";
import TimeLineItem from "../components/TimeLineItem";
import { Article } from "../types/article";
import { LayoutProps } from "../utils/getLayoutProps";
import { getCategoryPageProps } from "../utils/getPageProps";
import { revalidate } from "../utils/loadConfig";
import { PageViewData } from "../api/pageview";

export interface CategoryPageProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  categories: string[];
  articles: Article[];
  pageViewData: PageViewData;
}
const CategoryPage = (props: CategoryPageProps) => {
  // Calculate total word count
  const wordTotal = props.articles.reduce((total, article) => {
    return total + ((article as any).wordCount || 0);
  }, 0);
  
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
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.authorCardProps.catelogNum} 分类 × ${props.authorCardProps.postNum} 文章 × ${props.authorCardProps.tagNum} 标签 × ${wordTotal} 字`}</div>
        </div>
        <div className="flex flex-col mt-2">
          {props.categories.map((category: string) => {
            return (
              <TimeLineItem
                openArticleLinksInNewWindow={
                  props.layoutProps.openArticleLinksInNewWindow == "true"
                }
                defaultOpen={false}
                key={category}
                date={category}
                articles={props.articles.filter((article: Article) => article.category === category)}
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
