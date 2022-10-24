import Head from "next/head";
import { getArticlesByOption } from "../../api/getArticles";
import Layout from "../../components/Layout";
import PostCard from "../../components/PostCard";
import Toc from "../../components/Toc";
import { Article } from "../../types/article";
import { LayoutProps } from "../../utils/getLayoutProps";
import { getPostPagesProps } from "../../utils/getPageProps";
import { hasToc } from "../../utils/hasToc";
import { getArticlesKeyWord } from "../../utils/keywords";
import { revalidate } from "../../utils/loadConfig";
import Custom404 from "../404";

export interface PostPagesProps {
  layoutProps: LayoutProps;
  article: Article;
  pay: string[];
  payDark: string[];
  author: string;
  pre: {
    id: number;
    title: string;
  };
  next: {
    id: number;
    title: string;
  };
  showSubMenu: "true" | "false";
}
const PostPages = (props: PostPagesProps) => {
  if (!props.article) {
    return <Custom404 name="文章" />;
  }
  return (
    <Layout
      option={props.layoutProps}
      title={props.article.title}
      sideBar={
        hasToc(props.article.content) ? (
          <Toc
            content={props.article.content}
            showSubMenu={props.showSubMenu}
          />
        ) : null
      }
    >
      <Head>
        <meta
          name="keywords"
          content={getArticlesKeyWord([props.article]).join(",")}
        ></meta>
      </Head>
      <PostCard
        copyrightAggreement={props.layoutProps.copyrightAggreement}
        openArticleLinksInNewWindow={
          props.layoutProps.openArticleLinksInNewWindow == "true"
        }
        top={props.article.top || 0}
        id={props.article.id}
        key={props.article.title}
        title={props.article.title}
        updatedAt={new Date(props.article.updatedAt)}
        createdAt={new Date(props.article.createdAt)}
        catelog={props.article.category}
        content={props.article.content || ""}
        type={"article"}
        pay={props.pay}
        payDark={props.payDark}
        private={props.article.private}
        author={props.author}
        tags={props.article.tags}
        pre={props.pre}
        next={props.next}
        enableComment={props.layoutProps.enableComment}
        hideDonate={props.layoutProps.showDonateButton == "false"}
        hideCopyRight={props.layoutProps.showCopyRight == "false"}
      ></PostCard>
    </Layout>
  );
};

export default PostPages;

export async function getStaticPaths() {
  const data = await getArticlesByOption({
    page: 1,
    pageSize: -1,
    toListView: true,
  });
  const paths = data.articles.map((article) => ({
    params: {
      id: String(article.id),
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({
  params,
}: any): Promise<{ props: PostPagesProps; revalidate?: number }> {
  return {
    props: await getPostPagesProps(params.id),
    ...revalidate,
  };
}
