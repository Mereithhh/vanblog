import { useEffect, useRef, useState } from "react";
import { RecentComments } from "@waline/client";
export interface commentItem {
  url: string;
  comment: string;
  addr: string;
  browser: string;
  avatar: string;
  like: number;
  nick: string;
  insertedAt: string;
  os: string;
}
export default function (props: { walineServerUrl: string; count: number }) {
  const { current } = useRef<any>({ hasInit: false });
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      RecentComments({
        serverURL: props.walineServerUrl,
        count: props.count,
      }).then(({ comments }) => {
        setData(comments);
        console.log(comments);
      });
    }
  }, [current, setData]);
  return (
    <div className=" w-52 bg-white py-6 px-10 border ml-2 mt-2">
      {data.map((each: commentItem) => (
        <div key={each.insertedAt}>{each.nick}</div>
      ))}
    </div>
  );
}
