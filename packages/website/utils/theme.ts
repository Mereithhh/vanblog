export type ThemePreference = "auto" | "light" | "dark";
export type ColorScheme = "dark" | "light" | "no-preference";

export const readStoredTheme = (
  storage?: Pick<Storage, "getItem"> | null
): ThemePreference => {
  if (!storage) {
    return "auto";
  }
  try {
    const stored = storage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch {
    // private mode / blocked storage
  }
  return "auto";
};

export const initTheme = (): ThemePreference => {
  if (typeof localStorage === "undefined") {
    return "auto";
  }
  return readStoredTheme(localStorage);
};

export const getPreferredColorScheme = (
  matchMedia?: (query: string) => { matches: boolean }
): ColorScheme => {
  const query =
    matchMedia ??
    (typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? (q: string) => window.matchMedia(q)
      : undefined);
  if (!query) {
    return "no-preference";
  }
  try {
    if (query("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    if (query("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    // ignore invalid matchMedia implementations
  }
  return "no-preference";
};

export const isNightHour = (hour: number) => hour > 18 || hour < 8;

export const getAutoTheme = (
  prefers: ColorScheme = getPreferredColorScheme(),
  hour: number = new Date().getHours()
): "auto-dark" | "auto-light" => {
  if (prefers === "dark") {
    return "auto-dark";
  }
  if (prefers === "light") {
    return "auto-light";
  }
  return isNightHour(hour) ? "auto-dark" : "auto-light";
};

export const getTheme = (theme: ThemePreference) =>
  theme == "auto" ? getAutoTheme() : theme;

export const resolvePaintTheme = (
  storedTheme: string | null | undefined,
  prefers: ColorScheme,
  hour: number
): "light" | "dark" => {
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return getAutoTheme(prefers, hour).includes("light") ? "light" : "dark";
};

export const applyThemeClass = (
  theme: string,
  root: { classList: { add: (value: string) => void; remove: (value: string) => void } }
) => {
  if (theme.includes("light")) {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
};

export const applyTheme = (
  theme: string,
  source: string,
  disableLog = false
) => {
  applyThemeClass(theme, document.documentElement);
  if (!disableLog) {
    console.log(`[Apply Theme][${source}] ${theme}`);
  }
};

/**
 * Blocking first-paint script. Keep this in sync with resolvePaintTheme /
 * applyThemeClass. It must not write localStorage so a first-time visitor
 * can still receive the admin「首次访问默认主题」value.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var stored=null;try{stored=localStorage.getItem("theme")}catch(e){}var theme="auto";if(stored==="dark"||stored==="light"){theme=stored}if(theme==="auto"){var prefersDark=false,prefersLight=false;try{prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;prefersLight=window.matchMedia("(prefers-color-scheme: light)").matches}catch(e){}if(prefersDark){theme="dark"}else if(prefersLight){theme="light"}else{var hour=(new Date()).getHours();theme=(hour>18||hour<8)?"dark":"light"}}var root=document.documentElement;if(theme.indexOf("light")!==-1){root.classList.add("light");root.classList.remove("dark")}else{root.classList.add("dark");root.classList.remove("light")}}catch(e){}})();`;
