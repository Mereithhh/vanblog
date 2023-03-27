import { useContext, useMemo, useState } from "react";
import { ThemeContext } from "../../utils/themeContext";

export default function (props: {
  aliPay: string;
  weChatPay: string;
  aliPayDark: string;
  weChatPayDark: string;
  author: string;
  id: number | string;
}) {
  const [show, setShow] = useState(false);
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

  return (
    <div className="mt-8">
      {props.aliPay != "" && (
        <>
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
              <img alt="ali pay" src={payUrl[0]} width={180} height={250} />
              <div className="w-4 inline-block"></div>
              <img alt="wechat pay" src={payUrl[1]} width={180} height={250} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
