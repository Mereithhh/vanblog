import Image from "next/future/image";
import Link from "next/link";

export default function Custom404() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ top: 0, left: 0, bottom: 0, right: 0, position: "absolute" }}
    >
      <div
        className="flex flex-col items-center justify-center select-none"
        style={{ transform: "translateY(-30%)" }}
      >
        <Image alt="logo" src="/logo.svg" width={200} height={200} />
        <div className="mt-4 text-gray-600 font-base text-xl dark:text-dark">
          此页面不存在
        </div>
        <Link href="/">
          <a className="mt-4 ua text-base text-gray-600 dark:text-dark">
            返回主页
          </a>
        </Link>
      </div>
    </div>
  );
}
