import { useMemo } from "react";
import Core from "./core";
import { parseNavStructure } from "./tools";

export default function (props: { content: string; headingOffset?: number }) {
  const navData = useMemo(() => {
    return parseNavStructure(props.content);
  }, [props]);

  return <Core items={navData} headingOffset={props.headingOffset || 0} />;
}
