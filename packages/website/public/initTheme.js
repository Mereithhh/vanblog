const getInitTheme = () => {
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
const decodeTheme = (t) => {
  if (t == "auto") {
    const d = new Date().getHours();
    const night = d > 18 || d < 8;
    if (typeof window == "undefined") {
      if (night) {
        return "dark";
      } else {
        return "light";
      }
    }
    if (night || window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    } else {
      return "light";
    }
  } else {
    return t;
  }
};
const applyTheme = (t) => {
  if (t.includes("light")) {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }
};
applyTheme(decodeTheme(getInitTheme()));
