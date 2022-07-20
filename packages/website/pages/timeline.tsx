import { getPublicAll, SocialItem } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
import TimeLineItem from "../components/TimeLineItem";
import { Article } from "../types/article";
import { getLayoutProps } from "../utils/getLayoutProps";
import { revalidate } from "../utils/loadConfig";
import { wordCount } from "../utils/wordCount";
interface IndexProps {
  ipcNumber: string;
  authorLogoDark: string;
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
      title={"时间线"}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      logoDark={props.logoDark}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      favicon={props.favicon}
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      walineServerUrl={props.walineServerUrl}
      baiduAnalysisID={props.baiduAnalysisID}
      gaAnalysisID={props.gaAnalysisID}
      sideBar={
        <AuthorCard
          catelogNum={props.catelogNum}
          postNum={props.postNum}
          tagNum={props.tagNum}
          logoDark={props.authorLogoDark}
          author={props.author}
          logo={props.authorLogo}
          desc={props.desc}
          walineServerUrl={props.walineServerUrl}
          socials={props.socials}
        ></AuthorCard>
      }
    >
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 text-center dark:text-dark">
            时间线
          </div>
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.catelogNum} 分类 × ${props.postNum} 文章 × ${props.tagNum} 标签 × ${props.wordTotal} 字`}</div>
        </div>
        <div className="flex flex-col mt-2">
          {Object.keys(props.articles)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((eachDate: string) => {
              return (
                <TimeLineItem
                  defaultOpen={true}
                  key={Math.floor(Math.random() * 1000000)}
                  date={eachDate}
                  articles={props.articles[eachDate]}
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
  revalidate?: number;
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
  const dates = Array.from(
    new Set(data.articles.map((a) => new Date(a.createdAt).getFullYear()))
  );
  for (const date of dates) {
    let curDateArticles = data.articles
      .filter((each) => {
        return new Date(each.createdAt).getFullYear() == date;
      })
      .map((each) => {
        return {
          title: each.title,
          id: each.id,
          createdAt: each.createdAt,
          updatedAt: each.updatedAt,
        };
      });
    curDateArticles = curDateArticles.sort(
      (a, b) =>
        new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
    );
    articles[String(date)] = curDateArticles;
  }
  return {
    props: {
      ...getLayoutProps(siteInfo),
      wordTotal,
      categories: data.categories,
      postNum: postNum,
      tagNum: tagNum,
      socials: data.meta.socials,
      catelogNum: catelogNum,
      articles: articles,
    },
    ...revalidate,
  };
}
