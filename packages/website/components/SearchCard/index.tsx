import { useEffect, useMemo, useRef, useState } from "react";
import { searchArticles } from "../../api/search";
import { useDebounce } from "react-use";
import ArticleList from "../ArticleList";
import KeyCard from "../KeyCard";

export default function (props: {
  visible: boolean;
  setVisible: (v: boolean) => void;
  openArticleLinksInNewWindow: boolean;
}) {
  const [result, setResult] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const innerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key == "Escape") {
      props.setVisible(false);
      event?.preventDefault();
      document.body.style.overflow = "auto";
    }
    if (ev.ctrlKey == true || ev.metaKey == true) {
      if (ev.key.toLocaleLowerCase() == "k") {
        props.setVisible(true);
        event?.preventDefault();
        document.body.style.overflow = "hidden";
      }
    }
    return false;
  };
  const onSearch = async (search: string) => {
    setTyping(false);
    setLoading(true);
    const resultFromServer = await searchArticles(search);
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
          <ArticleList
            showYear={true}
            articles={result}
            openArticleLinksInNewWindow={props.openArticleLinksInNewWindow}
            onClick={() => {
              props.setVisible(false);
              document.body.style.overflow = "auto";
            }}
          ></ArticleList>
        </div>
      );
    } else {
      return (
        <div className="mt-16 text-center">
          <div className="text-gray-600 dark:text-dark select-none">{text}</div>
        </div>
      );
    }
  };

  return (
    <div
      className="fixed w-full h-full top-0 left-0 right-0 bottom-0  justify-center items-center flex"
      style={{
        zIndex: 100,
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
        className="bg-white w-3/4  p-4 rounded-xl card-shadow dark:card-shadow-dark transition-all dark:bg-dark"
        style={{
          minHeight: "280px",
          minWidth: 360,
          maxWidth: "710px",
          transform: props.visible ? "scale(100%)" : "scale(0)",
        }}
        onTransitionEnd={() => {
          if (props.visible) {
            inputRef.current?.focus();
          }
        }}
      >
        <div className="flex items-center dark:text-dark text-gray-600">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="2305"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M789.804097 737.772047 742.865042 784.699846 898.765741 940.600545 945.704796 893.672746Z"
              p-id="2306"
            ></path>
            <path
              d="M456.92259 82.893942c-209.311143 0-379.582131 170.282245-379.582131 379.582131s170.270988 379.570875 379.582131 379.570875c209.287607 0 379.558595-170.270988 379.558595-379.570875S666.210197 82.893942 456.92259 82.893942zM770.128989 462.477097c0 172.721807-140.508127 313.229934-313.206398 313.229934-172.720783 0-313.229934-140.508127-313.229934-313.229934s140.508127-313.229934 313.229934-313.229934C629.620861 149.247162 770.128989 289.75529 770.128989 462.477097z"
              p-id="2307"
            ></path>
          </svg>
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
              backgroundColor: "inherit",
            }}
          ></input>

          <div
            className="transition-all transform hover:scale-125 text-gray-600 dark:text-dark"
            style={{
              visibility: showClear ? "visible" : "hidden",
            }}
            onClick={() => {
              setSearch("");
              setResult([]);
            }}
          >
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              p-id="2258"
              width="20"
              height="20"
              className="cursor-pointer"
            >
              <path
                d="M512 39.384615C250.092308 39.384615 39.384615 250.092308 39.384615 512s210.707692 472.615385 472.615385 472.615385 472.615385-210.707692 472.615385-472.615385S773.907692 39.384615 512 39.384615z m96.492308 488.369231l153.6 153.6c7.876923 7.876923 7.876923 19.692308 0 27.569231l-55.138462 55.138461c-7.876923 7.876923-19.692308 7.876923-27.569231 0L525.784615 610.461538c-7.876923-7.876923-19.692308-7.876923-27.56923 0l-153.6 153.6c-7.876923 7.876923-19.692308 7.876923-27.569231 0L261.907692 708.923077c-7.876923-7.876923-7.876923-19.692308 0-27.569231l153.6-153.6c7.876923-7.876923 7.876923-19.692308 0-27.569231l-155.56923-155.56923c-7.876923-7.876923-7.876923-19.692308 0-27.569231l55.138461-55.138462c7.876923-7.876923 19.692308-7.876923 27.569231 0l155.569231 155.569231c7.876923 7.876923 19.692308 7.876923 27.56923 0l153.6-153.6c7.876923-7.876923 19.692308-7.876923 27.569231 0l55.138462 55.138462c7.876923 7.876923 7.876923 19.692308 0 27.56923l-153.6 153.6c-5.907692 7.876923-5.907692 19.692308 0 27.569231z"
                p-id="2259"
              ></path>
            </svg>
          </div>
          <KeyCard type="esc"></KeyCard>
        </div>
        <hr className="my-2 dark:border-hr-dark"></hr>
        <div
          className="dark:text-dark"
          style={{ maxHeight: 400, overflowY: "auto" }}
        >
          {renderResult()}
        </div>
      </div>
    </div>
  );
}
