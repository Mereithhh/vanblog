export default function (props: any) {
  let text = "";
  try {
    text = props.children[0] as string;
  } catch (err) {
    text = "";
  }
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {text}
    </a>
  );
}
