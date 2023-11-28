import { isMac, isMobileByScreenSize } from '@/services/van-blog/ua';
import { useMemo } from 'react';

export const SaveTip = () => {
  const text = useMemo(() => {
    if (isMobileByScreenSize()) {
      return '保存';
    } else {
      if (isMac()) {
        return '保存 ⌘ + S';
      } else {
        return '保存 Ctrl + S';
      }
    }
  }, []);
  return <span>{text}</span>;
};
