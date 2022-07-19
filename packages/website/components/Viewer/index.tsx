import { useCallback, useEffect, useRef, useState } from "react";
import { addViewerWithApiRoute } from "../../api/addViewer";
export default function () {
  const [viewer, setViewer] = useState(0);
  const [visited, setVisited] = useState(0);
  const { current } = useRef<any>({ hasInit: false });
  const fetchViewer = useCallback(async () => {
    const result = await addViewerWithApiRoute();
    setViewer(result.viewer);
    setVisited(result.visited);
  }, [setViewer, setVisited]);
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      fetchViewer();
    }
  }, [current, fetchViewer]);
  // 全站浏览量统计
  return (
    <span>
      <span>{visited}</span>
      <span>{viewer}</span>
    </span>
  );
}
