export const getPathname = (obj: any) => {
  if (!obj.pathname) {
    return obj.id;
  }
  return obj.pathname;
};
