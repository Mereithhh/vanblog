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
export default function (props: {
  enableComment: "true" | "false";
  count: number;
}) {
  const { current } = useRef<any>({ hasInit: false });
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    if (!current.hasInit && props.enableComment == "true") {
      current.hasInit = true;
      RecentComments({
        serverURL: `${window.location.protocol}//${window.location.host}/api`,
        count: props.count,
      }).then(({ comments }) => {
        setData(comments);
      });
    }
  }, [current, setData]);
  if (!props.enableComment || props.enableComment == "false") {
    return null;
  }
  return (
    <div className=" w-52 bg-white py-6 px-10 border ml-2 mt-2">
      {data.map((each: commentItem) => (
        <div key={each.insertedAt}>{each.nick}</div>
      ))}
    </div>
  );
}
