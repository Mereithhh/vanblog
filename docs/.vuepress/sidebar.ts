import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  "/intro",
  {
    text: "快速上手",
    icon: "creative",
    // activeMatch: "^/guide/$",
    prefix: "/guide/",
    children: ["docker.md", "nginx.md", "https.md", "init.md", "update.md"],
  },
  {
    text: "功能",
    icon: "strong",
    // activeMatch: "^/guide/$",
    prefix: "/feature/",
    children: [
      {
        text: "基本功能",
        collapsable: false,
        icon: "launch",
        children: [
          "basic/article.md",
          "basic/draft.md",
          "basic/editor.md",
          "basic/about.md",
          "basic/setting.md",
          "basic/comment.md",
          "basic/pic.md",
          "basic/overview.md",
          "basic/category.md",
        ],
      },
      {
        text: "进阶功能",
        collapsable: true,
        icon: "advance",
        children: [
          "/guide/https.md",
          "advance/backup.md",
          "advance/dark-mode.md",
          "advance/links.md",
          "advance/donate.md",
          "advance/social.md",
          "advance/search.md",
          "advance/top.md",
          "advance/hidden.md",
          "advance/private.md",
          "advance/customNav.md",
          "advance/version.md",
          "advance/visitor.md",
        ],
      },
    ],
    collapsable: false,
  },
  {
    text: "参考",
    icon: "list",
    // activeMatch: "^/guide/$",
    prefix: "/ref/",
    children: "structure",
    collapsable: true,
  },
]);
