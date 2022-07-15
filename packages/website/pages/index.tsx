import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { getPublicAll } from "../api/getMeta";
import Layout from "../components/layout";
interface IndexProps {
  ipcNumber: string;
  since: string;
  ipcHref: string;
  logo: string;
  categories: string[];
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
    >
      index
    </Layout>
  );
};

export default Home;
export async function getStaticProps(): Promise<{ props: IndexProps }> {
  const data = await getPublicAll();
  return {
    props: {
      ipcHref: data.meta.siteInfo.beianUrl,
      ipcNumber: data.meta.siteInfo.beianNumber,
      since: data.meta.siteInfo.since,
      logo: data.meta.siteInfo.siteLogo,
      categories: data.categories,
    },
  };
}
