export function decodeAuto() {
  const d = new Date().getHours();
  const night = d > 18 || d < 8;
  if (typeof window == "undefined") {
    if (night) {
      return "auto-dark";
    } else {
      return "auto-light";
    }
  }
  if (night || window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "auto-dark";
  } else {
    return "auto-light";
  }
}
export const decodeTheme = (t: "auto" | "light" | "dark") => {
  if (t == "auto") {
    return decodeAuto();
  } else {
    return t;
  }
};
export const applyTheme = (t: string, source: string, disableLog: boolean) => {
  if (t.includes("light")) {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    if (!disableLog) {
      console.log(`[Apply Theme][${source}] ${t}`);
    }
  } else {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    if (!disableLog) {
      console.log(`[Apply Theme][${source}] ${t}`);
    }
  }
};
export const initTheme = () => {
  if (typeof localStorage == "undefined") {
    return "auto";
  }
  // 2种情况： 1. 自动。 2.手动
  if (!("theme" in localStorage) || localStorage.theme == "auto") {
    return "auto";
  } else {
    if (localStorage.theme === "dark") {
      return "dark";
    } else {
      return "light";
    }
  }
};
