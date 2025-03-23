import { sha256 } from 'js-sha256';

/**
 * 浏览器端密码加密，生成后端washPassword函数期望的预处理格式
 * 与后端 washPassword 函数的第一步对应：
 * 
 * const browserPassword = sha256(
 *   username + sha256(sha256(sha256(sha256(password))) + sha256(username)),
 * );
 * 
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {string} 加密后的密码
 */
export function encryptPwd(username, password) {
  // 确保用户名小写处理
  username = username.toLowerCase();
  
  const hash = sha256(
    username + sha256(sha256(sha256(sha256(password))) + sha256(username))
  );
  
  return hash;
}
