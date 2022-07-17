import { getPublicAll } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
import PostCard from "../components/PostCard";
import WaLine from "../components/WaLine";
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
  favicon: string;
  about: {
    updatedAt: string;
    content: string;
  };
  walineUrl: string;
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
      favicon={props.favicon}
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
      <PostCard
        id={0}
        key={"about"}
        title={"关于我"}
        createdAt={new Date(props.about.updatedAt)}
        catelog={"about"}
        content={props.about.content}
        type={"about"}
      ></PostCard>
      <WaLine serverUrl={props.walineUrl} />
    </Layout>
  );
};

export default Home;
export async function getStaticProps(): Promise<{ props: IndexProps }> {
  const data = await getPublicAll();
  const siteInfo = data.meta.siteInfo;
  const { beianUrl, beianNumber, since, siteLogo } = siteInfo;
  const postNum = data.articles.length;
  const tagNum = data.tags.length;
  const catelogNum = data.categories.length;
  const about = data.meta.about;
  return {
    props: {
      walineUrl: siteInfo.walineServerUrl,
      favicon: siteInfo.favicon,
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
      about: about as any,
    },
  };
}
