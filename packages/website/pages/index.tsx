import AuthorCard, { AuthorCardProps } from "../components/AuthorCard";
import Layout from "../components/layout";
import PageNav from "../components/PageNav";
import PostCard from "../components/PostCard";
import { Article } from "../types/article";
import { LayoutProps } from "../utils/getLayoutProps";
import { getIndexPageProps } from "../utils/getPageProps";
import { revalidate } from "../utils/loadConfig";
import Waline from "../components/WaLine";
export interface IndexPageProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  currPage: number;
  articles: Article[];
}
const Home = (props: IndexPageProps) => {
  return (
    <Layout
      option={props.layoutProps}
      title={props.layoutProps.siteName}
      sideBar={<AuthorCard option={props.authorCardProps}></AuthorCard>}
    >
      <div className="space-y-2 md:space-y-4">
        {props.articles.map((article) => (
          <PostCard
            private={article.private}
            top={article.top || 0}
            id={article.id}
            key={article.title}
            title={article.title}
            updatedAt={new Date(article.updatedAt)}
            createdAt={new Date(article.createdAt)}
            catelog={article.category}
            content={article.content || ""}
            type={"overview"}
            walineServerUrl={props.layoutProps.walineServerUrl}
          ></PostCard>
        ))}
      </div>
      <PageNav
        total={props.authorCardProps.postNum}
        current={props.currPage}
        base={"/"}
        more={"/page"}
      ></PageNav>
      <Waline serverUrl={props.layoutProps.walineServerUrl} visible={false} />
    </Layout>
  );
};

export default Home;
export async function getStaticProps(): Promise<{
  props: IndexPageProps;
  revalidate?: number;
}> {
  return {
    props: await getIndexPageProps(),
    ...revalidate,
  };
}
