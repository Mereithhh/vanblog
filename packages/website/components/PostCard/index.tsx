import Link from "next/link";
import { useMemo, useState } from "react";
import AlertCard from "../AlertCard";
import CopyRight from "../CopyRight";
import Reward from "../Reward";
import TopPinIcon from "../TopPinIcon";
import UnLockCard from "../UnLockCard";
import WaLine from "../WaLine";
import { PostBottom } from "./bottom";
import { SubTitle, Title } from "./title";
import { getTarget } from "../Link/tools";
import TocMobile from "../TocMobile";
import { hasToc } from "../../utils/hasToc";
import Markdown from "../Markdown";

export default function (props: {
  id: number | string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  catelog: string;
  content: string;
  setContent: (content: string) => void;
  type: "overview" | "article" | "about";
  pay?: string[];
  payDark?: string[];
  author?: string;
  tags?: string[];
  next?: { id: number; title: string; pathname?: string };
  pre?: { id: number; title: string; pathname?: string };
  enableComment: "true" | "false";
  top: number;
  private: boolean;
  showDonateInAbout?: boolean;
  hideDonate?: boolean;
  hideCopyRight?: boolean;
  openArticleLinksInNewWindow: boolean;
  copyrightAggreement: string;
  customCopyRight: string | null;
  showExpirationReminder: boolean;
  showEditButton: boolean;
}) {
  const [lock, setLock] = useState(props.type != "overview" && props.private);
  const { content, setContent } = props;
  const showDonate = useMemo(() => {
    if (lock) {
      return false;
    }
    if (props.hideDonate) {
      return false;
    }
    if (!props.pay || props.pay.length <= 0) {
      return false;
    }
    if (props.type == "article") {
      return true;
    }
    if (props.type == "about" && props.showDonateInAbout) {
      return true;
    }
    return false;
  }, [props, lock]);

  const calContent = useMemo(() => {
    if (props.type == "overview") {
      if (props.private) {
        return "该文章已加密，点击 `阅读全文` 并输入密码后方可查看。";
      }
      const r = content.split("<!-- more -->");
      if (r.length > 1) {
        return r[0];
      } else {
        return content.substring(0, 50);
      }
    } else {
      return content.replace("<!-- more -->", "");
    }
  }, [props, lock, content]);

  const showToc = useMemo(() => {
    if (!hasToc(props.content)) return false;
    if (props.type == "article") return true;
    return false;
  }, [props.type, props.content]);

  return (
    <div className="post-card-wrapper">
      <div
        style={{ position: "relative" }}
        id="post-card"
        className="overflow-hidden post-card bg-white card-shadow py-4 px-1 sm:px-3 md:py-6 md:px-5 dark:bg-dark  dark:nav-shadow-dark"
      >
        {props.top != 0 && <TopPinIcon></TopPinIcon>}
        <Title
          type={props.type}
          id={props.id}
          title={props.title}
          openArticleLinksInNewWindow={props.openArticleLinksInNewWindow}
          showEditButton={props.showEditButton}
        />

        <SubTitle
          openArticleLinksInNewWindow={props.openArticleLinksInNewWindow}
          type={props.type}
          id={props.id}
          updatedAt={props.updatedAt}
          createdAt={props.createdAt}
          catelog={props.catelog}
          enableComment={props.enableComment}
        />
        <div className="text-sm md:text-base  text-gray-600 mt-4 mx-2">
          {props.type == "article" && (
            <AlertCard
              showExpirationReminder={props.showExpirationReminder}
              updatedAt={props.updatedAt}
              createdAt={props.createdAt}
            ></AlertCard>
          )}
          {lock ? (
            <UnLockCard
              setLock={setLock}
              setContent={setContent}
              id={props.id}
            />
          ) : (
            <>
              {showToc && <TocMobile content={calContent} />}
              <Markdown content={calContent}></Markdown>
            </>
          )}
        </div>

        {props.type == "overview" && (
          <div className="w-full flex justify-center mt-4 ">
            <Link
              href={`/post/${props.id}`}
              target={getTarget(props.openArticleLinksInNewWindow)}
            >
              <div className=" dark:bg-dark dark:hover:bg-dark-light dark:hover:text-dark-r dark:border-dark dark:text-dark hover:bg-gray-800 hover:text-gray-50 border-2 border-gray-800 text-sm md:text-base text-gray-700 px-2 py-1 transition-all rounded">
                阅读全文
              </div>
            </Link>
          </div>
        )}
        {showDonate && props.pay && (
          <Reward
            aliPay={(props?.pay as any)[0]}
            weChatPay={(props?.pay as any)[1]}
            aliPayDark={(props?.payDark || ["", ""])[0]}
            weChatPayDark={(props?.payDark || ["", ""])[1]}
            author={props.author as any}
            id={props.id}
          ></Reward>
        )}
        {props.type == "article" && !lock && !props?.hideCopyRight && (
          <CopyRight
            customCopyRight={props.customCopyRight}
            author={props.author as any}
            id={props.id}
            showDonate={showDonate}
            copyrightAggreement={props.copyrightAggreement}
          ></CopyRight>
        )}

        <PostBottom
          type={props.type}
          lock={lock}
          tags={props.tags}
          next={props.next}
          pre={props.pre}
          openArticleLinksInNewWindow={props.openArticleLinksInNewWindow}
        />
        <div
          style={{
            height: props.type == "about" && !showDonate ? "16px" : "0",
          }}
        ></div>
      </div>
      {props.type != "overview" && (
        <WaLine enable={props.enableComment} visible={true} />
      )}
    </div>
  );
}
