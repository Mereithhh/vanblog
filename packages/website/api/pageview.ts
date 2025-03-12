import { apiClient } from './client';

const DEFAULT_PAGEVIEW_RESPONSE = { viewer: 0, visited: 0 };

export interface PageViewData {
  viewer: number;
  visited: number;
}

export const getPageview = async (pathname: string): Promise<PageViewData> => {
  try {
    const endpoint = `/api/public/viewer`;
    const response = await apiClient.get<{ statusCode: number; data: PageViewData }>(endpoint, undefined, 'getPageview');
    
    return response.data || DEFAULT_PAGEVIEW_RESPONSE;
  } catch (err) {
    console.log(err);
    return DEFAULT_PAGEVIEW_RESPONSE;
  }
}

// Server-side-compatible version of updatePageview
export const getServerPageview = async (): Promise<PageViewData> => {
  try {
    const endpoint = `/api/public/viewer`;
    const response = await apiClient.get<{ statusCode: number; data: PageViewData }>(endpoint, undefined, 'getServerPageview');
    
    return response.data || DEFAULT_PAGEVIEW_RESPONSE;
  } catch (err) {
    console.log(err);
    return DEFAULT_PAGEVIEW_RESPONSE;
  }
}

// Client-side only function
export const updatePageview = async (
  pathname: string
): Promise<PageViewData> => {
  const hasVisited = window.localStorage.getItem("visited") === "true";
  const hasVisitedCurrentPath = window.localStorage.getItem(`visited-${pathname}`) === "true";

  if (!hasVisited) {
    window.localStorage.setItem("visited", "true");
  }

  if (!hasVisitedCurrentPath) {
    window.localStorage.setItem(`visited-${pathname}`, "true");
  }

  try {
    const endpoint = `/api/public/viewer`;
    const params = {
      isNew: !hasVisited,
      isNewByPath: !hasVisitedCurrentPath
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await apiClient.post<{ statusCode: number; data: PageViewData }>(
        endpoint, 
        params,
        'updatePageview'
      );
      
      clearTimeout(timeoutId);
      return response.data || DEFAULT_PAGEVIEW_RESPONSE;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      console.warn('[PageView] Failed to update pageview, using fallback data:', fetchError);
      
      try {
        const cachedData = await apiClient.get<{ statusCode: number; data: PageViewData }>(
          endpoint,
          undefined,
          'getPageviewFallback'
        );
        return cachedData.data || DEFAULT_PAGEVIEW_RESPONSE;
      } catch (cacheError) {
        console.warn('[PageView] Failed to get cached pageview data:', cacheError);
        return DEFAULT_PAGEVIEW_RESPONSE;
      }
    }
  } catch (err) {
    console.log('[PageView] Error in updatePageview:', err);
    return DEFAULT_PAGEVIEW_RESPONSE;
  }
};

