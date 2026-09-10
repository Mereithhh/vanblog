import { useState, useEffect, useMemo } from "react";
import { LinkItem } from "../api/getAllData";
import AuthorCard, { AuthorCardProps } from "../components/AuthorCard";
import Layout from "../components/Layout";
import LinkCard from "../components/LinkCard";
import Markdown from "../components/Markdown";
import WaLine from "../components/WaLine";
import { LayoutProps } from "../utils/getLayoutProps";
import { getLinkPageProps } from "../utils/getPageProps";
import { revalidate } from "../utils/loadConfig";
import { renderFriendLinkApplyContent } from "../utils/pageCopy";

export interface LinkPageProps {
  layoutProps: LayoutProps;
  authorCardProps: AuthorCardProps;
  links: LinkItem[];
}

const LinkPage = (props: LinkPageProps) => {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(window.location.origin);
  }, [setUrl]);
  const logo = useMemo(() => {
    let logo = props.layoutProps.logo;
    if (props.layoutProps.logo == "") {
      logo = props.authorCardProps.logo || "";
    }
    if (logo == "") {
      logo = `${url}/logo.svg`;
    }
    return logo;
  }, [props, url]);
  const requireContent = useMemo(
    () =>
      renderFriendLinkApplyContent(props.layoutProps.friendLinkApplyContent, {
        siteName: props.layoutProps.siteName,
        description: props.layoutProps.description,
        url,
        logo,
      }),
    [props.layoutProps, url, logo]
  );
  return (
    <Layout
      option={props.layoutProps}
      title="友情链接"
      sideBar={<AuthorCard option={props.authorCardProps} />}
    >
      <div className="bg-white dark:text-dark card-shadow dark:bg-dark dark:card-shadow-dark py-4 px-8 md:py-6 md:px-8">
        <div>
          <div className="text-2xl md:text-3xl text-gray-700 dark:text-dark text-center">
            友情链接
          </div>
        </div>
        <div className="flex flex-col mt-6 mb-2">
          <p className="mb-6 ">{props.layoutProps.friendLinkIntro}</p>
          <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-3">
            {props.links.map((link) => (
              <LinkCard link={link} key={`${link.url}${link.name}`} />
            ))}
          </div>
          <hr className="mt-8 dark:border-hr-dark" />
          <div className="mt-4 text-sm md:text-base ">
            <Markdown content={requireContent} />
          </div>
          <div>
            <blockquote>
              <p></p>
            </blockquote>
          </div>
        </div>
      </div>
      <WaLine enable={props.layoutProps.enableComment} visible={true} />
    </Layout>
  );
};

export default LinkPage;
export async function getStaticProps(): Promise<{
  props: LinkPageProps;
  revalidate?: number;
}> {
  return {
    props: await getLinkPageProps(),
    ...revalidate,
  };
}
