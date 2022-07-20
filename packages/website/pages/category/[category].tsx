import { getPublicAll, SocialItem } from "../../api/getMeta";
import AuthorCard from "../../components/AuthorCard";
import Layout from "../../components/layout";
import TimeLineItem from "../../components/TimeLineItem";
import { Article } from "../../types/article";
import { getLayoutProps } from "../../utils/getLayoutProps";
import { wordCount } from "../../utils/wordCount";
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
  curCategory: string;
  curNum: number;
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
      logoDark={props.logoDark}
      title={props.curCategory}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      baiduAnalysisID={props.baiduAnalysisID}
      gaAnalysisID={props.gaAnalysisID}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      sideBar={
        <AuthorCard
          catelogNum={props.catelogNum}
          postNum={props.postNum}
          tagNum={props.tagNum}
          logoDark={props.authorLogoDark}
          author={props.author}
          logo={props.authorLogo}
          socials={props.socials}
          desc={props.desc}
        ></AuthorCard>
      }
    >
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 text-center dark:text-dark">
            {props.curCategory}
          </div>
          <div className="text-center text-gray-600 text-sm mt-2 mb-4 font-light dark:text-dark">{`${props.curNum} 文章 × ${props.wordTotal} 字`}</div>
        </div>
        <div className="flex flex-col mt-2">
          {Object.keys(props.articles)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((eachDate: string) => {
              return (
                <TimeLineItem
                  defaultOpen={true}
                  key={eachDate}
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
export async function getStaticPaths() {
  const data = await getPublicAll();

  const paths = data.categories.map((category) => ({
    params: {
      category: category,
    },
  }));

  return {
    paths,
    fallback: false,
  };
}
export async function getStaticProps({
  params,
}: any): Promise<{ props: IndexProps; revalidate: number }> {
  const curCategory = params.category;
  const data = await getPublicAll();
  const siteInfo = data.meta.siteInfo;
  const postNum = data.articles.length;
  const tagNum = data.tags.length;
  const catelogNum = data.categories.length;
  let wordTotal = 0;

  const articlesInThisCategory = data.articles.filter((item) => {
    return item.category == curCategory;
  });
  articlesInThisCategory.forEach((a) => {
    wordTotal = wordTotal + wordCount(a.content);
  });
  const curNum = articlesInThisCategory.length;
  const articles = {} as any;
  const dates = Array.from(
    new Set(
      articlesInThisCategory.map((a) => new Date(a.createdAt).getFullYear())
    )
  );
  for (const date of dates) {
    const curDateArticles = articlesInThisCategory
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
    articles[String(date)] = curDateArticles;
  }
  return {
    props: {
      wordTotal,
      ...getLayoutProps(siteInfo),
      categories: data.categories,
      socials: data.meta.socials,
      postNum: postNum,
      tagNum: tagNum,
      catelogNum: catelogNum,
      articles: articles,
      curCategory,
      curNum,
    },
    revalidate: 60,
  };
}
