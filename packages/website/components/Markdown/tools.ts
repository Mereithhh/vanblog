export const getChildrenText = (children: any): any => {
  let result = "";
  children.forEach((c: any) => {
    if (typeof c == "string") {
      result = result + c;
    }
    if (typeof c == "object") {
      result = result + c?.props?.children;
    }
  });
  return result;
};
