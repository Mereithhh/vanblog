import Head from "next/head";
import { getRunTimeOfDays } from "../../utils/getRunTile";
import NavBar from "../NavBar";

export default function (props: {
  title?: string;
  children: any;
  ipcNumber: string;
  since: Date;
  ipcHref: string;
  logo: string;
  categories: string[];
  sideBar: any;
}) {
  return (
    <>
      <NavBar logo={props.logo} categories={props.categories}></NavBar>
      <div className="container mx-auto  md:px-6  md:py-6 py-2 px-2 text-gray-600 mt-14 md:mt-24">
        {props?.title && (
          <Head>
            <title>{props.title}</title>
          </Head>
        )}

        {
          <div className="flex max-w-5xl mx-auto">
            <div className="flex-grow">{props.children}</div>
            <div className="hidden lg:block">{props.sideBar}</div>
          </div>
        }
        <footer className="text-center text-sm space-y-1 mt-8 md:mt-12">
          <p>
            IPC 编号:{" "}
            <a
              href={props.ipcHref}
              target="_blank"
              className="hover:text-cyan-400 transition"
            >
              {props.ipcNumber}
            </a>
          </p>
          <p>
            © {props.since.getFullYear()} - {new Date().getFullYear()}
          </p>
          <p>本站居然运行了 {getRunTimeOfDays(props.since)} 天</p>
        </footer>
      </div>
    </>
  );
}
