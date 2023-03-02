import { getDirname, path } from "@vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";

const __dirname = getDirname(import.meta.url);

export default hopeTheme({
  hostname: "https://vanblog.mereith.com",

  docsRepo: "Mereithhh/vanblog",
  docsBranch: "master",
  docsDir: "docs",
  author: {
    name: "Mereith",
    url: "https://www.mereith.com",
  },

  darkmode: "switch",
  iconAssets: "fontawesome-with-brands",

  logo: "/logo.svg",

  repo: "mereithhh/van-blog",

  // navbar
  navbar: [
    { text: "介绍", icon: "circle-info", link: "/intro" },
    { text: "快速上手", icon: "lightbulb", link: "/guide/get-started" },
    { text: "功能", icon: "star", link: "/features/" },
    { text: "常见问题", icon: "circle-question", link: "/faq/" },
    {
      text: "Demo",
      icon: "laptop-code",
      link: "https://blog-demo.mereith.com",
    },
    {
      text: "交流群",
      icon: "fab fa-qq",
      link: "https://jq.qq.com/?_wv=1027&k=5NRyK2Sw",
    },
  ],

  sidebar: "structure",

  footer: "GPL-3.0 协议",

  displayFooter: true,

  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],

  plugins: {
    comment: {
      provider: "Giscus",
      repo: "mereithhh/vanblog-comment",
      repoId: "R_kgDOHtQfpQ",
      category: "Announcements",
      categoryId: "DIC_kwDOHtQfpc4CQZcs",
    },

    mdEnhance: {
      align: true,
      codetabs: true,
      figure: true,
      imgLazyload: true,
      imgSize: true,
      include: {
        deep: true,
        resolvePath: (filePath, cwd) => {
          if (filePath.startsWith("@"))
            return filePath.replace("@", path.resolve(__dirname, "../"));

          return path.resolve(cwd, filePath);
        },
      },
      tabs: true,
      tasklist: true,
    },
  },
});
