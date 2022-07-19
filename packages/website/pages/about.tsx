import { getPublicAll, SocialItem } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
import PostCard from "../components/PostCard";
import WaLine from "../components/WaLine";
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
  favicon: string;
  about: {
    updatedAt: string;
    content: string;
  };
  walineServerUrl: string;
  siteName: string;
  siteDesc: string;
  socials: SocialItem[];
  baiduAnalysisID: string;
  gaAnalysisID: string;
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      title="关于我"
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      baiduAnalysisID={props.baiduAnalysisID}
      gaAnalysisID={props.gaAnalysisID}
      categories={props.categories}
      favicon={props.favicon}
      walineServerUrl={props.walineServerUrl}
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      sideBar={
        <AuthorCard
          catelogNum={props.catelogNum}
          postNum={props.postNum}
          tagNum={props.tagNum}
          socials={props.socials}
          author={props.author}
          walineServerUrl={props.walineServerUrl}
          logo={props.authorLogo}
          desc={props.desc}
        ></AuthorCard>
      }
    >
      <PostCard
        id={0}
        key={"about"}
        title={"关于我"}
        updatedAt={new Date(props.about.updatedAt)}
        catelog={"about"}
        content={props.about.content}
        type={"about"}
        walineServerUrl={props.walineServerUrl}
      ></PostCard>
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
  const about = data.meta.about;
  return {
    props: {
      ...getLayoutProps(siteInfo),
      categories: data.categories,
      postNum: postNum,
      socials: data.meta.socials,
      tagNum: tagNum,
      catelogNum: catelogNum,
      about: about as any,
    },
  };
}
