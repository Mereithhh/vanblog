// https://umijs.org/config/
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
  hash: true,
  base: '/admin/',
  devServer: { https: false, port: 3002 },
  publicPath: '/admin/',
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: false,
    siderWidth: 208,
    ...defaultSettings,
  },
  dynamicImport: {
    loading: '@/components/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  access: {},
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // 如果不想要 configProvide 动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 configProvide 动态设置主色调
    // https://ant.design/docs/react/customize-theme-variable-cn
    'root-entry-name': 'variable',
  },
  // 禁用 esbuild
  esbuild: false,
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  nodeModulesTransform: {
    type: 'none',
  },
  // 关闭 mfsu 以避免问题
  mfsu: false,
  webpack5: {},
  exportStatic: {},
  // 修改 webpack 配置
  chainWebpack(memo, { env, webpack, createCSSRule }) {
    memo
      .plugin('monaco-editor-webpack-plugin')
      .use(MonacoWebpackPlugin, [
        { languages: ['css', 'json', 'html', 'javascript', 'typescript'] },
      ]);
    
    // 禁用任何 esbuild 相关的 loader 或插件
    memo.plugins.delete('esbuild-loader');
    memo.plugins.delete('esbuild-plugin');
    
    // 解决 noEmitOnErrors 和 emitOnErrors 冲突
    if (memo.optimization.get('noEmitOnErrors')) {
      memo.optimization.delete('noEmitOnErrors');
    }
  },
});
