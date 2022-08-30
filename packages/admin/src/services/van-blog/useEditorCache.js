export const useEditorCache = (key) => {
  const getCache = () => {
    window.localStorage.getItem(key);
  };
  const setCache = (val) => {
    window.localStorage.setItem(key, val);
  };
  return [getCache, setCache];
};
