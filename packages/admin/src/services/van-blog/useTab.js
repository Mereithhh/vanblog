import { history } from '@/utils/umiCompat';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useTab = (init, tabKey) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial value from URL search params
  const getInitialValue = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(tabKey) || init;
  };
  
  const [currTabKey, setCurrTabKey] = useState(getInitialValue());
  
  // Update state if URL changes
  useEffect(() => {
    const value = getInitialValue();
    if (value !== currTabKey) {
      setCurrTabKey(value);
    }
  }, [location.search, init, tabKey]);
  
  return [
    currTabKey,
    (newTab) => {
      setCurrTabKey(newTab);
      
      // Create new search params from current ones
      const searchParams = new URLSearchParams(location.search);
      
      // Update tab parameter
      searchParams.set(tabKey, newTab);
      
      // Navigate to same pathname with updated search params
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    },
  ];
};
