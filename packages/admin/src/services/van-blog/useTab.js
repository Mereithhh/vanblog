import { history } from 'umi';
import { useState } from 'react';
export const useTab = (init, tabKey) => {
  // 获取最新的 key

  const [currTabKey, setCurrTabKey] = useState(history.location.query[tabKey] || init);
  return [
    currTabKey,
    (newTab) => {
      setCurrTabKey(newTab);
      const newQuery = {};
      for (const [k, v] of Object.entries(history.location.query)) {
        newQuery[k] = v;
      }

      newQuery[tabKey] = newTab;

      // 拼接成 query 字符串
      let queryString = '?';
      for (const [k, v] of Object.entries(newQuery)) {
        queryString += `${k}=${v}&`;
      }
      queryString = queryString.substring(0, queryString.length - 1);
      history.push(`${history.location.pathname}${queryString}`);
    },
  ];
};
