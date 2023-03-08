import { useHistory, useLocation } from 'umi';

export const useQuery = () => {
  const { query } = useLocation();
  const history = useHistory();
  const setQuery = (setObj) => {
    const basePath = history.location.pathname;
    const newQuery = {};
    for (const [k, v] of Object.entries(query)) {
      newQuery[k] = v;
    }
    for (const [k, v] of Object.entries(setObj)) {
      newQuery[k] = v;
    }
    // 拼接成 query 字符串
    let queryString = '?';
    for (const [k, v] of Object.entries(newQuery)) {
      queryString += `${k}=${v}&`;
    }
    queryString = queryString.substring(0, queryString.length - 1);
    const fullPath = basePath + queryString;
    history.push(fullPath);
  };

  return [query, setQuery];
};
