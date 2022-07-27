import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
export default function (props: { since: string }) {
  const [t, setT] = useState("");
  const { current } = useRef<any>({ timer: null });
  const since = dayjs(props.since);
  useEffect(() => {
    current.timer = setInterval(() => {
      const now = dayjs();
      const days = now.diff(since, "days");
      const hours = now.diff(since, "hours") - days * 24;
      const mins = now.diff(since, "minutes") - days * 24 * 60 - hours * 60;
      const secs =
        now.diff(since, "seconds") -
        days * 24 * 60 * 60 -
        hours * 60 * 60 -
        mins * 60;
      const s = `${days}天${hours}小时${mins}分${secs}秒`;
      setT(s);
    }, 1000);
    return () => {
      clearInterval(current.timer);
    };
  });
  return (
    <p>
      <span>本站居然运行了</span>
      <span>{t}</span>
    </p>
  );
}
