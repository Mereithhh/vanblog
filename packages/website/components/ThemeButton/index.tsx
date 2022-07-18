import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { initTheme, switchTheme } from "../../utils/theme";

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
      switchTheme("dark");
    } else {
      setTheme("light");
      switchTheme("light");
    }
  };
  return (
    <div
      className="flex items-center cursor-pointer hover:scale-125 transform transition-all mr-4"
      onClick={handleSwitch}
    >
      <div
        style={{
          display: theme == "light" ? "block" : "none",
          height: 20,
        }}
        className="dark:text-dark"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          fill="currentColor"
          aria-label="light icon"
          width={20}
          height={20}
        >
          <path d="M952 552h-80a40 40 0 0 1 0-80h80a40 40 0 0 1 0 80zM801.88 280.08a41 41 0 0 1-57.96-57.96l57.96-58a41.04 41.04 0 0 1 58 58l-58 57.96zM512 752a240 240 0 1 1 0-480 240 240 0 0 1 0 480zm0-560a40 40 0 0 1-40-40V72a40 40 0 0 1 80 0v80a40 40 0 0 1-40 40zm-289.88 88.08-58-57.96a41.04 41.04 0 0 1 58-58l57.96 58a41 41 0 0 1-57.96 57.96zM192 512a40 40 0 0 1-40 40H72a40 40 0 0 1 0-80h80a40 40 0 0 1 40 40zm30.12 231.92a41 41 0 0 1 57.96 57.96l-57.96 58a41.04 41.04 0 0 1-58-58l58-57.96zM512 832a40 40 0 0 1 40 40v80a40 40 0 0 1-80 0v-80a40 40 0 0 1 40-40zm289.88-88.08 58 57.96a41.04 41.04 0 0 1-58 58l-57.96-58a41 41 0 0 1 57.96-57.96z"></path>
        </svg>
      </div>
      <div
        className="dark:text-dark"
        style={{
          display: theme == "dark" ? "block" : "none",
          height: 20,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          fill="currentColor"
          aria-label="dark icon"
          width={20}
          height={20}
        >
          <path d="M524.8 938.667h-4.267a439.893 439.893 0 0 1-313.173-134.4 446.293 446.293 0 0 1-11.093-597.334A432.213 432.213 0 0 1 366.933 90.027a42.667 42.667 0 0 1 45.227 9.386 42.667 42.667 0 0 1 10.24 42.667 358.4 358.4 0 0 0 82.773 375.893 361.387 361.387 0 0 0 376.747 82.774 42.667 42.667 0 0 1 54.187 55.04 433.493 433.493 0 0 1-99.84 154.88 438.613 438.613 0 0 1-311.467 128z"></path>
        </svg>
      </div>
    </div>
  );
}
