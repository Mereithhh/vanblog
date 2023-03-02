const normalizeURL = (url: string) => new URL(url).toString();

// 从环境变量中读取.
export const config = {
  baseUrl: normalizeURL(
    process.env.VAN_BLOG_SERVER_URL ?? "http://localhost:3000"
  ),
};

// 改为服务端触发 isr
// export const revalidate = {};
export const revalidate =
  process.env.VAN_BLOG_REVALIDATE == "true"
    ? { revalidate: parseInt(process.env.VAN_BLOG_REVALIDATE_TIME || "10") }
    : {};
