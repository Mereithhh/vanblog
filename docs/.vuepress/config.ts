import { defineUserConfig } from "vuepress";
import theme from "./theme";

export default defineUserConfig({
  lang: "zh-CN",
  title: "Van Blog",
  description: "Van Blog 的官方网站",
  head: [["link", { rel: "icon", href: "/logo.svg" }]],
  base: "/",

  theme,
});
