const WebpackBar = require('webpackbar');
const { resolve, PROJECT_PATH } = require('./constants');

module.exports = {
  // 定义了入口文件路径
  entry: {
    index: resolve(PROJECT_PATH, './src/index.ts'),
  },
  // 定义了编译打包之后的文件名以及所在路径。还有打包的模块类型
  output: {
    // 打包后的产物名
    filename: 'library-starter.js',
    // 在全局变量中增加一个libraryStarter变量
    library: 'libraryStarter',
    // 打包成umd模块
    libraryTarget: 'umd',
    // libraryExport这个属性需要设置，否则导出后，外层会包有一层default
    libraryExport: 'default',
    // 路径
    path: resolve(PROJECT_PATH, './dist'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@docs': resolve(__dirname, '../docs'),
      '@public': resolve(__dirname, '../public'),
      '@test': resolve(__dirname, '../test'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new WebpackBar({
      name: '正在卖力打包中~',
      color: '#fa8c16',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
