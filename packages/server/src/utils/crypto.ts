/**
 * crypto 常用封装方法
 */

import { createHash, randomBytes } from 'node:crypto';
import { sha256 } from 'js-sha256';

// 随机盐
export function makeSalt(): string {
  return randomBytes(32).toString('base64');
}

/**
 * 使用盐加密浏览器端密🐎
 * @param username 用户名
 * @param password 密码
 * @param salt 密码盐
 */
export function encryptPassword(username: string, password: string, salt: string): string {
  if (!username || !password || !salt) {
    return '';
  }
  return sha256(sha256(username + sha256(password + salt)) + salt + sha256(username + salt));
}
/**
 * 把没加过盐的密码洗成加盐的
 * @param username 用户名
 * @param password 密码
 * @param salt 密码盐
 */
export function washPassword(username: string, password: string, salt: string) {
  username = username.toLowerCase();
  const browserPassword = sha256(
    username + sha256(sha256(sha256(sha256(password))) + sha256(username)),
  );
  return encryptPassword(username, browserPassword, salt);
}

// 计算 流 MD5
export function encryptFileMD5(buffer: Buffer) {
  const md5 = createHash('md5');

  return md5.update(buffer).digest('hex');
}
