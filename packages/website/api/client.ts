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
    // If a specific baseUrl is provided, use it (useful for testing) 
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
      console.log(`[ApiClient] isBrowser: ${isBrowser}`);
      
      // Check and validate environment variables
      this.validateEnvironmentVariables();
    }
  }
  
  private validateEnvironmentVariables() {
    const serverUrl = typeof process !== 'undefined' ? process.env.VAN_BLOG_SERVER_URL : undefined;
    const clientUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL : undefined;
    
    console.log('[ApiClient] Environment check:');
    console.log(`- VAN_BLOG_SERVER_URL: ${serverUrl || 'not set'}`);
    console.log(`- NEXT_PUBLIC_VANBLOG_SERVER_URL: ${clientUrl || 'not set'}`);
    
    // Check if we're in the browser and using the right URL
    if (isBrowser) {
      if (serverUrl && !clientUrl) {
        console.warn(`[ApiClient] Warning: Running in browser but only VAN_BLOG_SERVER_URL is set. This might cause issues as browser code cannot directly access non-NEXT_PUBLIC_ variables.`);
        console.warn(`[ApiClient] Consider setting NEXT_PUBLIC_VANBLOG_SERVER_URL for proper browser access.`);
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
    
    console.log(`[ApiClient] Fetching ${url} (${context})`);

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
        console.error(`[ApiClient] Fetch attempt ${i + 1}/${retries} failed:`, error);
        
        if (i < retries - 1) {
          const delay = 1000 * (i + 1);
          console.log(`[ApiClient] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If we're in development mode and the error is a connection error,
    // provide a more helpful error message
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
        
        Recommended actions:
        ${isBrowser 
          ? `- For browser requests, make sure NEXT_PUBLIC_VANBLOG_SERVER_URL points to a URL accessible from the browser
        - Check browser console for CORS errors` 
          : `- For server-side requests, make sure VAN_BLOG_SERVER_URL points to a URL accessible from the server
        - Verify network connectivity between services`}
        - If running in Docker, check container networking
        - Verify the API server is running and responding to requests
        
        Make sure the API server is running and accessible.
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

    throw new ApiError('Unknown error occurred', undefined, endpoint, context);
  }

  async get<T>(endpoint: string, params?: Record<string, any>, context = ''): Promise<T> {
    if (isBuildTime) {
      return {} as T;
    }

    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data as T;
    }

    const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
    const data = await this.fetchWithRetry<T>(`${endpoint}${queryString}`, {
      method: 'GET'
    }, 3, context);

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async post<T>(endpoint: string, body: any, context = ''): Promise<T> {
    if (isBuildTime) {
      return {} as T;
    }

    return this.fetchWithRetry<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    }, 3, context);
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(endpoint: string, params?: Record<string, any>): void {
    const cacheKey = this.getCacheKey(endpoint, params);
    this.cache.delete(cacheKey);
  }

  // Helper method to check if a string is a valid URL
  private isValidUrlString(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
