import React from "react";

export type RealThemeType = "auto-dark" | "auto-light" | "dark" | "light";

export const ThemeContext = React.createContext<{
  theme: RealThemeType;
  setTheme: (newState: RealThemeType) => void;
}>({
  theme: "auto-light",
  setTheme: () => {},
});
