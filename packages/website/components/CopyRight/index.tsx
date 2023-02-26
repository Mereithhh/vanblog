import { useEffect, useMemo, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";

export default function (props: {
  author: string;
  id: number | string;
  showDonate: boolean;
  copyrightAggreement: string;
  customCopyRight: string | null;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${location.protocol}//${location.host}${location.pathname}`);
  }, [setUrl]);

  const text = useMemo(() => {
    if (props.customCopyRight) return props.customCopyRight;
    return `本博客所有文章除特别声明外，均采用 ${props.copyrightAggreement}
    许可协议。转载请注明出处！`;
  }, [props.customCopyRight, props.copyrightAggreement]);

  return (
    <div
      className={`bg-gray-100 px-5 border-l-4 border-red-500  py-2 text-sm space-y-1 dark:text-dark  dark:bg-dark ${
        !props.showDonate ? "mt-8" : ""
      }`}
    >
      <p>
        <span className="mr-2">本文作者:</span>
        <span>{props.author}</span>
      </p>
      <p>
        <span className="mr-2">本文链接:</span>
        <CopyToClipboard
          text={decodeURIComponent(url)}
          onCopy={() => {
            toast.success("复制成功！", {
              className: "toast",
            });
          }}
        >
          <span
            className="cursor-pointer border-b border-gray-100 hover:border-gray-500 dark:text-dark dark-border-hover dark:border-nav-dark"
            style={{ wordBreak: "break-all" }}
          >
            {decodeURIComponent(url)}
          </span>
        </CopyToClipboard>
      </p>
      <p>
        <span className="mr-2">版权声明:</span>
        <span>{text}</span>
      </p>
    </div>
  );
}
