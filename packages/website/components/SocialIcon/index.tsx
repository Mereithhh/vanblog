import { useState } from "react";
import { SocialItem, SocialType } from "../../api/getMeta";
import { getIcon } from "../../utils/getIcon";
import { Popover, ArrowContainer } from "react-tiny-popover";
import { topUpper } from "../../utils/TopUpper";
import Image from "next/image";

export default function (props: { item: SocialItem }) {
  // 链接、二维码、邮箱 三个类别
  const [hover, setHover] = useState(false);
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
              arrowColor={"white"}
              arrowSize={10}
              arrowStyle={{ opacity: 0.7 }}
              className=" "
              arrowClassName="popover-arrow "
            >
              <div className="card-shadow" style={{ height: 280 }}>
                <Image src={props.item.value} width={200} height={280}></Image>
              </div>
            </ArrowContainer>
          );
        }}
      >
        <a
          style={{
            display: "inline-flex",
            width: "100%",
            justifyContent: "start",
          }}
          onClick={() => {
            setShow(!show);
          }}
          onMouseEnter={() => {
            setHover(false);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          <span style={iconStyle} className={iconClass}>
            {getIcon(props.item.type, iconSize)}
          </span>
          <span className="inline-flex items-center ml-1">
            {topUpper(props.item.type)}
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
