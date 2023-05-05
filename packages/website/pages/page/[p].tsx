import Head from "next/head";
import { getPublicMeta } from "../../api/getAllData";
import AuthorCard, { AuthorCardProps } from "../../components/AuthorCard";
import Layout from "../../components/Layout";
import PageNav from "../../components/PageNav";
import PostCard from "../../components/PostCard";
import Waline from "../../components/WaLine";
import { Article } from "../../types/article";
import { getArticlePath } from "../../utils/getArticlePath";
import { LayoutProps } from "../../utils/getLayoutProps";
import { getPagePagesProps } from "../../utils/getPageProps";
import { getArticlesKeyWord } from "../../utils/keywords";
import { revalidate } from "../../utils/loadConfig";
import Custom404 from "../404";
export interface PagePagesProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  currPage: number;
  articles: Article[];
}
const PagePages = (props: PagePagesProps) => {
  if (props.articles.length == 0) {
    return <Custom404 name="页码" />;
  }
  return (
    <Layout
      option={props.layoutProps}
      title={props.layoutProps.siteName}
      sideBar={<AuthorCard option={props.authorCardProps}></AuthorCard>}
    >
      <Head>
        <meta
          name="keywords"
          content={getArticlesKeyWord(props.articles).join(",")}
        ></meta>
      </Head>
      <div className="space-y-2 md:space-y-4">
        {props.articles.map((article) => (
          <PostCard
          
            showEditButton={props.layoutProps.showEditButton === "true"}
            setContent={() => {}}
            showExpirationReminder={
              props.layoutProps.showExpirationReminder == "true"
            }
            copyrightAggreement={props.layoutProps.copyrightAggreement}
            openArticleLinksInNewWindow={
              props.layoutProps.openArticleLinksInNewWindow == "true"
            }
            customCopyRight={null}
            top={article.top || 0}
            id={getArticlePath(article)}
            key={article.id}
            title={article.title}
            updatedAt={new Date(article.updatedAt)}
            createdAt={new Date(article.createdAt)}
            catelog={article.category}
            content={article.content || ""}
            type={"overview"}
            enableComment={props.layoutProps.enableComment}
            private={article.private}
          ></PostCard>
        ))}
      </div>
      <PageNav
        total={props.authorCardProps.postNum}
        current={props.currPage}
        base={"/"}
        more={"/page"}
      ></PageNav>
      <Waline enable={props.layoutProps.enableComment} visible={false} />
    </Layout>
  );
};

export default PagePages;

export async function getStaticPaths() {
  const data = await getPublicMeta();
  const total = Math.ceil(data.totalArticles / 5);
  const paths = [];
  for (let i = 1; i <= total; i++) {
    paths.push({
      params: {
        p: String(i),
      },
    });
  }
  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({
  params,
}: any): Promise<{ props: PagePagesProps; revalidate?: number }> {
  return {
    props: await getPagePagesProps(params.p),
    ...revalidate,
  };
}
