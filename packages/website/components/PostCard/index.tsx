import dayjs from "dayjs";
import Link from "next/link";

export default function (props: {
  title: string;
  createdAt: Date;
  catelog: string;
}) {
  return (
    <div className="bg-white border py-4 px-3 md:py-6 md:px-5">
      <div className="text-2xl text-center font-medium mb-2">{props.title}</div>
      <div className="text-center text-sm divide-x divide-gray-500 text-gray-500">
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
      <div></div>
    </div>
  );
}
