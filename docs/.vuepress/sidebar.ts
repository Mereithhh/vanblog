import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  {
    text: "快速上手",
    icon: "creative",
    // prefix: "/guide/",
    link: "get-started",
    // children: "structure",
  },
  {
    text: "指南",
    link: "/guide/",
    icon: "creative",
    // 仅在 `/zh/guide/` 激活
    activeMatch: "^/guide/$",
  },
  // { text: "配置", link: "/zh/config/README.md", icon: "config" },
]);
