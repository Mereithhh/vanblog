import { useMemo } from "react";
import Core from "./core";
import { NavItem, parseNavStructure } from "./tools";

export default function (props: {
  content: string;
  headingOffset?: number;
  mobile?: boolean;
  onNavigate?: (item: NavItem) => void;
}) {
  const navData = useMemo(() => {
    return parseNavStructure(props.content);
  }, [props]);
  return (
    <Core
      items={navData}
      mobile={props.mobile}
      headingOffset={props.headingOffset || 0}
      onNavigate={props.onNavigate}
    />
  );
}
