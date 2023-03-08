import Image from "next/image";
import Head from "next/head";
import Link from "next/link";

export default function (props: { name?: string }) {
  return (
    <>
      <Head>
        <title>{`此${props?.name ? props.name : "页面"}不存在`}</title>
        <link rel="icon" href={"/logo.svg"}></link>
      </Head>
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
            {`此${props?.name ? props.name : "页面"}不存在`}
          </div>
          <Link href="/">
            <div className="mt-4 ua ua-link text-base text-gray-600 dark:text-dark">
              返回主页
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
