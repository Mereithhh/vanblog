import React from "react";

export const GlobalContext = React.createContext({
  theme: "auto",
  setTheme: (newTheme: string) => {},
});
