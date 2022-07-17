import Pagination from "rc-pagination";
import { useRouter } from "next/router";
import { useState } from "react";
export default function (props: {
  total: number;
  current: number;
  base: string;
  more: string;
  pageSize?: number;
}) {
  const router = useRouter();
  const [page, setPage] = useState(props.current);
  return (
    <div className="mt-4">
      <Pagination
        className="text-center"
        total={props.total}
        defaultPageSize={props.pageSize || 5}
        current={page}
        onChange={(p) => {
          if (p == props.current) {
            return;
          }
          if (p == 1) {
            router.push(`${props.base}/`);
          } else {
            router.push(`${props.more}/${p}`);
          }
          setPage(p);
        }}
      ></Pagination>
    </div>
  );
}
