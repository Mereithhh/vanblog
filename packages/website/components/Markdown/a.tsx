export default function (props: any) {
  const txt = props.children[0] || "";
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {txt}
    </a>
  );
}
