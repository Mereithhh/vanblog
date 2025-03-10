const normalizeURL = (url: string) => new URL(url).toString();

// 从环境变量中读取.
export const config = {
  baseUrl: normalizeURL(
    process.env.VAN_BLOG_SERVER_URL ?? "http://localhost:3000"
  ),
};

// 用于Docker构建和API连接失败时打印日志的函数
export const logDefaultValueUsage = (source: string = "API") => {
  // 根据环境变量决定日志消息
  if (process.env.DOCKER_BUILD === "true") {
    console.log(`Docker构建环境，直接使用${source}默认值`);
  } else {
    console.log(`无法连接${source}，采用默认值`);
  }
};

// 改为服务端触发 isr
// export const revalidate = {};
export const revalidate =
  process.env.VAN_BLOG_REVALIDATE == "true"
    ? { revalidate: parseInt(process.env.VAN_BLOG_REVALIDATE_TIME || "10") }
    : {};
