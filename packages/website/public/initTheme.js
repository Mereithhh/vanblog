// Check if we're in a browser environment
const initTheme = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof localStorage == "undefined") {
    return;
  }

  if (!("theme" in localStorage) || localStorage.theme == "auto") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } else if (localStorage.theme === "dark") {
    document.documentElement.classList.add("dark");
  }
};

const getInitTheme = () => {
  if (typeof localStorage == "undefined") {
    return "auto";
  }
  if (!("theme" in localStorage)) {
    return "auto";
  }
  return localStorage.theme;
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

// Initialize theme when the script loads
initTheme();
applyTheme(decodeTheme(getInitTheme()));

// Expose function to window object for global access if needed
window.getInitTheme = getInitTheme;
