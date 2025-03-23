import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
const { resolve } = path;

// Package version - read synchronously from package.json
const VANBLOG_VERSION = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    base: '/admin/',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@@': resolve(__dirname, '/'),
        '~antd': resolve(__dirname, 'node_modules/antd'),
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.less'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
      'process.env.VANBLOG_VERSION': JSON.stringify(VANBLOG_VERSION),
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: '@root-entry-name: default;',
          modifyVars: {
            'primary-color': '#1DA57A',
            'link-color': '#1DA57A',
            'root-entry-name': 'default',
          },
        },
      },
    },
    build: {
      minify: process.env.NODE_ENV === 'production',
      outDir: './dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          manualChunks: {
            // ... existing chunks ...
          },
        },
        external: isDev ? [
          
        ] : [
          
          '@toast-ui/editor/dist/i18n/zh-cn',
          '@toast-ui/editor/dist/toastui-editor.css',
          '@toast-ui/editor/dist/theme/toastui-editor-dark.css',
          'prismjs/themes/prism.css',
          'prismjs/components/prism-bash.js',
          'prismjs/components/prism-cmake.js',
          'katex/dist/katex.min.css',
          'tui-color-picker/dist/tui-color-picker.css',
          '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css',
          'veauty-katex/dist/cjs/index.css',
          '@toast-ui/chart/dist/toastui-chart.css',
          './style.less',
          './diff-style.css'
        ]
      },
      emptyOutDir: true,
    },
    optimizeDeps: {
      include: [
        'antd/es/theme/internal',
        '@toast-ui/react-editor',
        '@toast-ui/editor-plugin-color-syntax',
        '@toast-ui/editor-plugin-chart',
        'katex',
        'bytemd',
        '@bytemd/react',
        '@bytemd/plugin-gfm',
        '@bytemd/plugin-highlight-ssr',
        '@bytemd/plugin-math-ssr',
        '@bytemd/plugin-medium-zoom',
        '@bytemd/plugin-mermaid',
        '@bytemd/plugin-frontmatter',
        '@emoji-mart/react',
        '@emoji-mart/data',
        'react-dom',
        'react-dom/client'
      ],
    },
    assetsInclude: ['**/*.svg'],
  };
}); 