import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";

export default function (props: { author: string; id: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(window.location.href);
  }, [setUrl]);

  return (
    <div className="bg-gray-100 px-5 border-l-4 border-red-500  py-2 text-sm space-y-1 dark:text-dark  dark:bg-dark ">
      <p>
        <span className="mr-2">本文作者:</span>
        <span>{props.author}</span>
      </p>
      <p>
        <span className="mr-2">本文链接:</span>
        <CopyToClipboard
          text={url}
          onCopy={() => {
            toast.success("复制成功！", {
              className: "toast",
            });
          }}
        >
          <span
            className="cursor-pointer border-b border-white hover:border-gray-500 dark:text-dark dark-border-hover dark:border-nav-dark"
            style={{ wordBreak: "break-all" }}
          >
            {url}
          </span>
        </CopyToClipboard>
      </p>
      <p>
        <span className="mr-2">版权声明:</span>
        <span>
          本博客所有文章除特别声明外，均采用 BY-NC-SA 许可协议。转载请注明出处！
        </span>
      </p>
    </div>
  );
}
