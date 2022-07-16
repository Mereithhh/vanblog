import dayjs from "dayjs";
import Link from "next/link";
import Markdown from "../Markdown";

export default function (props: {
  title: string;
  createdAt: Date;
  catelog: string;
  content: string;
  type: "overview" | "article";
}) {
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
    <div className="bg-white border py-4 px-3 md:py-6 md:px-5">
      <div className="text-lg md:text-xl text-center font-medium mb-2">
        {props.title}
      </div>
      <div className="text-center text-xs md:text-sm divide-x divide-gray-400 text-gray-400">
        <span className="inline-block px-2">
          {`发表于 ${dayjs(props.createdAt).format("YYYY-MM-DD")}`}
        </span>

        <span className="inline-block px-2">
          {`分类于 `}
          <Link href={""}>
            <a className="cursor-pointer hover:text-cyan-400">{`${props.catelog}`}</a>
          </Link>
        </span>
        <span className="inline-block px-2"> {`阅读数 ${0}`}</span>
        <span className="inline-block px-2"> {`评论数 ${0}`}</span>
      </div>
      <div className="text-sm md:text-base  text-gray-600 mt-4 mx-2">
        <Markdown content={getContent(props.content)}></Markdown>
      </div>
      <div></div>
    </div>
  );
}
