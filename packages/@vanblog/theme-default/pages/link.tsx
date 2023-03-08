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
  const requireContent = `
**[申领要求]**
- [x] 请先添加本站为友链后再申请友链，并通过留言或邮件告知
- [x] 不和剽窃、侵权、无诚信的网站交换，优先和具有原创作品的全站 HTTPS 站点交换
- [x] 原则上要求您的博客主页被百度或者 Google 等搜索引擎收录
- [x] 由于访问安全性问题，请**务必**提供 HTTPS 链接的头像地址（或留言时备注暂无以便本站主动保存）
- [x] 不接受视频站、资源站等非博客类站点交换，原则上只与技术/日志类博客交换友链

**[本站信息]**
> 名称： ${props.layoutProps.siteName}<br/>
> 简介： ${props.layoutProps.description}<br/>
> 网址： [${url}](${url})<br/>
> 头像： [${logo}](${logo})
`;
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
          <p className="mb-6 ">以下是本站的友情链接，排名不分先后：</p>
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
