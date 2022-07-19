import { SocialItem, SocialType } from "../../api/getMeta";
import { getIcon } from "../../utils/getIcon";
import { topUpper } from "../../utils/TopUpper";

export default function (props: { item: SocialItem }) {
  // 链接、二维码、邮箱 三个类别
  const iconSize = 20;
  const qrCode = ["wechat"];
  const iconStyle = { marginLeft: "12px" };
  const iconClass =
    "fill-gray-500 dark:text-dark dark:group-hover:text-dark-r transition-all ";
  if (props.item.type == "email") {
    return (
      <a
        style={{
          display: "inline-flex",
          width: "100%",
          justifyContent: "start",
        }}
        href={`mailto:${props.item.value}`}
      >
        <span className={iconClass} style={iconStyle}>
          {getIcon(props.item.type, iconSize)}
        </span>
        <span className="inline-flex items-center ml-1">Email</span>
      </a>
    );
  } else if (qrCode.includes(props.item.type)) {
    return (
      <a
        style={{
          display: "inline-flex",
          width: "100%",
          justifyContent: "start",
        }}
      >
        <span style={iconStyle} className={iconClass}>
          {getIcon(props.item.type, iconSize)}
        </span>
        <span className="inline-flex items-center ml-1">
          {topUpper(props.item.type)}
        </span>
      </a>
    );
  } else {
    return (
      <a
        style={{
          display: "inline-flex",
          width: "100%",
          justifyContent: "start",
        }}
        href={props.item.value}
      >
        <span style={iconStyle} className={iconClass}>
          {getIcon(props.item.type, iconSize)}
        </span>
        <span className="inline-flex items-center ml-1">
          {topUpper(props.item.type)}
        </span>
      </a>
    );
  }
}
