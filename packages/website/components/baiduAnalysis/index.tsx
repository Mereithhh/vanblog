import { useEffect, useRef } from "react";
export default function (props: { id: string }) {
  const { current } = useRef<any>({ hasInit: false });
  useEffect(() => {
    if (!current.hasInit && props.id != "") {
      current.hasInit = true;
      var _hmt: any = _hmt || [];
      (function () {
        var hm = document.createElement("script");
        hm.src = `https://hm.baidu.com/hm.js?${props.id}`;
        var s = document.getElementsByTagName("script")[0];
        s.parentNode?.insertBefore(hm, s);
      })();
    }
  }, [current, props]);
  return <></>;
}
