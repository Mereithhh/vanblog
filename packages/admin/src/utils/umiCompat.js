import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Link as RouterLink } from 'react-router-dom';
import { useRef, useEffect } from 'react';

// Export Link component from react-router-dom
export const Link = RouterLink;

// Parse object-style path into string URL
const parsePathConfig = (path) => {
  if (typeof path === 'string') {
    return path;
  }
  
  // Handle object path config
  if (typeof path === 'object') {
    const { pathname, query } = path;
    
    if (!query || Object.keys(query).length === 0) {
      return pathname;
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }
  
  return path;
};

// React Router v6 doesn't have a history object directly, so we create a compatible API
const createHistory = (navigate, location) => {
  return {
    push: (path) => {
      const parsedPath = parsePathConfig(path);
      navigate(parsedPath);
    },
    replace: (path) => {
      const parsedPath = parsePathConfig(path);
      navigate(parsedPath, { replace: true });
    },
    goBack: () => navigate(-1),
    location,
  };
};

// Hook to provide a history object compatible with UMI's history
export const useHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return createHistory(navigate, location);
};

// Create a singleton history object for imports
// Note: This should be used with caution and only for migration
let singletonHistory = null;

// The base path for admin routes from main.jsx
const BASE_PATH = '/admin';

// Function to add base path properly to the URL
const addBasePath = (path) => {
  const pathString = typeof path === 'string' ? path : 
                    (path?.pathname || '/');
  
  // Don't modify paths that already have the base path
  if (pathString.startsWith(BASE_PATH + '/') || pathString === BASE_PATH) {
    return path;
  }
  
  // Add base path to relative paths
  if (pathString.startsWith('/')) {
    if (typeof path === 'string') {
      return `${BASE_PATH}${path}`;
    } else if (typeof path === 'object') {
      return {
        ...path,
        pathname: `${BASE_PATH}${path.pathname}`
      };
    }
  }
  
  // Return external URLs as-is
  return path;
};

// Export a modified history object
export const history = {
  push: (path) => {
    console.log('[DEBUG] history.push called with path:', path);
    
    if (singletonHistory) {
      // When used within React components, rely on React Router
      singletonHistory.push(path);
    } else {
      // For usage outside of React components, ensure base path
      const fullPath = addBasePath(path);
      const urlString = parsePathConfig(fullPath);
      console.log('[DEBUG] Redirecting to:', urlString);
      window.location.href = urlString;
    }
  },
  replace: (path) => {
    console.log('[DEBUG] history.replace called with path:', path);
    
    if (singletonHistory) {
      // When used within React components, rely on React Router
      singletonHistory.replace(path);
    } else {
      // For usage outside of React components, ensure base path
      const fullPath = addBasePath(path);
      const urlString = parsePathConfig(fullPath);
      console.log('[DEBUG] Replacing with:', urlString);
      window.location.replace(urlString);
    }
  },
  goBack: () => {
    if (singletonHistory) {
      singletonHistory.goBack();
    } else {
      // Fallback for outside React components
      window.history.back();
    }
  },
  get location() {
    // Convert search params to query object for Umi compatibility
    const locationWithQuery = { ...window.location };
    
    // Create query object from search string
    const searchParams = new URLSearchParams(window.location.search);
    const query = {};
    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }
    locationWithQuery.query = query;
    
    return locationWithQuery;
  },
};

// Custom hook to initialize and update the history singleton
export const useInitHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    singletonHistory = createHistory(navigate, location);
  }, [navigate, location]);
  
  return singletonHistory;
};

// Replacement for UMI's useModel hook
export const useModel = () => {
  const context = useAppContext();
  // Ensure these are objects/functions that can be safely called
  const initialState = context?.initialState || {};
  const setInitialState = context?.setInitialState || ((state) => state);
  
  return {
    initialState,
    setInitialState,
    loading: !initialState,
  };
}; 