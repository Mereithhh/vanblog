import ImageBox from "../ImageBox";
import RunningTime from "../RunningTime";
import Viewer from "../Viewer";

export default function (props: {
  ipcNumber: string;
  ipcHref: string;
  since: string;
  version: string;
  // 公安备案
  gaBeianNumber: string;
  gaBeianUrl: string;
  gaBeianLogoUrl: string;
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
        {Boolean(props.gaBeianNumber) && props.gaBeianNumber != "" && (
          <p className="flex justify-center items-center">
            公安备案:{" "}
            {Boolean(props.gaBeianLogoUrl) && props.gaBeianLogoUrl != "" && (
              <ImageBox
                src={props.gaBeianLogoUrl}
                lazyLoad={true}
                alt="公安备案 logo"
                width={20}
              />
            )}
            <a
              href={props.gaBeianUrl}
              target="_blank"
              className="hover:text-gray-900 hover:underline-offset-2 hover:underline dark:hover:text-dark-hover transition"
            >
              {props.gaBeianNumber}
            </a>
          </p>
        )}
        <RunningTime since={props.since}></RunningTime>
        <p className="">
          Powered By{" "}
          <a
            href="https://vanblog.mereith.com"
            target={"_blank"}
            className="hover:text-gray-900  dark:hover:text-dark-hover transition ua ua-link"
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
