import Link from "next/link";
import { getPublicAll } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
import PageNav from "../components/PageNav";
import PostCard from "../components/PostCard";
import { Article } from "../types/article";
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
  tags: string[];
  favicon: string;
}
const Home = (props: IndexProps) => {
  return (
    <Layout
      title="标签"
      favicon={props.favicon}
      ipcNumber={props.ipcNumber}
      ipcHref={props.ipcHref}
      since={new Date(props.since)}
      logo={props.logo}
      categories={props.categories}
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
      <div className="bg-white border py-4 px-8 md:py-6 md:px-8">
        <div className="text-lg md:text-xl text-gray-700">标签</div>
        <div className="flex flex-wrap mt-2">
          {props.tags.map((tag) => (
            <Link
              href={`/tag/${tag}`}
              key={Math.floor(Math.random() * 1000000)}
            >
              <a className="my-2 text-gray-500 block hover:text-cyan-400 transition-all mr-5">{`#${tag}`}</a>
            </Link>
          ))}
        </div>
      </div>
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
  const tags = data.tags;
  return {
    props: {
      ipcHref: beianUrl,
      favicon: siteInfo.favicon,
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
      tags,
    },
  };
}
