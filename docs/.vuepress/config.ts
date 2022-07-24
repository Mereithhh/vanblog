import { defineUserConfig } from "vuepress";
import theme from "./theme";
import { searchPlugin } from "@vuepress/plugin-search";
export default defineUserConfig({
  lang: "zh-CN",
  title: "Van Blog",
  description: "Van Blog 的官方网站",
  head: [["link", { rel: "icon", href: "/logo.svg" }]],
  base: "/",
  plugins: [
    searchPlugin({
      locales: {
        "/": {
          placeholder: "搜索",
        },
      },
    }),
  ],
  theme,
});
