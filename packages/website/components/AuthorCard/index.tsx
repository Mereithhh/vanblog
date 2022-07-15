import Image from "next/image";
import Link from "next/link";

export default function (props: {
  author: string;
  desc: string;
  logo: string;
  postNum: number;
  catelogNum: number;
  tagNum: number;
}) {
  return (
    <div className="flex flex-col justify-center items-center bg-white py-6 px-10 border ml-2 ">
      <Image
        className="rounded-full hover:rotate-180 duration-500 transition-all"
        src={props.logo}
        width={120}
        height={120}
      ></Image>

      <div className="mt-2 font-semibold text-gray-600 mb-2">
        {props.author}
      </div>
      <div className="text-sm text-gray-500 mb-2">{props.desc}</div>
      <div className="flex">
        <Link href="">
          <a className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1">
            <div className="font-bold group-hover:text-cyan-400">
              {props.postNum}
            </div>
            <div className="group-hover:text-cyan-400 text-gray-500">日志</div>
          </a>
        </Link>
        <Link href="">
          <a className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1">
            <div className="font-bold group-hover:text-cyan-400">
              {props.catelogNum}
            </div>
            <div className="group-hover:text-cyan-400 text-gray-500">分类</div>
          </a>
        </Link>
        <Link href="">
          <a className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1">
            <div className="group-hover:text-cyan-400 font-bold">
              {props.tagNum}
            </div>
            <div className=" group-hover:text-cyan-400 text-gray-500">标签</div>
          </a>
        </Link>
      </div>
    </div>
  );
}
