import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  {
    text: "快速上手",
    icon: "creative",
    link: "get-started",
    // children: "structure",
  },
  {
    text: "指南",
    icon: "creative",
    // activeMatch: "^/guide/$",
    prefix: "/guide/",
    children: ["intro.md", "env.md", "setting.md"],
  },
]);
