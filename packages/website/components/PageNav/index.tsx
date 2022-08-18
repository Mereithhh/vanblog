import { calItemList, PageNavProps } from "./core";
import { RenderItemList } from "./render";
export default function (props: PageNavProps) {
  const pageSize = props?.pageSize || 5;
  const show = props.total > pageSize;
  return show ? (
    <div className="mt-4">
      <div>
        <RenderItemList items={calItemList(props)}></RenderItemList>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
