import { useContext, useMemo, useState } from "react";
import { SocialItem } from "../../api/getAllData";
import { getIcon } from "../../utils/getIcon";
import { Popover, ArrowContainer } from "react-tiny-popover";
import { ThemeContext } from "../../utils/themeContext";
import ImageBox from "../ImageBox";
import {
  getSocialHref,
  getSocialLabel,
  isQrSocialType,
} from "../../utils/social";

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
  const [show, setShow] = useState(false);
  const iconSize = 20;
  const iconStyle = { marginLeft: "12px" };
  const iconClass =
    "fill-gray-500 dark:text-dark dark:group-hover:text-dark-r transition-all ";
  const label = getSocialLabel(props.item);
  const icon = getIcon(props.item.type, iconSize, props.item.icon);
  if (props.item.type == "email") {
    return (
      <a
        style={{
          display: "inline-flex",
          width: "100%",
          justifyContent: "start",
        }}
        href={getSocialHref(props.item)}
      >
        <span className={iconClass} style={iconStyle}>
          {icon}
        </span>
        <span className="inline-flex items-center ml-1">{label}</span>
      </a>
    );
  } else if (isQrSocialType(props.item.type)) {
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
            {icon}
          </span>
          <span className="inline-flex items-center ml-1">{label}</span>
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
        href={getSocialHref(props.item)}
        target="_blank"
      >
        <span style={iconStyle} className={iconClass}>
          {icon}
        </span>
        <span className="inline-flex items-center ml-1">{label}</span>
      </a>
    );
  }
}
