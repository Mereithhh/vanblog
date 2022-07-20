import { getPublicAll, SocialItem } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
import TimeLineItem from "../components/TimeLineItem";
import { Article } from "../types/article";
import { getLayoutProps } from "../utils/getLayoutProps";
import { wordCount } from "../utils/wordCount";
interface IndexProps {
  ipcNumber: string;
  since: string;
  ipcHref: string;
  logo: string;
  categories: string[];
  author: string;
  desc: string;
  authorLogoDark: string;
  authorLogo: string;
  postNum: number;
  catelogNum: number;
  tagNum: number;
  articles: Record<string, Article[]>;
  wordTotal: number;
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
      favicon={props.favicon}
      title="分类"
      ipcNumber={props.ipcNumber}
      logoDark={props.logoDark}
      ipcHref={props.ipcHref}
      walineServerUrl={props.walineServerUrl}
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
          socials={props.socials}
          walineServerUrl={props.walineServerUrl}
          tagNum={props.tagNum}
          author={props.author}
          logo={props.authorLogo}
          logoDark={props.authorLogoDark}
          desc={props.desc}
        ></AuthorCard>
      }
    >
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 text-center dark:text-dark">
            分类
          </div>
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.catelogNum} 分类 × ${props.postNum} 文章 × ${props.tagNum} 标签 × ${props.wordTotal} 字`}</div>
        </div>
        <div className="flex flex-col mt-2">
          {Object.keys(props.articles).map((key: string) => {
            return (
              <TimeLineItem
                defaultOpen={false}
                key={key}
                date={key}
                articles={props.articles[key]}
                showYear={true}
              ></TimeLineItem>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
export async function getStaticProps(): Promise<{
  props: IndexProps;
  revalidate: number;
}> {
  const data = await getPublicAll();
  const siteInfo = data.meta.siteInfo;
  const postNum = data.articles.length;
  const tagNum = data.tags.length;
  const catelogNum = data.categories.length;
  let wordTotal = 0;
  data.articles.forEach((a) => {
    wordTotal = wordTotal + wordCount(a.content);
  });
  const articles = {} as any;
  for (const category of data.categories) {
    let curDateArticles = data.articles
      .filter((each) => {
        return each.category == category;
      })
      .map((each) => {
        return {
          title: each.title,
          id: each.id,
          createdAt: each.createdAt,
          updatedAt: each.updatedAt,
        };
      });
    curDateArticles = curDateArticles.sort((a, b) => {
      return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
    });
    articles[String(category)] = curDateArticles;
  }
  return {
    props: {
      wordTotal,
      ...getLayoutProps(siteInfo),
      categories: data.categories,
      postNum: postNum,
      tagNum: tagNum,
      catelogNum: catelogNum,
      articles: articles,
      socials: data.meta.socials,
    },
    revalidate: 60,
  };
}
