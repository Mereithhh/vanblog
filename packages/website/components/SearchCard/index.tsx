import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { searchArticles, searchWithApiRoute } from "../../api/search";
import { useDebounce } from "react-use";
import ArticleList from "../ArticleList";

export default function (props: {
  visible: boolean;
  setVisible: (v: boolean) => void;
}) {
  const [result, setResult] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const innerRef = useRef(null);
  const inputRef = useRef(null);
  const onSearch = async (search: string) => {
    setTyping(false);
    setLoading(true);
    const resultFromServer = await searchWithApiRoute(search);
    console.log(resultFromServer);
    setResult(resultFromServer);
    setLoading(false);
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
  useEffect(() => {
    if (inputRef.current) {
      (inputRef.current as any).focus();
    }
  }, [inputRef]);

  const showClear = useMemo(() => {
    return search.trim() !== "";
  }, [search]);
  const renderResult = () => {
    let text = "";
    if (loading) {
      text = "搜索中...";
    } else {
      if (search.trim() == "") {
        text = "请输入并搜索";
      } else {
        // 有数字，有结果
        if (result.length) {
          text = "有结果";
        } else {
          // 可能是暂无结果或者输入中
          if (typing) {
            text = "输入中";
          } else {
            text = "暂无结果";
          }
        }
      }
    }
    if (text == "有结果") {
      return (
        <div>
          <ArticleList showYear={true} articles={result}></ArticleList>
        </div>
      );
    } else {
      return (
        <div className="mt-16 text-center">
          <div className="text-gray-600">{text}</div>
        </div>
      );
    }
  };

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
            // 外
            document.body.style.overflow = "auto";
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
          transform: props.visible ? "scale(100%)" : "scale(0)",
        }}
      >
        <div className="flex items-center">
          <Image src="/zoom.svg" width={24} height={24}></Image>
          <input
            ref={inputRef}
            value={search}
            onChange={(ev) => {
              setTyping(true);
              setSearch(ev.currentTarget.value);
              if (ev.currentTarget.value.trim() == "") {
                setResult([]);
              }
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
              setResult([]);
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
        <div className="" style={{ maxHeight: 400, overflowY: "auto" }}>
          {renderResult()}
        </div>
      </div>
    </div>
  );
}
