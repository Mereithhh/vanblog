import { getPublicAll, SocialItem } from "../../api/getMeta";
import AuthorCard from "../../components/AuthorCard";
import Layout from "../../components/layout";
import PageNav from "../../components/PageNav";
import PostCard from "../../components/PostCard";
import { Article } from "../../types/article";
import { getLayoutProps } from "../../utils/getLayoutProps";
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
  socials: SocialItem[];
  baiduAnalysisID: string;
  gaAnalysisID: string;
  logoDark: string;
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      walineServerUrl={props.walineServerUrl}
      favicon={props.favicon}
      title={props.siteName}
      logoDark={props.logoDark}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      baiduAnalysisID={props.baiduAnalysisID}
      gaAnalysisID={props.gaAnalysisID}
      sideBar={
        <AuthorCard
          catelogNum={props.catelogNum}
          postNum={props.postNum}
          tagNum={props.tagNum}
          author={props.author}
          logo={props.authorLogo}
          desc={props.desc}
          socials={props.socials}
          walineServerUrl={props.walineServerUrl}
        ></AuthorCard>
      }
    >
      <div className="space-y-2 md:space-y-4">
        {props.articles.map((article) => (
          <PostCard
            id={article.id}
            key={article.title}
            title={article.title}
            updatedAt={new Date(article.updatedAt)}
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

export async function getStaticPaths() {
  const data = await getPublicAll();
  const total = Math.ceil(data.articles.length / 5);
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
    fallback: false,
  };
}

export async function getStaticProps({
  params,
}: any): Promise<{ props: IndexProps }> {
  const curPage = parseInt(params.p);
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
  // 前面的不要
  for (let j = 0; j < curPage - 1; j++) {
    for (let i = 0; i < 5; i++) {
      sortedArticles.pop();
    }
  }
  //后面的要5个。
  for (let i = 0; i < 5; i++) {
    const a = sortedArticles.pop();
    if (a) {
      articles.push(a);
    }
  }

  return {
    props: {
      currPage: curPage,
      ...getLayoutProps(siteInfo),
      categories: data.categories,
      socials: data.meta.socials,
      postNum: postNum,
      tagNum: tagNum,

      catelogNum: catelogNum,
      articles: articles,
    },
  };
}
