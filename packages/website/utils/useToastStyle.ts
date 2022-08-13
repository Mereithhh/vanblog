import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "./globalContext";

export const useToastStyle = () => {
  const [cStyle, setCStyle] = useState<any>(undefined);
  const { state } = useContext(GlobalContext);
  const { theme } = state;
  useEffect(() => {
    if (!document) {
      return;
    }
    let t = theme;
    if (t == "auto") {
      t = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    }
    if (t.includes("dark")) {
      setCStyle({ background: "#232428", color: "#9e9e9e" });
    } else {
      return setCStyle(undefined);
    }
  }, [theme, setCStyle]);
  return [cStyle];
};
