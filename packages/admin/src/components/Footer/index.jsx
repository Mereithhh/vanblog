import { useEffect, useRef } from 'react';
import { history, useModel } from 'umi';
import './index.css';
const Footer = () => {
  const { initialState } = useModel('@@initialState');
  const { current } = useRef({ hasInit: false });
  // const version = useMemo(() => {
  //   let v = initialState?.version || '获取中...';
  //   if (history.location.pathname == '/user/login') {
  //     v = '登录后显示';
  //   }
  //   return v;
  // }, [initialState, history]);
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      let v = initialState?.version || '获取中...';
      if (history.location.pathname == '/user/login') {
        v = '登录后显示';
      }
      console.log('✨ Welcome to VanBlog Website ✨');
      console.log('Version:', props?.option?.version || "unknown");
      // console.log('Website:', 'https://vanblog.mereith.com');
      console.log('GitHub:', 'https://github.com/CornWorld/vanblog');
      console.log('!!!', 'This is a fork of VanBlog, and is not the official website.', '!!!');
      console.log('If you like this project, please give it a star! 🌟');
    }
  }, [initialState, history]);
  return null;
  // return (
  //   <>
  //     <div className="footer" style={{ textAlign: 'center', marginTop: 32 }}>
  //       <p>
  //         <span>Powered By </span>
  //         <a className="ua" href="https://vanblog.mereith.com" target="_blank" rel="noreferrer">
  //           VanBlog
  //         </a>
  //       </p>
  //       <p>
  //         <span>版本: </span>
  //         <span> {version}</span>
  //       </p>
  //     </div>
  //   </>
  // );
};

export default Footer;
