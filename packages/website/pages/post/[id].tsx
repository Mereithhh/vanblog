import { getPublicMeta } from "../../api/getAllData";
import { getArticlesByOption } from "../../api/getArticles";
import Layout from "../../components/layout";
import PostCard from "../../components/PostCard";
import Toc from "../../components/Toc";
import { Article } from "../../types/article";
import { LayoutProps } from "../../utils/getLayoutProps";
import { getPostPagesProps } from "../../utils/getPageProps";
import { hasToc } from "../../utils/hasToc";
import { revalidate } from "../../utils/loadConfig";

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
      <PostCard
        top={props.article.top || 0}
        id={props.article.id}
        key={props.article.title}
        title={props.article.title}
        updatedAt={new Date(props.article.updatedAt)}
        catelog={props.article.category}
        content={props.article.content}
        type={"article"}
        pay={props.pay}
        payDark={props.payDark}
        author={props.author}
        tags={props.article.tags}
        pre={props.pre}
        next={props.next}
        walineServerUrl={props.layoutProps.walineServerUrl}
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
