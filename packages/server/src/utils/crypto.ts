/**
 * crypto 常用封装方法
 */

import * as crypto from 'crypto';

// 随机盐
export function makeSalt(): string {
  return crypto.randomBytes(3).toString('base64');
}

/**
 * 使用盐加密明文密码
 * @param password 密码
 * @param salt 密码盐
 */
export function encryptPassword(password: string, salt: string): string {
  if (!password || !salt) {
    return '';
  }
  const tempSalt = Buffer.from(salt, 'base64');
  return (
    // 10000 代表迭代次数 16代表长度
    crypto.pbkdf2Sync(password, tempSalt, 10000, 16, 'sha1').toString('base64')
  );
}

// 计算 流 MD5
export function encryptFileMD5(buffer: Buffer) {
  const md5 = crypto.createHash('md5');

  return md5.update(buffer).digest('hex');
}
