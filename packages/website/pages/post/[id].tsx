import { getPublicAll } from "../../api/getMeta";
import AuthorCard from "../../components/AuthorCard";
import Layout from "../../components/layout";
import PageNav from "../../components/PageNav";
import PostCard from "../../components/PostCard";
import Toc from "../../components/Toc";
import { Article } from "../../types/article";
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
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      title="Mereith's Blog"
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
      sideBar={<Toc content={props.article.content} />}
    >
      <PostCard
        id={props.article.id}
        key={props.article.title}
        title={props.article.title}
        createdAt={new Date(props.article.createdAt)}
        catelog={props.article.category}
        content={props.article.content}
        type={"article"}
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
  const article = data.articles.find((each) => {
    return each.id == id;
  });

  return {
    props: {
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
    },
  };
}
