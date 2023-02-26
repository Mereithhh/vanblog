import { useState } from "react";
import { getArticleByIdOrPathnameWithPassword } from "../../api/getArticles";
import toast from "react-hot-toast";
import Loading from "../Loading";

export default function (props: {
  id: number | string;
  setLock: (l: boolean) => void;
  setContent: (s: string) => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const onSuccess = (message: string) => {
    toast.success(message, {
      className: "toast",
    });
  };
  const onError = (message: string) => {
    toast.error(message, {
      className: "toast",
    });
  };
  const fetchArticle = async () => {
    try {
      const res = await getArticleByIdOrPathnameWithPassword(props.id, value);
      if (!res) {
        onError("密码错误！请重试！");
        return false;
      }
      return res;
    } catch (err) {
      onError("密码错误！请重试！");
      return false;
    }
  };
  const handleClick = async () => {
    if (value == "") {
      onError("输入不能为空！");
      return;
    }
    setLoading(true);
    try {
      const article = await fetchArticle();
      if (article) {
        setLoading(false);
        onSuccess("解锁成功！");
        props.setContent(article.content);
        props.setLock(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      onError("解锁失败！");
      setLoading(false);
    }
  };
  return (
    <>
      <Loading loading={loading}>
        <div className="mb-2">
          <p className="mb-2 text-gray-600 dark:text-dark ">
            文章已解锁，请输入密码后查看：
          </p>
          <div className="flex items-center">
            <div className=" bg-gray-100 rounded-md dark:bg-dark-2 overflow-hidden flex-grow">
              <input
                type="password"
                value={value}
                onChange={(ev) => {
                  setValue(ev.currentTarget.value);
                }}
                placeholder={"请输入密码"}
                className="ml-2 w-full text-base dark:text-dark "
                style={{
                  height: 32,
                  appearance: "none",
                  border: "none",
                  outline: "medium",
                  backgroundColor: "inherit",
                }}
              ></input>
            </div>
            <button
              onClick={handleClick}
              className="flex-grow-0 text-gray-500 dark:text-dark ml-2 rounded-md dark:bg-dark-2 bg-gray-200 transition-all hover:text-lg  w-20 h-8"
            >
              确认
            </button>
          </div>
        </div>
      </Loading>
    </>
  );
}
