import { defineUserConfig } from "vuepress";
import { searchProPlugin } from "vuepress-plugin-search-pro";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

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

  plugins: [searchProPlugin({ indexContent: true })],

  theme,
});
