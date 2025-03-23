import { logout } from '@/services/van-blog/api';
import { message } from 'antd';
import { history, useModel } from '@/utils/umiCompat';
import { removeAccessToken } from '@/utils/auth';

const loginOut = async () => {
  await logout();

  const { query = {}, search, pathname } = history.location;
  const { redirect } = query; // Note: There may be security issues, please note

  if (pathname !== '/user/login') {
    history.replace({
      pathname: '/user/login',
      // search: stringify({
      //   redirect: pathname + search,
      // }),
    });
    removeAccessToken();
  }
};

export default function (props) {
  const { setInitialState } = useModel();
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
