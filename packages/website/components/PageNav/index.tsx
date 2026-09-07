import { calItemList, PageNavProps, shouldShowPageNav } from "./core";
import { RenderItemList } from "./render";
export default function (props: PageNavProps) {
  return shouldShowPageNav(props.total, props.pageSize) ? (
    <div className="mt-4">
      <div>
        <RenderItemList items={calItemList(props)} jump={props}></RenderItemList>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
