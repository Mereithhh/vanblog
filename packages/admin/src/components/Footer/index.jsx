import { useEffect, useRef } from 'react';
import { useModel } from 'umi';
import './index.css';
const Footer = () => {
  const { initialState } = useModel('@@initialState');
  const { current } = useRef({ hasInit: false });
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      console.log('🚀欢迎使用 VanBlog 博客系统');
      console.log('当前版本：', initialState?.version || '获取中...');
      console.log('项目主页：', 'https://vanblog.mereith.com');
      console.log('开源地址：', 'https://github.com/mereithhh/van-blog');
    }
  }, [initialState]);
  return (
    <>
      <div className="footer" style={{ textAlign: 'center', marginTop: 32 }}>
        <p>
          <span>Powered By </span>
          <a className="ua" href="https://vanblog.mereith.com" target="_blank" rel="noreferrer">
            VanBlog
          </a>
        </p>
        <p>
          <span>版本: </span>
          <span> {initialState?.version || '获取中...'}</span>
        </p>
      </div>
    </>
  );
};

export default Footer;
