import { PhotoProvider } from "react-photo-view";
export default function (props: { children: any }) {
  return <PhotoProvider children={props.children} />;
}
