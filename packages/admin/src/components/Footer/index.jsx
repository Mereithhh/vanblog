import { DefaultFooter } from '@ant-design/pro-layout';
import { GithubOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import './index.css';
const Footer = () => {
  const { initialState } = useModel('@@initialState');
  const currentYear = new Date().getFullYear();
  return (
    <>
      <div className="footer" style={{ textAlign: 'center' }}>
        <p>
          <span>Powered By </span>
          <a className="ua" href="https://vanblog.mereith.com" target="_blank" rel="noreferrer">
            VanBlog
          </a>
        </p>
        <p>
          <span>版本: </span>
          <span> {initialState?.version || 'developing mode'}</span>
        </p>
      </div>
    </>
  );
};

export default Footer;
