import { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import RssLogo from "../RssLogo";
import {
  HEADER_ACTION_LABELS,
  ICON_ACTION_BUTTON_CLASS,
} from "../NavBar/a11y";

export default function (props: { showAdminButton: boolean }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${location.protocol}//${location.host}/feed.xml`);
  }, [setUrl]);
  return (
    <CopyToClipboard
      text={url}
      onCopy={() => {
        toast.success("已复制 RSS 订阅地址到剪切板！", {
          className: "toast",
        });
      }}
    >
      <button
        type="button"
        title={HEADER_ACTION_LABELS.rss}
        aria-label={HEADER_ACTION_LABELS.rss}
        className={`${ICON_ACTION_BUTTON_CLASS} flex items-center justify-center cursor-pointer hover:scale-125 transform transition-all ${
          props.showAdminButton
            ? "mr-4 md:mr-6 lg:mr-2 "
            : "mr-4 md:mr-4 lg:mr-4"
        }`}
      >
        <span className="dark:text-dark text-gray-600" aria-hidden="true">
          <RssLogo size={20} />
        </span>
      </button>
    </CopyToClipboard>
  );
}
