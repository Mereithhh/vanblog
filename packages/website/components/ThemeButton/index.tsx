import { useContext, useEffect, useRef } from "react";
import { initTheme, switchTheme } from "../../utils/theme";
import { ThemeContext } from "../../utils/themeContext";

export default function (props: {}) {
  const { current } = useRef<any>({ hasInit: false });
  const { current: currentTimer } = useRef<any>({ timer: null });
  const { theme, setTheme } = useContext(ThemeContext);
  const clearTimer = () => {
    clearInterval(currentTimer.timer);
    currentTimer.timer = null;
  };
  const setTimer = () => {
    clearTimer();
    currentTimer.timer = setInterval(() => {
      const d = new Date().getHours();
      const night = d > 18 || d < 8;
      console.log("auto theme timer running");
      if (night || window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }, 10000);
  };

  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      const iTheme = initTheme();
      clearTimer();
      if (iTheme.includes("auto")) {
        setTimer();
      }
      setTheme(iTheme);
    } else {
      clearTimer();
      if (theme.includes("auto")) {
        setTimer();
      }
    }
    return () => {
      clearInterval(currentTimer.timer);
    };
  }, [current, setTheme, props, currentTimer, theme]);
  const handleSwitch = () => {
    clearTimer();
    if (theme == "light") {
      setTheme("dark");
      switchTheme("dark");
    } else if (theme == "dark") {
      const r = switchTheme("auto");
      setTheme(r);
      setTimer();
    } else {
      setTheme("light");
      switchTheme("light");
    }
  };
  return (
    <div
      className="flex items-center cursor-pointer hover:scale-125 transform transition-all mr-4 ml-4 sm:ml-2   "
      onClick={handleSwitch}
    >
      <div
        style={{
          display: theme == "light" ? "block" : "none",
          height: 20,
        }}
        className="dark:text-dark "
      >
        <svg
          className="fill-gray-600"
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
        className="dark:text-dark fill-gray-600"
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
      <div
        className="dark:text-dark fill-gray-600"
        style={{
          display: theme.includes("auto") ? "block" : "none",
          height: 20,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={20}
          height={20}
          viewBox="0 0 1024 1024"
          aria-label="auto icon"
        >
          <path d="M512 992C246.92 992 32 777.08 32 512S246.92 32 512 32s480 214.92 480 480-214.92 480-480 480zm0-840c-198.78 0-360 161.22-360 360 0 198.84 161.22 360 360 360s360-161.16 360-360c0-198.78-161.22-360-360-360zm0 660V212c165.72 0 300 134.34 300 300 0 165.72-134.28 300-300 300z"></path>
        </svg>
      </div>
    </div>
  );
}
