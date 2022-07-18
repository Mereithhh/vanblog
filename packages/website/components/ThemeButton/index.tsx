import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { initTheme } from "../../utils/theme";

export default function (props: any) {
  const { current } = useRef<any>({ hasInit: false });
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      const iTheme = initTheme();
      setTheme(iTheme);
    }
  }, [current, setTheme]);
  const handleSwitch = () => {
    if (theme == "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };
  return (
    <div
      className="flex items-center cursor-pointer hover:scale-110 transform transition-all mr-4"
      onClick={handleSwitch}
    >
      <div
        style={{
          display: theme == "light" ? "block" : "none",
          height: 20,
        }}
      >
        <Image src="/sun.svg" width={20} height={20}></Image>
      </div>
      <div
        style={{
          display: theme == "dark" ? "block" : "none",
          height: 20,
        }}
      >
        <Image src="/moon.svg" width={20} height={20}></Image>
      </div>
    </div>
  );
}
