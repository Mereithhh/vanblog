export function washUrl(s: string) {
  // 先判断一下带不带协议
  let url = s;
  if (!s.includes('http')) {
    url = `https://${s}`;
  }
  // 带反斜杠的
  try {
    const u = new URL(url);
    return u.toString();
  } catch (err) {
    return url;
  }
}
export const encodeQuerystring = (s: string) => {
  return s.replace(/#/g, '%23').replace(/\//g, '%2F');
};
