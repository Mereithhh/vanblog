import { useCallback, useEffect, useRef, useState } from "react";
import { addViewerWithApiRoute } from "../../api/addViewer";
export default function () {
  const [num, setNum] = useState(0);
  const { current } = useRef<any>({ hasInit: false });
  const fetchViewer = useCallback(async () => {
    const result = await addViewerWithApiRoute();
    setNum(result);
  }, [setNum]);
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      fetchViewer();
    }
  }, [current, fetchViewer]);
  // 全站浏览量统计
  return <span>{num}</span>;
}
