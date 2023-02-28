import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  "/intro",
  {
    text: "快速上手",
    icon: "creative",
    prefix: "/guide/",
    children: "structure",
  },
  {
    text: "功能",
    icon: "strong",
    prefix: "/features/",
    children: "structure",
  },
  {
    text: "高级",
    icon: "strong",
    prefix: "/advanced/",
    children: "structure",
  },
  {
    text: "参考",
    icon: "list",
    prefix: "/ref/",
    collapsible: true,
    children: "structure",
  },
]);
