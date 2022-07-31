import { useModel } from 'umi';
import './index.css';
const Footer = () => {
  const { initialState } = useModel('@@initialState');
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
          <span> {initialState?.version || 'dev'}</span>
        </p>
      </div>
    </>
  );
};

export default Footer;
