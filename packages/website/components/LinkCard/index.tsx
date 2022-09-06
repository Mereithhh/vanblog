import { LinkItem } from "../../api/getAllData";
import ImageBox from "../ImageBox";

export default function (props: { link: LinkItem }) {
  return (
    <div>
      <a
        href={props.link.url}
        target="_blank"
        rel="referrer"
        style={{ overflow: "hidden" }}
        className="flex p-3 sm:p-4 dark:bg-dark-2 card-shadow dark:card-shadow-dark transition  sm:hover:-translate-y-2 hover:-translate-y-1 duration-300 "
      >
        <div className="mr-2 flex-shrink-0 sm:mr-4 flex  items-center justify-center">
          <ImageBox
            src={props.link.logo}
            alt={props.link.name}
            lazyLoad={true}
            className="rounded-full w-10 h-10 sm:w-16 sm:h-16  duration-500 transition-all dark:filter-dark"
          />
        </div>
        <div className="flex flex-col flex-grow-0 overflow-hidden">
          <p
            title={props.link.name}
            className="text-sm sm:text-lg font-normal mb-1 dark:text-dark"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {props.link.name}
          </p>
          <p
            title={props.link.desc}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            className="text-xs sm:text-sm font-thin text-gray-600 dark:text-dark"
          >
            {props.link.desc}
          </p>
        </div>
      </a>
    </div>
  );
}
