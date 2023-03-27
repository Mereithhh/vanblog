import { useContext, useMemo, useState } from "react";
import { SocialItem } from "../../api/getAllData";
import { getIcon } from "../../utils/getIcon";
import { Popover, ArrowContainer } from "react-tiny-popover";
import { capitalize } from "../../utils/capitalize";
import { ThemeContext } from "../../utils/themeContext";
import ImageBox from "../ImageBox";

export default function (props: { item: SocialItem }) {
  const { theme } = useContext(ThemeContext);

  const weChatUrl = useMemo(() => {
    if (props.item.type == "wechat") {
      if (theme.includes("dark") && props.item.dark && props.item.dark != "") {
        return props.item.dark;
      }
      return props.item.value;
    }
    return "";
  }, [theme, props]);
  const arrowColor = useMemo(() => {
    if (theme.includes("dark")) {
      return "#1b1c1f";
    } else {
      return "white";
    }
  }, [theme]);
  // 链接、二维码、邮箱 三个类别
  const [show, setShow] = useState(false);
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
      <Popover
        isOpen={show}
        onClickOutside={() => {
          setShow(false);
        }}
        positions={["top", "left"]}
        content={({ position, childRect, popoverRect }) => {
          return (
            <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
              position={position}
              childRect={childRect}
              popoverRect={popoverRect}
              arrowColor={arrowColor}
              arrowSize={10}
              arrowStyle={{ opacity: 0.7 }}
              className=" "
              arrowClassName="popover-arrow "
            >
              <div
                className="card-shadow bg-white dark:bg-dark-2 dark:card-shadow-dark"
                style={{ height: 280 }}
              >
                <ImageBox
                  alt="logo wechat qrcode"
                  src={weChatUrl}
                  width={200}
                  height={280}
                  className={""}
                  lazyLoad={true}
                />
              </div>
            </ArrowContainer>
          );
        }}
      >
        <a
          target={"_blank"}
          style={{
            display: "inline-flex",
            width: "100%",
            justifyContent: "start",
          }}
          onClick={() => {
            setShow(!show);
          }}
        >
          <span style={iconStyle} className={iconClass}>
            {getIcon(props.item.type, iconSize)}
          </span>
          <span className="inline-flex items-center ml-1">
            {capitalize(props.item.type)}
          </span>
        </a>
      </Popover>
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
        target="_blank"
      >
        <span style={iconStyle} className={iconClass}>
          {getIcon(props.item.type, iconSize)}
        </span>
        <span className="inline-flex items-center ml-1">
          {capitalize(props.item.type)}
        </span>
      </a>
    );
  }
}
