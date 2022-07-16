import Pagination from "rc-pagination";
import { useRouter } from "next/router";

export default function (props: {
  total: number;
  current: number;
  base: string;
  more: string;
}) {
  const router = useRouter();
  return (
    <div className="mt-4">
      <Pagination
        className="text-center"
        total={props.total}
        defaultPageSize={5}
        current={props.current}
        onChange={(p) => {
          if (p == props.current) {
            return;
          }
          if (p == 1) {
            router.push(`${props.base}/${p}`);
          } else {
            router.push(`${props.more}/${p}`);
          }
        }}
      ></Pagination>
    </div>
  );
}
