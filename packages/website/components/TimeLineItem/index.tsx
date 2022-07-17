import { Article } from "../../types/article";
import { useState } from "react";
import ArticleList from "../ArticleList";

export default function (props: { date: string; articles: Article[] }) {
  const [visible, setVisible] = useState(false);
  const calMaxHeight = props.articles.length * 40;
  return (
    <div className="mb-4 overflow-hidden">
      <div className="flex items-center mb-4 z-50 ">
        <div className="text-xl md:text-2xl font-bold">{props.date}</div>

        <div className="ml-2 text-sm md:text-base text-gray-400 font-normal">{`${props.articles.length}篇`}</div>
        <div
          onClick={() => {
            setVisible(!visible);
          }}
          style={{ width: 22.5 }}
          className="inline-block text-center leading-tight  font-normal text-lg bg-gray-200 rounded ml-2 cursor-pointer hover:bg-gray-500 hover:text-gray-100 transition-all"
        >
          +
        </div>
      </div>
      <div
        className="transition-all z-0 ml-3 "
        style={{ maxHeight: visible ? `${calMaxHeight}px` : "0" }}
        // style={{
        //   maxHeight: visible ? "max-content" : "0",
        //   overflowY: "hidden",
        //   transition: "max-height .4s linear",
        // }}
      >
        <ArticleList articles={props.articles}></ArticleList>
      </div>
    </div>
  );
}
