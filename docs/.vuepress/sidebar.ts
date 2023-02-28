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
    collapsible: true,
    prefix: "/advanced/",
    children: "structure",
  },
  {
    text: "参考",
    icon: "list",
    collapsible: true,
    prefix: "/ref/",
    children: "structure",
  },
]);
