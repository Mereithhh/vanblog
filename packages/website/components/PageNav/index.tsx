import { calItemList, PageNavProps } from "./core";
import { RenderItemList } from "./render";
export default function (props: PageNavProps) {
  return (
    <div className="mt-4">
      <div>
        <RenderItemList items={calItemList(props)}></RenderItemList>
      </div>
    </div>
  );
}
