import { defineUserConfig } from "vuepress";
import theme from "./theme";
import { searchPlugin } from "@vuepress/plugin-search";
export default defineUserConfig({
  lang: "zh-CN",
  title: "VanBlog",
  description: "VanBlog 的官方网站",
  head: [
    ["link", { rel: "icon", href: "/logo.svg" }],
    [
      "script",
      {},
      `
var _hmt = _hmt || [];
(function() {
var hm = document.createElement("script");
hm.src = "https://hm.baidu.com/hm.js?4949ead4adffe6403bf4036fe6dcca04";
var s = document.getElementsByTagName("script")[0];
s.parentNode.insertBefore(hm, s);
})();
`,
    ],
  ],
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
