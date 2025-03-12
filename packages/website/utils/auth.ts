import 'client-only';

export const checkLogin = () => {
  return true;
  if (typeof window === "undefined") return false;
  return !!localStorage?.getItem("token");
};

export function isLogin() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false; // Not logged in during server-side rendering
  }
  return !!localStorage?.getItem("token");
}

export function isAdmin() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false; // Not admin during server-side rendering
  }
  return !!localStorage?.getItem("token");
}
