import { useEffect, useMemo, useState } from "react";
import { SocialItem } from "../../api/getMeta";
import { topUpper } from "../../utils/TopUpper";
import SocialIcon from "../SocialIcon";

export default function (props: { socials: SocialItem[] }) {
  const [data, setData] = useState<SocialItem[][]>([]);
  useEffect(() => {
    if (!props.socials || !props.socials.length) {
      return;
    }
    // 拆分成两两一组
    const cols = Math.ceil(props.socials.length / 2);
    const r = [];
    for (let i = 0; i < cols; i++) {
      const t = [];
      for (let j = 0; j < 2; j++) {
        const temp = props.socials.shift();
        if (temp) {
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
        className="w-1/2  mx-1 flex items-center rounded-sm transition-all text-xs text-gray-500 dark:text-dark group  hover:bg-gray-200 dark:hover:bg-dark-light dark:hover:text-dark-r select-none cursor-pointer"
        style={{ padding: "2px 0" }}
      >
        {<SocialIcon item={item}></SocialIcon>}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {data.map((eachRow: SocialItem[]) => {
        return (
          <div
            className="w-full flex flex-row justify-between items-center"
            key={Math.floor(Math.random() * 1000000)}
          >
            {renderEach(eachRow[0])}
            {renderEach(eachRow[1])}
          </div>
        );
      })}
    </div>
  );
}
