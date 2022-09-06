import RunningTime from "../RunningTime";
import Viewer from "../Viewer";

export default function (props: {
  ipcNumber: string;
  ipcHref: string;
  since: string;
  version: string;
}) {
  return (
    <>
      <footer className="text-center text-sm space-y-1 mt-8 md:mt-12 dark:text-dark">
        {Boolean(props.ipcNumber) && props.ipcNumber != "" && (
          <p className="">
            ICP 编号:{" "}
            <a
              href={props.ipcHref}
              target="_blank"
              className="hover:text-gray-900 hover:underline-offset-2 hover:underline dark:hover:text-dark-hover transition"
            >
              {props.ipcNumber}
            </a>
          </p>
        )}
        <RunningTime since={props.since}></RunningTime>
        <p className="">
          Powered By{" "}
          <a
            href="https://vanblog.mereith.com"
            target={"_blank"}
            className="hover:text-gray-900 hover:underline-offset-4 hover:underline dark:hover:text-dark-hover transition"
          >
            VanBlog <span>{props.version}</span>
          </a>
        </p>

        <p className="select-none">
          © {new Date(props.since).getFullYear()} - {new Date().getFullYear()}
        </p>
        <p className="select-none">
          <Viewer></Viewer>
        </p>
      </footer>
    </>
  );
}
