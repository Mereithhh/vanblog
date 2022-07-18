import { getPublicAll } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
import PageNav from "../components/PageNav";
import PostCard from "../components/PostCard";
import { Article } from "../types/article";
import { getLayoutProps } from "../utils/getLayoutProps";
interface IndexProps {
  ipcNumber: string;
  since: string;
  ipcHref: string;
  logo: string;
  categories: string[];
  author: string;
  desc: string;
  authorLogo: string;
  postNum: number;
  catelogNum: number;
  tagNum: number;
  articles: Article[];
  currPage: number;
  favicon: string;
  walineServerUrl: string;
  siteName: string;
  siteDesc: string;
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      favicon={props.favicon}
      title={props.siteName}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      walineServerUrl={props.walineServerUrl}
      sideBar={
        <AuthorCard
          catelogNum={props.catelogNum}
          postNum={props.postNum}
          tagNum={props.tagNum}
          author={props.author}
          logo={props.authorLogo}
          desc={props.desc}
        ></AuthorCard>
      }
    >
      <div className="space-y-2 md:space-y-4">
        {props.articles.map((article) => (
          <PostCard
            id={article.id}
            key={article.title}
            title={article.title}
            createdAt={new Date(article.createdAt)}
            catelog={article.category}
            content={article.content}
            type={"overview"}
            walineServerUrl={props.walineServerUrl}
          ></PostCard>
        ))}
      </div>
      <PageNav
        total={props.postNum}
        current={props.currPage}
        base={"/"}
        more={"/page"}
      ></PageNav>
    </Layout>
  );
};

export default Home;
export async function getStaticProps(): Promise<{ props: IndexProps }> {
  const data = await getPublicAll();
  const siteInfo = data.meta.siteInfo;
  const postNum = data.articles.length;
  const tagNum = data.tags.length;
  const catelogNum = data.categories.length;
  const sortedArticles = data.articles.sort(
    (a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
  );
  // 只需要5个文章
  const articles = [];
  for (let i = 0; i < 5; i++) {
    const t = sortedArticles.pop();
    if (t) {
      articles.push(t);
    }
  }
  return {
    props: {
      currPage: 1,
      ...getLayoutProps(siteInfo),
      categories: data.categories,
      postNum: postNum,
      tagNum: tagNum,
      catelogNum: catelogNum,
      articles: articles,
    },
  };
}
