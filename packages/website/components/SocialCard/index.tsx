import { useEffect, useState } from "react";
import { SocialItem } from "../../api/getAllData";
import SocialIcon from "../SocialIcon";

export default function (props: { socials: SocialItem[] }) {
  const [data, setData] = useState<SocialItem[][]>([]);
  useEffect(() => {
    if (!props.socials || !props.socials.length) {
      return;
    }
    const arr = props.socials.filter((each) => each.type != "wechat-dark");
    const darkWechat = props.socials.find((each) => each.type == "wechat-dark");
    // 拆分成两两一组
    const cols = Math.ceil(arr.length / 2);
    const r = [];
    for (let i = 0; i < cols; i++) {
      const t = [];
      for (let j = 0; j < 2; j++) {
        let temp = arr.shift();
        if (temp) {
          // 判断是不是微信
          if (temp.type == "wechat" && darkWechat) {
            temp = { ...temp, dark: darkWechat.value };
          }
          t.push(temp);
        }
      }
      r.push(t);
    }
    setData(r);
  }, [props, setData]);
  const renderEach = (item: SocialItem) => {
    if (!item) {
      return <div></div>;
    }
    return (
      <div
        className="w-1/2 mb-1  mx-1 flex items-center rounded-sm transition-all text-xs text-gray-500 dark:text-dark group  hover:bg-gray-200 dark:hover:bg-dark-light dark:hover:text-dark-r select-none cursor-pointer"
        style={{ padding: "2px 0" }}
      >
        {<SocialIcon item={item}></SocialIcon>}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {data.map((eachRow: SocialItem[], index) => {
        return (
          <div
            className="w-full flex flex-row justify-between items-center"
            key={`socalRow-${index}`}
          >
            {renderEach(eachRow[0])}
            {renderEach(eachRow[1])}
          </div>
        );
      })}
    </div>
  );
}
