export const checkLogin = () => {
  return true;
  if (typeof window === "undefined") return false;
  return !!localStorage?.getItem("token");
};
