const path = require('path');

const { resolve } = path;
const isDev = process.env.NODE_ENV !== 'production';
const PROJECT_PATH = resolve(__dirname, '../');

module.exports = {
  PROJECT_PATH,
  resolve,
  isDev,
};
