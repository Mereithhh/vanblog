export const getChildrenText = (children: any): any => {
  if (!children) {
    return "";
  }
  let result = "";
  try {
    children.forEach((c: any) => {
      if (typeof c == "string") {
        result = result + c;
      } else if (typeof c == "object") {
        if (c?.props?.children && typeof c?.props?.children == "string") {
          result = result + c?.props?.children;
        }
      } else {
        if (c?.props?.children && typeof c?.props?.children == "string") {
          result = result + c?.props?.children;
        }
      }
    });
    return result;
  } catch (err) {
    console.log("获取 heading text 失败：", JSON.stringify(err, null, 2));
    return result || "";
  }
};
