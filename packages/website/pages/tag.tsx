import Link from "next/link";
import { getPublicAll } from "../api/getMeta";
import AuthorCard from "../components/AuthorCard";
import Layout from "../components/layout";
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
  tags: string[];
  favicon: string;
  walineServerUrl: string;
  siteName: string;
  siteDesc: string;
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
      siteDesc={props.siteDesc}
      siteName={props.siteName}
      categories={props.categories}
      walineServerUrl={props.walineServerUrl}
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
      <div className="bg-white card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div className="text-lg md:text-xl text-gray-700 dark:text-dark">
          标签
        </div>
        <div className="flex flex-wrap mt-2">
          {props.tags.map((tag) => (
            <Link
              href={`/tag/${tag}`}
              key={Math.floor(Math.random() * 1000000)}
            >
              <a className="my-2 text-gray-500 block hover:text-cyan-400 transition-all mr-5 dark:text-dark-light dark:hover:text-dark-400">{`#${tag}`}</a>
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
  const postNum = data.articles.length;
  const tagNum = data.tags.length;
  const catelogNum = data.categories.length;
  const tags = data.tags;
  return {
    props: {
      ...getLayoutProps(siteInfo),
      categories: data.categories,
      author: siteInfo.author,
      desc: siteInfo.authorDesc,
      postNum: postNum,
      tagNum: tagNum,
      catelogNum: catelogNum,
      tags,
    },
  };
}
