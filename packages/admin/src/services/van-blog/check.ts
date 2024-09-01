import { message } from 'antd';

export const checkDemo = () => {
  if (location.hostname == 'blog-demo.mereith.com') {
    message.warn('演示站禁止此操作！');
    return false;
  }
  return true;
};
