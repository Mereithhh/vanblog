import { defineUserConfig } from 'vuepress';
import { searchProPlugin } from 'vuepress-plugin-search-pro';
import { getDirname, path } from '@vuepress/utils';

import theme from './theme.js';

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  base: '/',

  lang: 'zh-CN',
  title: 'VanBlog',
  description: 'VanBlog 的官方网站',

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    [
      'script',
      {
        type: 'text/javascript',
        charset: 'utf-8',
        src: 'https://cdn.wwads.cn/js/makemoney.js',
        async: true,
      },
    ],
    [
      'script',
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

  pagePatterns: ['**/*.md', '!**/*.snippet.md', '!.vuepress', '!node_modules'],
  alias: {
    '@theme-hope/modules/info/components/TOC': path.resolve(__dirname, './components/TOC.vue'),
  },
});
