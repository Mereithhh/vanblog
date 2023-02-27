export const checkNoChinese = (s: string) => {
  if (escape(s).indexOf('%u') < 0) {
    return true;
  }
  return false;
};
