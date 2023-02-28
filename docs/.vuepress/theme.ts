import { getDirname, path } from "@vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

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
  iconAssets: "iconfont",

  logo: "/logo.svg",

  repo: "mereithhh/van-blog",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: sidebar,

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
        resolvePath: (filePath, cwd) => {
          if (filePath.startsWith("@"))
            return filePath.replace("@", path.resolve(__dirname, "../"));

          return path.resolve(cwd, filePath);
        },
      },
      tasklist: true,
    },
  },
});
