import dynamic from "next/dynamic";
export default function (props: {
  enable: "true" | "false";
  visible: boolean;
}) {
  if (!props.enable || props.enable == "false") {
    return null;
  } else {
    const Core = dynamic(() => import("./core"));
    return <Core enable={props.enable} visible={props.visible} />;
  }
}
