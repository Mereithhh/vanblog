const normalizeURL = (url: string) => {
  const normalized = new URL(url).toString();
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
};

// Environment flags
export const isDockerBuild = typeof process !== 'undefined' && process.env.DOCKER_BUILD === "true";
export const isBuildTime = typeof process !== 'undefined' && (process.env.isBuild === "t" || isDockerBuild);
export const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === "development";

// API configuration
export const API_TIMEOUT = parseInt(
  (typeof process !== 'undefined' && process.env.VAN_BLOG_API_TIMEOUT) || "5000"
); // 5 seconds default timeout
export const API_MAX_RETRIES = parseInt(
  (typeof process !== 'undefined' && process.env.VAN_BLOG_API_MAX_RETRIES) || "3"
);

// Determine if we're running in the browser
const isBrowser = typeof window !== 'undefined';

// Helper to safely get environment variables in both server and client
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // Server-side: direct access to process.env
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key] as string;
  }
  
  // If process.env is not available or the key is not found, return default
  return defaultValue;
};

// Validate environment configuration
const validateEnvironmentConfig = () => {
  if (isBuildTime) return; // Skip validation during build time
  
  const serverUrl = typeof process !== 'undefined' ? process.env.VAN_BLOG_SERVER_URL : undefined;
  const clientUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL : undefined;
  
  // Don't log in production unless there's an issue
  const isLoggingEnabled = isDevelopment || (serverUrl && clientUrl);
  
  if (isLoggingEnabled) {
    console.log('[Config] Environment configuration:');
    console.log(`- VAN_BLOG_SERVER_URL: ${serverUrl || '(default)'}`);
    console.log(`- NEXT_PUBLIC_VANBLOG_SERVER_URL: ${clientUrl || '(not set)'}`);
    console.log(`- Running in: ${isBrowser ? 'browser' : 'server'}`);
  }
};

// Run validation if not in build time
if (!isBuildTime) {
  validateEnvironmentConfig();
}

// Base configuration
export const config = {
  baseUrl: (() => {
    const defaultUrl = "http://127.0.0.1:3000";
    if (isBuildTime) {
      return defaultUrl;
    }
    
    let url = isBrowser ? process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL : process.env.VAN_BLOG_SERVER_URL;
    // In browser environments: prefer NEXT_PUBLIC_VANBLOG_SERVER_URL
    if (isDevelopment) {
      console.log(`[Config] Using ${isBrowser ? 'NEXT_PUBLIC_' : ''}VANBLOG_SERVER_URL: ${url}`);
    }
    
    return url;
  })(),
  timeout: API_TIMEOUT,
  maxRetries: API_MAX_RETRIES,
};

// Logging function for default value usage
export const logDefaultValueUsage = (source: string = "API") => {
  const message = isDockerBuild
    ? `SSG 直接使用${source}默认值`
    : `无法连接${source}，采用默认值`;
  
  if (isDevelopment) {
    console.warn(message);
  } else {
    console.log(message);
  }
};

// Revalidation configuration
export const revalidate = (typeof process !== 'undefined' && process.env.VAN_BLOG_REVALIDATE === "true")
  ? {
      revalidate: parseInt((typeof process !== 'undefined' && process.env.VAN_BLOG_REVALIDATE_TIME) || "10"),
      revalidateOnError: (typeof process !== 'undefined' && process.env.VAN_BLOG_REVALIDATE_ON_ERROR) !== "false",
    }
  : {};

// Helper function to check if a URL is available
export const checkUrlAvailability = async (url: string): Promise<boolean> => {
  if (isBuildTime) {
    return false;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`Failed to check URL availability (${url}):`, error);
    return false;
  }
};
