import Footer from '@/components/Footer';
import { login } from '@/services/van-blog/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
import { history, useModel } from 'umi';
import styles from './index.less';

const Login = () => {
  const type = 'account';
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values) => {
    try {
      // 登录
      const msg = await login({ ...values, type });

      if (msg.statusCode === 200) {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        const token = msg.data.token;
        const user = {
          name: msg.data.user.name,
          id: msg.data.user.id,
        };
        window.localStorage.setItem('token', token);
        await setInitialState((s) => ({
          ...s,
          token: token,
          user: user,
        }));
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query;
        history.push(redirect || '/');
        return;
      }
    } catch (error) {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/admin/logo.svg" />}
          title="Van Blog"
          subTitle={'Van Blog 博客管理后台'}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values);
          }}
        >
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
