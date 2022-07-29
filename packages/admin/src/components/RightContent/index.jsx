import { Space, Tag } from 'antd';
import { useModel, history } from 'umi';
import styles from './index.less';
import { stringify } from 'querystring';

const loginOut = async () => {
  window.localStorage.removeItem('token');
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query; // Note: There may be security issues, please note

  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};
const GlobalHeaderRight = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <Space className={className}>
      <Tag color={'blue'} style={{ userSelect: 'none' }}>
        {initialState?.version || 'dev'}
      </Tag>
      <a
        onClick={() => {
          setInitialState((s) => ({ ...s, user: undefined }));
          loginOut();
          return;
        }}
      >
        退出登录
      </a>
    </Space>
  );
};

export default GlobalHeaderRight;
