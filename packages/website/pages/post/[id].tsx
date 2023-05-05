import Head from "next/head";
import { useEffect, useState } from "react";
import { getArticlesByOption } from "../../api/getArticles";
import Layout from "../../components/Layout";
import PostCard from "../../components/PostCard";
import Toc from "../../components/Toc";
import { Article } from "../../types/article";
import { getArticlePath } from "../../utils/getArticlePath";
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
    pathname?: string;
  };
  next: {
    id: number;
    title: string;
    pathname?: string;
  };
  showSubMenu: "true" | "false";
}
const PostPages = (props: PostPagesProps) => {
  const [content, setContent] = useState(props?.article?.content || "");
  useEffect(() => {
    // nextjs 切换页面时，不会重新设置 content ，需要手动更新
    setContent(props?.article?.content || "")
  }, [props.article])
  if (!props.article) {
    return <Custom404 name="文章" />;
  }
  return (
    <Layout
      option={props.layoutProps}
      title={props.article.title}
      sideBar={
        hasToc(content) ? (
          <Toc content={content} showSubMenu={props.showSubMenu} />
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
        showEditButton={props.layoutProps.showEditButton === "true"}
        showExpirationReminder={
          props.layoutProps.showExpirationReminder == "true"
        }
        copyrightAggreement={props.layoutProps.copyrightAggreement}
        openArticleLinksInNewWindow={
          props.layoutProps.openArticleLinksInNewWindow == "true"
        }
        customCopyRight={props.article.copyright || null}
        top={props.article.top || 0}
        id={getArticlePath(props.article)}
        key={props.article.title}
        title={props.article.title}
        updatedAt={new Date(props.article.updatedAt)}
        createdAt={new Date(props.article.createdAt)}
        catelog={props.article.category}
        content={content}
        setContent={setContent}
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
      id: String(getArticlePath(article)),
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
