import MarkdownTocBar from "../MarkdownTocBar";

export default function (props: { content: string }) {
  return (
    <div className="block lg:hidden toc-mobile">
      <MarkdownTocBar
        content={props.content}
        headingOffset={56}
        mobile={true}
      />
    </div>
  );
}
