export const initTheme = () => {
  // On page load or when changing themes, best to add inline in `head` to avoid FOUC
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }
  return localStorage.theme;
};

export const switchTheme = (to: string) => {
  if (to == "light") {
    localStorage.theme = "light";
  } else if (to == "system") {
    localStorage.removeItem("theme");
  } else {
    localStorage.theme = "dark";
  }
  initTheme();
};
