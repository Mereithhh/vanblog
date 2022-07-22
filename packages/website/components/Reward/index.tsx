import { useContext, useEffect, useMemo, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import Swal from "sweetalert2";
import { ThemeContext } from "../../utils/themeContext";
export default function (props: {
  aliPay: string;
  weChatPay: string;
  aliPayDark: string;
  weChatPayDark: string;
  author: string;
  id: number;
}) {
  const [show, setShow] = useState(true);
  const { theme } = useContext(ThemeContext);
  const payUrl = useMemo(() => {
    const r = [];
    if (theme.includes("dark") && props.aliPayDark != "") {
      r.push(props.aliPayDark);
    } else {
      r.push(props.aliPay);
    }
    if (theme.includes("dark") && props.weChatPayDark != "") {
      r.push(props.weChatPayDark);
    } else {
      r.push(props.weChatPay);
    }
    return r;
  }, [theme, props]);
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(window.location.href);
  }, [setUrl]);

  return (
    <div className="mt-8">
      <div className="text-center  select-none text-sm md:text-base mb-2 dark:text-dark">
        如果对你有用的话，可以打赏哦
      </div>
      <div className="flex justify-center mb-6 ">
        <div
          onClick={() => [setShow(!show)]}
          className="text-sm md:text-base   text-gray-100 bg-red-600 rounded px-4 select-none cursor-pointer hover:bg-red-400 py-1"
        >
          打赏
        </div>
      </div>
      <div
        className=" justify-center overflow-hidden transition-all"
        style={{
          maxHeight: show ? "3000px" : "0px",
          marginBottom: show ? "16px" : "0",
        }}
      >
        <div className="flex justify-center">
          <img src={payUrl[0]} width={180} height={250}></img>
          <div className="w-4 inline-block"></div>
          <img src={payUrl[1]} width={180} height={250}></img>
        </div>
      </div>
      <div className=" bg-gray-100 px-5 border-l-4 border-red-500  py-2 text-sm space-y-1 dark:text-dark  dark:bg-dark ">
        <p>
          <span className="mr-2">本文作者:</span>
          <span>{props.author}</span>
        </p>
        <p>
          <span className="mr-2">本文链接:</span>
          <CopyToClipboard
            text={url}
            onCopy={() => {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "复制成功！",
                showConfirmButton: false,
                timer: 1000,
              });
            }}
          >
            <span className="cursor-pointer border-b border-white hover:border-gray-500 dark:text-dark dark-border-hover dark:border-nav-dark">
              {url}
            </span>
          </CopyToClipboard>
        </p>
        <p>
          <span className="mr-2">版权声明:</span>
          <span>
            本博客所有文章除特别声明外，均采用 BY-NC-SA
            许可协议。转载请注明出处！
          </span>
        </p>
      </div>
    </div>
  );
}
