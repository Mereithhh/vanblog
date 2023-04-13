import { useCallback, useEffect, useRef, useState } from "react";
import { getArticleViewer } from "../../api/getArticleViewer";

export default function (props: {
  shouldAddViewer: boolean;
  id: number | string;
}) {
  const [viewer, setViewer] = useState(0);
  const { current } = useRef({ hasInit: false });
  const fetchViewer = useCallback(async () => {
    const res = await getArticleViewer(props.id);
    if (!res) {
      if (localStorage?.getItem("noViewer") === "true") {
        setViewer(0)
        return;
      }
      if (props.shouldAddViewer) {
        setViewer(1);
      } else {
        setViewer(0);
      }
    }
    if (res && res.viewer) {
      if (localStorage?.getItem("noViewer") === "true") {
        setViewer(res.viewer);
        return;
      }
      if (props.shouldAddViewer) {
        setViewer(res.viewer + 1);
      } else {
        setViewer(res.viewer);
      }
    }
  }, [setViewer, props]);
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      fetchViewer();
    }
  }, [fetchViewer, current]);

  return <span>{viewer}</span>;
}
