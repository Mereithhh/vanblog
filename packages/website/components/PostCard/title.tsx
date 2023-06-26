import dayjs from "dayjs";
import Link from "next/link";
import { useMemo } from "react";
import { encodeQuerystring } from "../../utils/encode";
import PostViewer from "../PostViewer";
import { getTarget } from "../Link/tools";
import { checkLogin } from "../../utils/auth";

export function Title(props: {
  type: "article" | "about" | "overview";
  id: number | string;
  title: string;
  openArticleLinksInNewWindow: boolean;
  showEditButton: boolean;
}) {
  const showEditButton = props.showEditButton && checkLogin();
  const newTab = useMemo(() => {
    if (props.type == "overview" && props.openArticleLinksInNewWindow) {
      return true;
    }
    return false;
  }, [props]);
  return (
    <div className="flex justify-center post-card-title ">
      {props.type != "about" ? (
        <Link href={`/post/${props.id}`} target={getTarget(newTab)} style={{width:"90%"}} title={props.title}>
          <div
            className={`text-lg block font-medium overflow-hidden text-ellipsis whitespace-nowrap px-5  text-center mb-2 mt-2 dark:text-dark text-gray-700 ${
              showEditButton ? "ml-8" : ""
            } md:text-${props.type == "overview" ? "xl" : "2xl"} ua ua-link`}
          >
            {props.title}
          </div>
        </Link>
      ) : (
        <div
          className={`text-lg block font-medium mb-2 mt-2 dark:text-dark text-gray-700 md:text-2xl ua ua-link  select-none ${
            showEditButton ? "ml-12 mr-4" : ""
          }`}
        >
          {props.title}
        </div>
      )}
      {showEditButton && (
        <a
          className="flex items-center"
          href={
            props.type === "about"
              ? "/admin/editor?type=about"
              : `/admin/editor?type=article&id=${props.id}`
          }
          target="_blank"
        >
          <div className=" text-dark dark:text-gray-700">
            <div>编辑</div>
          </div>
        </a>
      )}
    </div>
  );
}
export function SubTitle(props: {
  type: "article" | "about" | "overview";
  updatedAt: Date;
  createdAt: Date;
  catelog: string;
  enableComment: "true" | "false";
  id: number | string;
  openArticleLinksInNewWindow: boolean;
}) {
  const iconSize = "16";
  const iconClass =
    "mr-1 fill-gray-400 dark:text-dark dark:group-hover:text-dark-hover group-hover:text-gray-900 ";

  const dataPath = useMemo(() => {
    if (props.type == "about") {
      return "/about";
    } else {
      return "/post/" + props.id;
    }
  }, [props]);
  return (
    <div className="text-center text-xs md:text-sm divide-x divide-gray-400 text-gray-400 dark:text-dark post-card-sub-title">
      <span className="inline-flex px-2 items-center">
        <span className={iconClass}>
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="11557"
            width={iconSize}
            height={iconSize}
          >
            <path
              d="M853.333333 501.333333c-17.066667 0-32 14.933333-32 32v320c0 6.4-4.266667 10.666667-10.666666 10.666667H170.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V213.333333c0-6.4 4.266667-10.666667 10.666667-10.666666h320c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32H170.666667c-40.533333 0-74.666667 34.133333-74.666667 74.666666v640c0 40.533333 34.133333 74.666667 74.666667 74.666667h640c40.533333 0 74.666667-34.133333 74.666666-74.666667V533.333333c0-17.066667-14.933333-32-32-32z"
              p-id="11558"
            ></path>
            <path
              d="M405.333333 484.266667l-32 125.866666c-2.133333 10.666667 0 23.466667 8.533334 29.866667 6.4 6.4 14.933333 8.533333 23.466666 8.533333h8.533334l125.866666-32c6.4-2.133333 10.666667-4.266667 14.933334-8.533333l300.8-300.8c38.4-38.4 38.4-102.4 0-140.8-38.4-38.4-102.4-38.4-140.8 0L413.866667 469.333333c-4.266667 4.266667-6.4 8.533333-8.533334 14.933334z m59.733334 23.466666L761.6 213.333333c12.8-12.8 36.266667-12.8 49.066667 0 12.8 12.8 12.8 36.266667 0 49.066667L516.266667 558.933333l-66.133334 17.066667 14.933334-68.266667z"
              p-id="11559"
            ></path>
          </svg>
        </span>
        {props.type != "about"
          ? `${dayjs(props.createdAt).format("YYYY-MM-DD")}`
          : ` ${dayjs(props.updatedAt).format("YYYY-MM-DD")}`}
      </span>

      {props.type != "about" && (
        <span className="inline-flex px-2 items-center group dark:group cursor-pointer">
          <span className={iconClass}>
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="12516"
              fill="currentColor"
              width={iconSize}
              height={iconSize}
            >
              <path
                d="M810.666667 85.333333a85.333333 85.333333 0 0 1 85.333333 85.333334v152.021333c36.821333 9.493333 64 42.88 64 82.645333v405.333334a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128V298.666667a85.376 85.376 0 0 1 64-82.645334V170.666667a85.333333 85.333333 0 0 1 85.333333-85.333334h597.333334zM128.149333 296.170667L128 298.666667v512a64 64 0 0 0 60.245333 63.893333L192 874.666667h640a64 64 0 0 0 63.893333-60.245334L896 810.666667V405.333333a21.333333 21.333333 0 0 0-18.837333-21.184L874.666667 384H638.165333l-122.069333-101.717333a21.333333 21.333333 0 0 0-10.688-4.736l-2.986667-0.213334H149.333333a21.333333 21.333333 0 0 0-21.184 18.837334zM535.189333 213.333333l127.978667 106.666667H832V170.666667a21.333333 21.333333 0 0 0-18.837333-21.184L810.666667 149.333333H213.333333a21.333333 21.333333 0 0 0-21.184 18.837334L192 170.666667v42.666666h343.168z"
                p-id="12517"
              ></path>
            </svg>
          </span>
          <Link
            href={`/category/${encodeQuerystring(props.catelog)}`}
            target={getTarget(props.openArticleLinksInNewWindow)}
          >
            <div className="cursor-pointer group-hover:text-gray-900 dark:group-hover:text-dark-hover hover:font-medium ">{`${props.catelog}`}</div>
          </Link>
        </span>
      )}
      <span className="inline-flex px-2 items-center">
        <span className={iconClass}>
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="15825"
            width={iconSize}
            height={iconSize}
          >
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3-7.7 16.2-7.7 35.2 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766z"
              p-id="15826"
            ></path>
            <path
              d="M508 336c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176z m0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"
              p-id="15827"
            ></path>
          </svg>
        </span>
        <PostViewer shouldAddViewer={props.type != "overview"} id={props.id} />
      </span>
      {props.enableComment != "false" && (
        <span className="inline-flex px-2 items-center">
          <span className={iconClass}>
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="13953"
              width={iconSize}
              height={iconSize}
            >
              <path
                d="M873.559 97.82h-723.12c-45.886 0-83.436 37.627-83.436 83.611v542.098c0 45.984 37.55 69.685 83.437 69.685h333.747c45.888 0 109.987 34.242 142.43 66.767l48.888 52.12c12.589 12.615 24.309 20.262 33.91 20.262 15.143 0 25.083-20.55 25.083-48.675 0-45.983 37.548-90.474 83.436-90.474h55.625c45.887 0 83.438-23.701 83.438-69.685V181.431c0-45.984-37.55-83.61-83.438-83.61z m27.813 625.71c0 15.105-12.738 15.307-27.813 15.307h-55.625c-61.382 0-113.612 46.353-132 101.74l-19.989-23.15c-42.914-43.016-121.055-78.59-181.758-78.59H150.44c-15.074 0-27.813-0.204-27.813-15.308V181.431c0-15.106 12.739-27.87 27.813-27.87h723.119c15.075 0 27.813 12.766 27.813 27.87v542.098zM261.689 348.652h278.124c15.358 0 27.812-12.48 27.812-27.87s-12.454-27.87-27.812-27.87H261.689c-15.357 0-27.812 12.48-27.812 27.87s12.455 27.87 27.812 27.87z m472.81 83.613H261.69c-15.357 0-27.812 12.48-27.812 27.87s12.455 27.87 27.812 27.87H734.5c15.357 0 27.812-12.48 27.812-27.87 0-15.392-12.455-27.87-27.812-27.87z m0 111.48H261.69c-15.357 0-27.812 12.48-27.812 27.87s12.455 27.871 27.812 27.871H734.5c15.357 0 27.812-12.48 27.812-27.87s-12.455-27.87-27.812-27.87z"
                p-id="13954"
              ></path>
            </svg>
          </span>
          <span className="waline-comment-count" data-path={dataPath}>
            0
          </span>
        </span>
      )}
    </div>
  );
}
