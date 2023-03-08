import { useEffect, useState } from "react";
import Core from "./core";

export default function (props: { defaultTheme: "auto" | "dark" | "light" }) {
  const [showChild, setShowChild] = useState(false);

  // Wait until after client-side hydration to show
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    // You can show some kind of placeholder UI here
    return null;
  }

  return <Core {...props} />;
}
