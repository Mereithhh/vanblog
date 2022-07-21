function setThemeAuto() {
  const d = new Date().getHours();
  const night = d > 18 || d < 8;
  if (night || window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    return "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    return "light";
  }
}
export const initTheme = () => {
  // 2种情况： 1. 自动。 2.手动
  if (!("theme" in localStorage) || localStorage.theme == "auto") {
    return "auto-" + setThemeAuto();
  } else {
    if (localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }
  return localStorage.theme;
};

export const switchTheme = (to: string) => {
  if (to == "light") {
    localStorage.theme = "light";
  } else if (to == "auto") {
    localStorage.theme = "auto";
  } else {
    localStorage.theme = "dark";
  }
  return initTheme();
};
