import Link from "next/link";

export default function (props: {
  children: any;
  href: string;
  newTab?: boolean;
}) {
  if (props.newTab) {
    return props.children;
  } else {
    return <Link href={props.href}>{props.children}</Link>;
  }
}
