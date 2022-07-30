import { useContext } from "react";
import { GlobalContext } from "../../utils/globalContext";
export default function () {
  const { state } = useContext(GlobalContext);
  // 全站浏览量统计
  return (
    <span className="flex justify-center items-center dark:text-dark fill-gray-600 divide-gray-600">
      <span className="flex items-center justify-center pr-2">
        <span>
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="7211"
            width="14"
            height="14"
          >
            <path
              d="M565.2 521.9c76.2-23 132.1-97.6 132.1-186.2 0-106.9-81.3-193.5-181.6-193.5s-181.6 86.6-181.6 193.5c0 87.6 54.6 161.6 129.5 185.4-142.2 23.1-250.8 146.5-250.8 295.3 0 2.9 0 5.8 0.1 8.7 0.9 31.5 26.5 56.7 58.1 56.7h482.1c31.2 0 57-24.6 58-55.8 0.1-3.2 0.2-6.4 0.2-9.6-0.1-147.1-106.2-269.4-246.1-294.5z"
              p-id="7212"
            ></path>
          </svg>
        </span>{" "}
        {state.visited}
      </span>
      <span className="flex items-center justify-center pl-2">
        <span>
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="9714"
            width="14"
            height="14"
          >
            <path
              d="M508 512m-112 0a112 112 0 1 0 224 0 112 112 0 1 0-224 0Z"
              p-id="9715"
            ></path>
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3-7.7 16.2-7.7 35.2 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM508 688c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z"
              p-id="9716"
            ></path>
          </svg>
        </span>
        {state.viewer}
      </span>
    </span>
  );
}
