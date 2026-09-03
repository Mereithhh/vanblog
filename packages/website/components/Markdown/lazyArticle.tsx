import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  LOAD_REMAINING_MARKDOWN_EVENT,
  splitLazyMarkdown,
} from "../../utils/lazyMarkdown";

export default function LazyArticleContent(props: {
  content: string;
  render: (markdown: string) => ReactNode;
}) {
  const split = useMemo(
    () => splitLazyMarkdown(props.content),
    [props.content]
  );
  const [showTail, setShowTail] = useState(() => !split.tail);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowTail(!split.tail);
  }, [props.content, split.tail]);

  useEffect(() => {
    if (!split.tail || showTail) return;
    const load = () => setShowTail(true);
    window.addEventListener(LOAD_REMAINING_MARKDOWN_EVENT, load);
    if (window.location.hash) {
      load();
    }
    return () => {
      window.removeEventListener(LOAD_REMAINING_MARKDOWN_EVENT, load);
    };
  }, [split.tail, showTail]);

  useEffect(() => {
    if (!split.tail || showTail) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShowTail(true);
      }
    });
    io.observe(node);
    return () => io.disconnect();
  }, [split.tail, showTail]);

  return (
    <>
      {props.render(showTail ? props.content : split.head)}
      {split.tail && !showTail ? (
        <div
          ref={sentinelRef}
          data-lazy-markdown-sentinel=""
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
