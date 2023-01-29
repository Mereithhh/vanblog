// 从环境变量中读取.
export const config = {
  baseUrl: washUrl(process.env.VAN_BLOG_SERVER_URL ?? "http://localhost:3000"),
};

function washUrl(url: string) {
  // 带反斜杠的
  const u = new URL(url);
  return u.toString();
}

// 改为服务端触发 isr
// export const revalidate = {};
export const revalidate = process.env.VAN_BLOG_REVALIDATE == 'true'
  ? { revalidate: parseInt(process.env.VAN_BLOG_REVALIDATE_TIME || "10") }
  : {};
