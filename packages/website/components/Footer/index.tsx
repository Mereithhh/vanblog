import ImageBox from "../ImageBox";
import RunningTime from "../RunningTime";
import Viewer from "../Viewer";

export default function ({
  ipcHref,
  ipcNumber,
  since,
  version,
  gaBeianLogoUrl,
  gaBeianNumber,
  gaBeianUrl,
}: {
  // 公安备案
  gaBeianNumber: string;
  gaBeianUrl: string;
  gaBeianLogoUrl: string;
  // ipc
  ipcNumber: string;
  ipcHref: string;
  since: string;
  version: string;
}) {
  return (
    <>
      <footer className="text-center text-sm space-y-1 mt-8 md:mt-12 dark:text-dark footer-icp-number">
        {Boolean(ipcNumber) && (
          <p className="">
            ICP 编号:&nbsp;
            <a
              href={ipcHref}
              target="_blank"
              className="hover:text-gray-900 hover:underline-offset-2 hover:underline dark:hover:text-dark-hover transition"
            >
              {ipcNumber}
            </a>
          </p>
        )}
        {Boolean(gaBeianNumber) && (
          <p className="flex justify-center items-center footer-gongan-beian">
            公安备案:&nbsp;
            {Boolean(gaBeianLogoUrl) && (
              <ImageBox
                src={gaBeianLogoUrl}
                lazyLoad={true}
                alt="公安备案 logo"
                width={20}
              />
            )}
            <a
              href={gaBeianUrl}
              target="_blank"
              className="hover:text-gray-900 hover:underline-offset-2 hover:underline dark:hover:text-dark-hover transition"
            >
              {gaBeianNumber}
            </a>
          </p>
        )}
        <RunningTime since={since}></RunningTime>
        <p className="footer-powered-by-vanblog">
          Powered By&nbsp;
          <a
            href="https://vanblog.mereith.com"
            target={"_blank"}
            className="hover:text-gray-900 dark:hover:text-dark-hover transition ua ua-link"
          >
            VanBlog <span>{version}</span>
          </a>
        </p>

        <p className="select-none footer-copy-right">
          © {new Date(since).getFullYear()} - {new Date().getFullYear()}
        </p>
        <p className="select-none footer-viewer">
          <Viewer></Viewer>
        </p>
      </footer>
    </>
  );
}
