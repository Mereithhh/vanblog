import { useModel, history } from 'umi';
import { stringify } from 'querystring';
import { message } from 'antd';
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
export default function (props) {
  const { setInitialState } = useModel('@@initialState');
  const { trigger } = props;
  return (
    <div
      onClick={() => {
        setInitialState((s) => ({ ...s, user: undefined }));
        loginOut().then(() => {
          message.success('登出成功！');
        });
      }}
    >
      {trigger}
    </div>
  );
}
