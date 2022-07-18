import dayjs from "dayjs";
import Link from "next/link";
import { useMemo } from "react";
import Markdown from "../Markdown";
import Reward from "../Reward";
import WaLine from "../WaLine";

export default function (props: {
  id: number;
  title: string;
  createdAt: Date;
  catelog: string;
  content: string;
  type: "overview" | "article" | "about";
  pay?: string[];
  author?: string;
  tags?: string[];
  next?: { id: number; title: string };
  pre?: { id: number; title: string };
  walineServerUrl: string;
}) {
  const dataPath = useMemo(() => {
    if (props.type == "about") {
      return "/about";
    } else {
      return "/post/" + props.id;
    }
  }, [props]);
  function getContent(content: string) {
    if (props.type == "overview") {
      const r = content.split("<!-- more -->");
      if (r.length == 2) {
        return r[0];
      } else {
        return content.substring(0, 50);
      }
    } else {
      return content.replace("<!-- more -->", "");
    }
  }
  return (
    <div>
      <div className="bg-white card-shadow py-4 px-1 sm:px-3 md:py-6 md:px-5 dark:bg-dark  dark:nav-shadow-dark">
        <div className="text-lg md:text-xl text-center font-medium mb-2 mt-2 dark:text-dark">
          {props.title}
        </div>
        <div className="text-center text-xs md:text-sm divide-x divide-gray-400 text-gray-400 dark:text-dark">
          <span className="inline-block px-2">
            {props.type != "about"
              ? `${dayjs(props.createdAt).format("YYYY-MM-DD")}`
              : `修改于 ${dayjs(props.createdAt).format("YYYY-MM-DD")}`}
          </span>

          {props.type != "about" && (
            <span className="inline-block px-2">
              {` 分类于 `}
              <Link href={`/category/${props.catelog}`}>
                <a className="cursor-pointer hover:text-cyan-400">{`${props.catelog}`}</a>
              </Link>
            </span>
          )}
          <span className="inline-block px-2">
            {`阅读 `}
            <span className="waline-pageview-count" data-path={dataPath}></span>
          </span>
          <span className="inline-block px-2">
            {`评论 `}
            <span className="waline-comment-count" data-path={dataPath}></span>
          </span>
        </div>
        <div className="text-sm md:text-base  text-gray-600 mt-4 mx-2">
          <Markdown content={getContent(props.content)}></Markdown>
        </div>

        {props.type == "overview" && (
          <div className="w-full flex justify-center mt-4 ">
            <Link href={`/post/${props.id}`}>
              <a className=" dark:bg-dark dark:hover:bg-dark-light dark:hover:text-dark-r dark:border-dark dark:text-dark hover:bg-gray-800 hover:text-gray-50 border-2 border-gray-800 text-sm md:text-base text-gray-700 px-2 py-1 transition-all rounded">
                阅读全文
              </a>
            </Link>
          </div>
        )}
        {props.type == "article" && props.pay && (
          <Reward
            aliPay={props.pay[0]}
            weChatPay={props.pay[1]}
            author={props.author as any}
            id={props.id}
          ></Reward>
        )}

        {props.type == "article" && props.tags && (
          <div className="mt-4">
            <div className="text-sm  text-gray-500 flex justify-center space-x-2 select-none dark:text-dark">
              {props.tags.map((tag) => (
                <div key={Math.floor(Math.random() * 100000)}>
                  <Link href={`/tag/${tag}`}>
                    <a className=" border-b border-white hover:border-gray-500 dark:border-dark dark:hover:border-gray-300 dark:hover:text-gray-300">{`#${tag}`}</a>
                  </Link>
                </div>
              ))}
            </div>
            <hr className="mt-3 dark:border-hr-dark" />
            <div className="flex justify-between text-sm mt-2 whitespace-nowrap overflow-hidden ">
              <div>
                {props.pre?.id && (
                  <Link href={`/post/${props.pre?.id}`}>
                    <a className="dark:text-dark dark:border-dark dark-border-hover border-b pb border-dashed hover:border-gray-800 border-white hover:text-gray-800">{`< ${props.pre?.title}`}</a>
                  </Link>
                )}
              </div>
              <div>
                {props.next?.id && (
                  <Link href={`/post/${props.next?.id}`}>
                    <a className="dark:text-dark dark:border-dark  dark-border-hover border-b pb border-dashed hover:border-gray-800 border-white hover:text-gray-800">{`${props.next?.title} >`}</a>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <WaLine
        serverUrl={props.walineServerUrl}
        visible={props.type != "overview"}
      />
    </div>
  );
}
