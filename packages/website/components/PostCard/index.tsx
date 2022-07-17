import dayjs from "dayjs";
import Link from "next/link";
import Markdown from "../Markdown";

export default function (props: {
  id: number;
  title: string;
  createdAt: Date;
  catelog: string;
  content: string;
  type: "overview" | "article" | "about";
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
          {props.type != "about"
            ? `发表于 ${dayjs(props.createdAt).format("YYYY-MM-DD")}`
            : `修改于 ${dayjs(props.createdAt).format("YYYY-MM-DD")}`}
        </span>

        {props.type != "about" && (
          <span className="inline-block px-2">
            {`分类于 `}
            <Link href={`/category/${props.catelog}`}>
              <a className="cursor-pointer hover:text-cyan-400">{`${props.catelog}`}</a>
            </Link>
          </span>
        )}
        <span className="inline-block px-2"> {`阅读数 ${0}`}</span>
        <span className="inline-block px-2"> {`评论数 ${0}`}</span>
      </div>
      <div className="text-sm md:text-base  text-gray-600 mt-4 mx-2">
        <Markdown content={getContent(props.content)}></Markdown>
      </div>

      {props.type == "overview" && (
        <div className="w-full flex justify-center mt-4">
          <Link href={`/post/${props.id}`}>
            <a className=" hover:bg-gray-800 hover:text-gray-50 border-2 border-gray-800 text-sm md:text-base text-gray-700 px-2 py-1 transition-all rounded">
              阅读全文
            </a>
          </Link>
        </div>
      )}

      <div></div>
    </div>
  );
}
