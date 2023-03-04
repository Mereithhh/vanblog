export const initTheme = () => {
  if (typeof localStorage === "undefined") {
    return "auto";
  }

  // 2种情况： 1. 自动。 2.手动
  if (!("theme" in localStorage) || localStorage.theme == "auto") {
    return "auto";
  }

  if (localStorage.theme === "dark") {
    return "dark";
  }

  return "light";
};

export const getAutoTheme = () => {
  const hour = new Date().getHours();
  const isNight = hour > 18 || hour < 8;

  if (typeof window === "undefined") {
    return isNight ? "auto-dark" : "auto-light";
  }

  if (isNight || window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "auto-dark";
  }

  return "auto-light";
};

export const getTheme = (theme: "auto" | "light" | "dark") =>
  theme == "auto" ? getAutoTheme() : theme;

export const applyTheme = (
  theme: string,
  source: string,
  disableLog = false
) => {
  if (theme.includes("light")) {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    if (!disableLog) {
      console.log(`[Apply Theme][${source}] ${theme}`);
    }
  } else {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    if (!disableLog) {
      console.log(`[Apply Theme][${source}] ${theme}`);
    }
  }
};
