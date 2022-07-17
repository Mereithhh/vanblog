import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { searchArticles, searchWithApiRoute } from "../../api/search";
import { useDebounce } from "react-use";

export default function (props: {
  visible: boolean;
  setVisible: (v: boolean) => void;
}) {
  const [result, setResult] = useState<any>([]);
  const [search, setSearch] = useState("");
  const onSearch = async (search: string) => {
    const resultFromServer = await searchWithApiRoute(search);
    console.log(resultFromServer);
  };
  useDebounce(
    () => {
      if (search.trim() !== "") {
        onSearch(search);
      }
    },
    500,
    [search]
  );
  const innerRef = useRef(null);
  const showClear = useMemo(() => {
    return search.trim() !== "";
  }, [search]);
  return (
    <div
      className="fixed w-full h-full top-0 left-0 right-0 bottom-0  justify-center items-center flex"
      style={{
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.4)",
        visibility: props.visible ? "visible" : "hidden",
      }}
      onClick={(ev) => {
        if (innerRef.current) {
          if (!(innerRef.current as any).contains(ev.target as any)) {
            // 在内
            props.setVisible(false);
          }
        }
      }}
    >
      <div
        ref={innerRef}
        className="bg-white w-2/3  p-4 rounded-xl shadow-lg transition-all"
        style={{
          minHeight: "280px",
          minWidth: 400,
          maxWidth: "710px",
          transform: props.visible
            ? "translateY(-30%) scale(100%)"
            : "translateY(-30%) scale(0)",
        }}
      >
        <div className="flex items-center">
          <Image src="/zoom.svg" width={24} height={24}></Image>
          <input
            value={search}
            autoFocus={true}
            onChange={(ev) => {
              setSearch(ev.currentTarget.value);
            }}
            placeholder={"搜索内容"}
            className="w-full ml-2 text-base "
            style={{
              height: 32,
              appearance: "none",
              border: "none",
              outline: "medium",
            }}
          ></input>

          <div
            className="transition-all transform hover:scale-125"
            style={{
              visibility: showClear ? "visible" : "hidden",
            }}
            onClick={() => {
              setSearch("");
            }}
          >
            <Image
              src="/clear.svg"
              width={20}
              height={20}
              className="cursor-pointer"
              color="#aaa"
            ></Image>
          </div>
        </div>
        <hr className="my-2"></hr>
      </div>
    </div>
  );
}
