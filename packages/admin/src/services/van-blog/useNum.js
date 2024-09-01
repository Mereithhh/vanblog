import { useState } from 'react';

export const useNum = (defaultNum, token) => {
  const key = `van-blog-admin-num-${token}`;
  // 获取 localstroge 的
  const localData = window.localStorage.getItem(key) || defaultNum;
  const [num, setNum] = useState(parseInt(localData));
  return [
    num,
    (newNum) => {
      window.localStorage.setItem(key, newNum);
      setNum(newNum);
    },
  ];
};
