import { sha256 } from 'js-sha256';
export function encryptPwd(username, password) {
  username = username.toLowerCase();
  return sha256(username + sha256(sha256(sha256(sha256(password))) + sha256(username)));
}
