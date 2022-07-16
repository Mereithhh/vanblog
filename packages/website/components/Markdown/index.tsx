import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
export default function (props: { content: string }) {
  return <ReactMarkdown children={props.content} remarkPlugins={[remarkGfm]} />;
}
