export const checkLogin = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage?.getItem("token");
};
