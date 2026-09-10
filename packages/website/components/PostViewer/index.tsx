import { useCallback, useEffect, useRef, useState } from "react";
import { getArticleViewer } from "../../api/getArticleViewer";
import {
  formatCountDisplay,
  resolveArticleViewer,
} from "../../utils/countPlaceholder";

export default function (props: {
  shouldAddViewer: boolean;
  id: number | string;
}) {
  const [viewer, setViewer] = useState<number | null>(null);
  const { current } = useRef({ hasInit: false });
  const fetchViewer = useCallback(async () => {
    const res = await getArticleViewer(props.id);
    const noViewer = localStorage?.getItem("noViewer") === "true";
    setViewer(
      resolveArticleViewer(res, {
        shouldAddViewer: props.shouldAddViewer,
        noViewer,
      })
    );
  }, [props.id, props.shouldAddViewer]);
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      fetchViewer();
    }
  }, [fetchViewer, current]);

  return (
    <span data-article-viewer aria-busy={viewer === null}>
      {formatCountDisplay(viewer)}
    </span>
  );
}
