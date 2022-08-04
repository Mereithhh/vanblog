import AuthorCard, { AuthorCardProps } from "../components/AuthorCard";
import Layout from "../components/layout";
import PostCard from "../components/PostCard";
import { LayoutProps } from "../utils/getLayoutProps";
import { getAboutPageProps } from "../utils/getPageProps";
import { revalidate } from "../utils/loadConfig";
export interface About {
  updatedAt: string;
  content: string;
}
export interface AboutPageProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  about: About;
}
const AboutPage = (props: AboutPageProps) => {
  return (
    <Layout
      title="关于我"
      option={props.layoutProps}
      sideBar={<AuthorCard option={props.authorCardProps} />}
    >
      <PostCard
        id={0}
        key={"about"}
        title={"关于我"}
        updatedAt={new Date(props.about.updatedAt)}
        createdAt={new Date(props.about.updatedAt)}
        catelog={"about"}
        content={props.about.content}
        type={"about"}
        walineServerUrl={props.layoutProps.walineServerUrl}
        top={0}
      ></PostCard>
    </Layout>
  );
};

export default AboutPage;
export async function getStaticProps(): Promise<{
  props: AboutPageProps;
  revalidate?: number;
}> {
  return {
    props: await getAboutPageProps(),
    ...revalidate,
  };
}
