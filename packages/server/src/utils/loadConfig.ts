import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
// 解析配置文件
let rawConfigs = [];
if (process.env.VAN_BLOG_CONFIG_FILE) {
  rawConfigs = [path.resolve(process.env.VAN_BLOG_CONFIG_FILE)];
} else {
  rawConfigs = [
    path.resolve('/etc/van-blog/config.yaml'),
    path.resolve('./config.yaml'),
  ];
}

rawConfigs = rawConfigs
  .filter(Boolean)
  .filter(fs.existsSync)
  .map((file) => fs.readFileSync(file, 'utf-8'))
  .map((content) => yaml.parse(content));

if (rawConfigs.length === 0) {
  console.log('缺少配置文件，将采用默认数据库配置');
  rawConfigs.push([]);
  //throw new Error('缺少配置文件: /etc/steamory360/config.yaml');
}

// 递归合并
// 优先级 env > config.{NODE_ENV}.yaml > config.yaml > /etc/authing/config.yaml > 默认值
const config = [...rawConfigs].reduce((prev, curr) => {
  return _.merge(prev, curr);
});

/**
 * 获得配置项的值
 * @param key 配置项的 key，可以通过 . 来选择子项，比如 app.port
 * @param defaultValue 默认值
 */
export const loadConfig = (key: string, defaultValue?: any) => {
  const envKey = key
    .split('.')
    .map((x) => x.toUpperCase())
    .join('_');
  return process.env[envKey] || _.get(config, key, defaultValue);
};
