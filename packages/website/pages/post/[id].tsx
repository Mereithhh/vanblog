import { getPublicAll } from "../../api/getMeta";
import AuthorCard from "../../components/AuthorCard";
import Layout from "../../components/layout";
import PageNav from "../../components/PageNav";
import PostCard from "../../components/PostCard";
import Reward from "../../components/Reward";
import Toc from "../../components/Toc";
import { Article } from "../../types/article";
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
  curId: number;
  pre: { id: number; title: string };
  next: { id: number; title: string };
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      title={props.article.title}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      sideBar={
        hasToc(props.article.content) ? (
          <Toc content={props.article.content} />
        ) : null
      }
    >
      <PostCard
        id={props.article.id}
        key={props.article.title}
        title={props.article.title}
        createdAt={new Date(props.article.createdAt)}
        catelog={props.article.category}
        content={props.article.content}
        type={"article"}
        pay={props.pay}
        author={props.author}
        tags={props.article.tags}
        pre={props.pre}
        next={props.next}
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
  const { beianUrl, beianNumber, since, siteLogo } = siteInfo;
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
      curId: id,
      ipcHref: beianUrl,
      ipcNumber: beianNumber,
      since: since,
      logo: siteLogo,
      categories: data.categories,
      author: siteInfo.author,
      desc: siteInfo.authorDesc,
      authorLogo: siteInfo.authorLogo,
      postNum: postNum,
      tagNum: tagNum,
      catelogNum: catelogNum,
      article,
      pay: [siteInfo.payAliPay, siteInfo.payWechat],
      pre,
      next,
    },
  };
}
