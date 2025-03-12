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
import { revalidate, isBuildTime } from "../../utils/loadConfig";
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
  const [url, setUrl] = useState("");
  const [content, setContent] = useState(props.article?.content || "");
  
  useEffect(() => {
    setUrl(window.location.origin);
    setContent(props.article?.content || "");
  }, [props.article, setUrl]);

  if (!props.article) {
    return <Custom404 />;
  }

  const keywords = getArticlesKeyWord([props.article]);
  const path = getArticlePath(props.article);
  const showToc = hasToc(content);

  return (
    <Layout
      option={props.layoutProps}
      title={props.article.title}
      sideBar={
        showToc ? (
          <Toc
            content={content}
            showSubMenu={props.showSubMenu}
          />
        ) : undefined
      }
    >
      <Head>
        <meta name="keywords" content={keywords.join(",")} />
        <meta name="description" content={props.article.content.slice(0, 100)} />
        <meta property="og:title" content={props.article.title} />
        <meta property="og:description" content={props.article.content.slice(0, 100)} />
        <meta property="og:url" content={`${url}${path}`} />
      </Head>
      <PostCard
        showEditButton={props.layoutProps.showEditButton === "true"}
        showExpirationReminder={props.layoutProps.showExpirationReminder === "true"}
        copyrightAggreement={props.layoutProps.copyrightAggreement}
        openArticleLinksInNewWindow={props.layoutProps.openArticleLinksInNewWindow === "true"}
        customCopyRight={props.article.copyright}
        top={props.article.top || 0}
        id={path}
        title={props.article.title}
        updatedAt={new Date(props.article.updatedAt)}
        createdAt={new Date(props.article.createdAt)}
        catelog={props.article.category}
        content={content}
        setContent={setContent}
        type="article"
        pay={props.pay}
        payDark={props.payDark}
        private={props.article.private}
        author={props.author}
        tags={props.article.tags}
        pre={props.pre}
        next={props.next}
        enableComment={props.layoutProps.enableComment}
        hideDonate={props.layoutProps.showDonateButton !== "true"}
        hideCopyRight={props.layoutProps.showCopyRight !== "true"}
      />
    </Layout>
  );
};

export default PostPages;

export async function getStaticPaths() {
  if (isBuildTime) {
    // During build time, return an empty array of paths
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  try {
    // In development or when not in build time, get all articles
    const { articles } = await getArticlesByOption({
      page: 1,
      pageSize: -1, // Get all articles
    });

    const paths = articles.map((article) => ({
      params: { id: article.pathname || article.id.toString() },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error getting article paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({
  params,
}: any): Promise<{ props: PostPagesProps; revalidate?: number } | { notFound: true }> {
  try {
    const props = await getPostPagesProps(params.id);
    return {
      props,
      revalidate: typeof revalidate === 'number' ? revalidate : 60,
    };
  } catch (error) {
    console.error('Error getting post props:', error);
    return {
      notFound: true,
    };
  }
}
