import Link from "next/link";

export default function (props: {
  children: any;
  href: string;
  newTab?: boolean;
}) {
  if (props.newTab) {
    return (
      <a href={props.href} target="_blank">
        {props.children}
      </a>
    );
  } else {
    return <Link href={props.href}>{props.children}</Link>;
  }
}
