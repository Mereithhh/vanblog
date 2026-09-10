import { normalizeArticleCover } from "../../utils/articleCover";

export const ARTICLE_COVER_ATTR = "data-article-cover";

export default function ArticleCover(props: {
  src?: string | null;
  alt?: string;
}) {
  const src = normalizeArticleCover(props.src);
  if (!src) return null;
  return (
    <div
      className="article-cover -mt-4 -mx-1 sm:-mx-3 md:-mt-6 md:-mx-5 mb-4 overflow-hidden"
      data-article-cover
    >
      <img
        src={src}
        alt={props.alt || ""}
        className="block w-full max-h-80 object-cover"
      />
    </div>
  );
}
