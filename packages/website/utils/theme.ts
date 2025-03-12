import 'client-only';
import { RealThemeType } from "./themeContext";

export const initTheme = () => {
  if (typeof localStorage === "undefined") {
    throw new Error("localStorage is not available");
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

export function getAutoTheme(): RealThemeType {
  if (typeof window === "undefined") {
    return "auto-light"; // Default theme for server-side rendering
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "auto-dark" : "auto-light";
}

export function getTheme(defaultTheme: RealThemeType = "auto-light"): RealThemeType {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return defaultTheme; // Default theme for server-side rendering
  }

  if (!("theme" in localStorage) || localStorage.theme === "auto") {
    return getAutoTheme();
  }

  if (localStorage.theme === "dark") {
    return "dark";
  }

  return "light";
}

export const applyTheme = (theme: RealThemeType) => {
  if (theme === "dark" || theme === "auto-dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }
};
