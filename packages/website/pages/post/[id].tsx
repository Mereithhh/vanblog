import { getPublicAll } from "../../api/getMeta";
import Layout from "../../components/layout";
import PostCard from "../../components/PostCard";
import Toc from "../../components/Toc";
import WaLine from "../../components/WaLine";
import { Article } from "../../types/article";
import { getLayoutProps } from "../../utils/getLayoutProps";
import { hasToc } from "../../utils/hasToc";

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
  article: Article;
  pay: string[];
  payDark: string[];
  curId: number;
  pre: { id: number; title: string };
  next: { id: number; title: string };
  favicon: string;
  walineServerUrl: string;
  siteName: string;
  siteDesc: string;
  baiduAnalysisID: string;
  gaAnalysisID: string;
  logoDark: string;
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      walineServerUrl={props.walineServerUrl}
      favicon={props.favicon}
      title={props.article.title}
      logoDark={props.logoDark}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      baiduAnalysisID={props.baiduAnalysisID}
      gaAnalysisID={props.gaAnalysisID}
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      sideBar={
        hasToc(props.article.content) ? (
          <Toc content={props.article.content} />
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
        walineServerUrl={props.walineServerUrl}
      ></PostCard>
    </Layout>
  );
};

export default Home;

export async function getStaticPaths() {
  const data = await getPublicAll();

  const paths = data.articles.map((article) => ({
    params: {
      id: String(article.id),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({
  params,
}: any): Promise<{ props: IndexProps }> {
  const id = parseInt(params.id);
  const data = await getPublicAll();
  const siteInfo = data.meta.siteInfo;
  const postNum = data.articles.length;
  const tagNum = data.tags.length;
  const catelogNum = data.categories.length;
  const sortedArticle = data.articles.sort(
    (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
  );
  const article = data.articles.find((each) => {
    return each.id == id;
  });
  const curIndex = sortedArticle.indexOf(article);
  let pre = {} as any;
  let next = {} as any;
  if (curIndex > 0) {
    next["id"] = sortedArticle[curIndex - 1].id;
    next["title"] = sortedArticle[curIndex - 1].title;
  }
  if (curIndex < sortedArticle.length - 1) {
    pre["id"] = sortedArticle[curIndex + 1].id;
    pre["title"] = sortedArticle[curIndex + 1].title;
  }
  return {
    props: {
      ...getLayoutProps(siteInfo),
      curId: id,
      categories: data.categories,
      postNum: postNum,
      tagNum: tagNum,
      catelogNum: catelogNum,
      article,
      pay: [siteInfo.payAliPay, siteInfo.payWechat],
      payDark: [siteInfo?.payAliPayDark || "", siteInfo?.payWechatDark || ""],
      pre,
      next,
    },
  };
}
