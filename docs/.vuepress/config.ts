import { viteBundler } from '@vuepress/bundler-vite';
import { baiduAnalyticsPlugin } from '@vuepress/plugin-baidu-analytics';
import { defineUserConfig } from 'vuepress';
import { getDirname, path } from 'vuepress/utils';

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
        src: 'https://cdn.wwads.cn/js/makemoney.js',
        async: true,
      },
    ],
  ],

  bundler: viteBundler(),

  theme,

  plugins: [
    baiduAnalyticsPlugin({
      id: '4949ead4adffe6403bf4036fe6dcca04',
    }),
  ],

  pagePatterns: ['**/*.md', '!**/*.snippet.md', '!.vuepress', '!node_modules'],

  alias: {
    '@theme-hope/modules/info/components/TOC': path.resolve(__dirname, './components/TOC.vue'),
  },
});
