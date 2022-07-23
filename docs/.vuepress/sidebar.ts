import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  "/intro",
  {
    text: "快速上手",
    icon: "creative",
    link: "get-started",
    // children: "structure",
  },
  {
    text: "参考",
    icon: "creative",
    // activeMatch: "^/guide/$",
    prefix: "/guide/",
    children: ["env.md", "setting.md"],
  },
]);
