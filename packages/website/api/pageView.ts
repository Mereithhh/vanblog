import { apiService } from './service';
import { PageViewData } from './types';

const DEFAULT_PAGEVIEW_RESPONSE: PageViewData = { viewer: 0, visited: 0 };

export type { PageViewData };

export const getPageview = async (pathname: string): Promise<PageViewData> => {
  try {
    return await apiService.getPageView();
  } catch (err) {
    console.error('[PageView] Error getting pageview:', err);
    return DEFAULT_PAGEVIEW_RESPONSE;
  }
};

// Server-side-compatible version of pageview
export const getServerPageview = async (): Promise<PageViewData> => {
  try {
    return await apiService.getPageView();
  } catch (err) {
    console.error('[PageView] Error getting server pageview:', err);
    return DEFAULT_PAGEVIEW_RESPONSE;
  }
};

// Client-side only function to update pageviews
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
    const options = {
      isNew: !hasVisited,
      isNewByPath: !hasVisitedCurrentPath
    };
    
    try {
      return await apiService.updatePageView(options);
    } catch (fetchError) {
      console.warn('[PageView] Failed to update pageview, using fallback data:', fetchError);
      
      try {
        return await apiService.getPageView();
      } catch (cacheError) {
        console.warn('[PageView] Failed to get cached pageview data:', cacheError);
        return DEFAULT_PAGEVIEW_RESPONSE;
      }
    }
  } catch (err) {
    console.error('[PageView] Error in updatePageview:', err);
    return DEFAULT_PAGEVIEW_RESPONSE;
  }
};

