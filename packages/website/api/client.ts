import { config, isBuildTime, isDevelopment } from '../utils/loadConfig';

const isBrowser = typeof window !== 'undefined';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string,
    public context?: string,
    public details?: any,
    public stack?: string
  ) {
    super(message);
    this.name = 'ApiError';

    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      endpoint: this.endpoint,
      context: this.context,
      details: this.details,
      stack: this.stack
    };
  }
}

export class ApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly cacheDuration: number;

  constructor(baseUrl?: string, cacheDuration = 5 * 60 * 1000) { // 5 minutes default cache
    this.baseUrl = baseUrl || config.baseUrl;
    
    // Validate that baseUrl is properly set
    if (!this.baseUrl) {
      console.warn('[ApiClient] No baseUrl provided. Setting default fallback URL.');
      this.baseUrl = 'http://127.0.0.1:3000';
    } else if (this.baseUrl !== 'window.location.origin' && !this.isValidUrlString(this.baseUrl)) {
      console.warn(`[ApiClient] Invalid baseUrl format: "${this.baseUrl}". Setting default fallback URL.`);
      this.baseUrl = 'http://127.0.0.1:3000';
    }
    
    this.cache = new Map();
    this.cacheDuration = cacheDuration;
    
    // Log configuration in development mode
    if (isDevelopment) {
      console.log(`[ApiClient] Initialized with baseUrl: ${this.baseUrl}`);
      this.validateEnvironmentVariables();
    }
  }
  
  private validateEnvironmentVariables() {
    const serverUrl = typeof process !== 'undefined' ? process.env.VAN_BLOG_SERVER_URL : undefined;
    const clientUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL : undefined;
    
    if (isDevelopment) {
      console.log('[ApiClient] Environment check:');
      console.log(`- VAN_BLOG_SERVER_URL: ${serverUrl || 'not set'}`);
      console.log(`- NEXT_PUBLIC_VANBLOG_SERVER_URL: ${clientUrl || 'not set'}`);
    }
    
    // Check if we're in the browser and using the right URL
    if (isBrowser) {
      if (serverUrl && !clientUrl) {
        console.warn(`[ApiClient] Warning: Running in browser but only VAN_BLOG_SERVER_URL is set. This might cause issues as browser code cannot directly access non-NEXT_PUBLIC_ variables.`);
      }
      
      if (clientUrl && this.baseUrl !== clientUrl) {
        console.warn(`[ApiClient] Warning: Current baseUrl (${this.baseUrl}) doesn't match NEXT_PUBLIC_VANBLOG_SERVER_URL (${clientUrl})`);
      }
    } else {
      // Server-side
      if (serverUrl && this.baseUrl !== serverUrl) {
        console.warn(`[ApiClient] Warning: Current baseUrl (${this.baseUrl}) doesn't match VAN_BLOG_SERVER_URL (${serverUrl})`);
      }
    }
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return `${endpoint}:${queryString}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration;
  }

  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3,
    context = ''
  ): Promise<T> {
    if (isBuildTime) {
      return {} as T;
    }
    
    let url: URL;
    if (this.baseUrl === "window.location.origin") {
      if (isBrowser) {
        // Browser: Use actual window.location.origin
        url = new URL(endpoint, window.location.origin);
      } else {
        // Server: We need a valid base URL - use an absolute URL or default
        const serverUrl = typeof process !== 'undefined' ? 
          (process.env.VAN_BLOG_SERVER_URL || 'http://127.0.0.1:3000') : 
          'http://127.0.0.1:3000';
        url = new URL(endpoint, serverUrl);
      }
    } else {
      // Normal case: baseUrl is a valid URL string
      url = new URL(endpoint, this.baseUrl);
    }
    
    if (isDevelopment) {
      console.log(`[ApiClient] Fetching ${url} (${context})`);
    }

    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details available');
          let errorData = {};
          
          try {
            if (errorText && errorText.trim().startsWith('{')) {
              errorData = JSON.parse(errorText);
            }
          } catch (parseError) {
            console.error(`[ApiClient] Error parsing error response: ${parseError}`);
          }
          
          throw new ApiError(
            `HTTP error! url: ${url}, status: ${response.status}, ${(errorData as any).message || errorText}`,
            response.status,
            endpoint,
            context,
            errorData
          );
        }

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`[ApiClient] Response is not JSON: ${contentType}`);
          // Try to parse as JSON anyway, but be prepared for failure
          try {
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            return data as T;
          } catch (parseError) {
            console.error(`[ApiClient] Error parsing non-JSON response: ${parseError}`);
            throw new ApiError(
              `Invalid response format: ${contentType}`,
              response.status,
              endpoint,
              context,
              { parseError }
            );
          }
        }

        const data = await response.json();
        return data as T;
      } catch (error: any) {
        lastError = error;
        if (isDevelopment) {
          console.error(`[ApiClient] Fetch attempt ${i + 1}/${retries} failed:`, error);
        }
        
        if (i < retries - 1) {
          const delay = 1000 * (i + 1);
          if (isDevelopment) {
            console.log(`[ApiClient] Retrying in ${delay}ms...`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Provide helpful error message for connection issues
    if (isDevelopment && 
        lastError && 
        (lastError.message === 'Failed to fetch' || lastError.name === 'AbortError')) {
      const serverUrl = typeof process !== 'undefined' ? process.env.VAN_BLOG_SERVER_URL : undefined;
      const clientUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL : undefined;
      
      console.error(`
        [ApiClient] Connection Error: Unable to connect to ${this.baseUrl}
        
        This could be due to:
        1. The API server is not running
        2. The API server is running on a different URL than configured
        3. CORS is not properly configured
        
        Check your environment variables:
        - VAN_BLOG_SERVER_URL: ${serverUrl || 'not set'}
        - NEXT_PUBLIC_VANBLOG_SERVER_URL: ${clientUrl || 'not set'}
        - isBrowser: ${isBrowser}
      `);
    }

    if (lastError instanceof ApiError) {
      throw lastError;
    } else if (lastError) {
      throw new ApiError(
        lastError.message || 'Unknown error occurred',
        undefined,
        endpoint,
        context,
        { originalError: lastError.toString() }
      );
    }

    // This should never happen, but TypeScript requires a return value
    throw new ApiError('Maximum retries exceeded', undefined, endpoint, context);
  }

  async get<T>(endpoint: string, params?: Record<string, any>, context = ''): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedItem = this.cache.get(cacheKey);

    if (cachedItem && this.isCacheValid(cachedItem.timestamp)) {
      return cachedItem.data as T;
    }

    let url = endpoint;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    const data = await this.fetchWithRetry<T>(url, { method: 'GET' }, 3, context);
    
    // Cache the result
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  async post<T>(endpoint: string, body: any, context = ''): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    return this.fetchWithRetry<T>(endpoint, options, 3, context);
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(endpoint: string, params?: Record<string, any>): void {
    const cacheKey = this.getCacheKey(endpoint, params);
    this.cache.delete(cacheKey);
  }

  private isValidUrlString(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Create a singleton instance of the API client
export const apiClient = new ApiClient();
