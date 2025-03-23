import Footer from '@/components/Footer';
import { login } from '@/services/van-blog/api';
import { encryptPwd } from '@/services/van-blog/encryptPwd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { message } from 'antd';
import { history, useModel } from '@/utils/umiCompat';
import { setAccessToken, resetRedirectCycle } from '@/utils/auth';
import './index.less';
import { useEffect } from 'react';

const Login = () => {
  const type = 'account';
  const { initialState, setInitialState } = useModel();
  
  // 页面加载时重置重定向循环检测和清理可能过期的token
  useEffect(() => {
    console.log('[DEBUG] Login page loaded');
    
    // 重置可能导致循环的状态
    resetRedirectCycle();
    
    // 清除可能存在的过期token
    // 注意：仅在处于redirect循环时清除token，避免正常登录流程被干扰
    const count = parseInt(sessionStorage.getItem('vanblog_redirect_count') || '0', 10);
    if (count >= 2) {
      console.log('[DEBUG] Potential redirect cycle detected, removing token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('vanblog_redirect_count');
      sessionStorage.removeItem('vanblog_redirect_timestamp');
    }
  }, []);

  // 处理登录表单提交
  const handleSubmit = async (values) => {
    console.log('[DEBUG] Login form submitted');
    
    // 再次重置重定向循环检测
    resetRedirectCycle();
    
    try {
      // 显示加载消息
      message.loading('登录中...', 0.5);
      // 发送登录请求
      const msg = await login({
        username: values.username,
        password: values.password 
      }, { skipErrorHandler: true }); // 跳过默认错误处理
      
      // 处理成功响应
      if (msg.statusCode === 200 && msg.data?.token) {
        // 显示成功消息
        message.success('登录成功！');
        
        // 获取用户信息和令牌
        const token = msg.data.token;
        const user = msg.data.user ? {
          name: msg.data.user.name,
          id: msg.data.user.id,
          type: msg.data.user.type,
        } : null;
        
        if (!user) {
          console.error('[DEBUG] Login response missing user data');
          message.error('登录响应缺少用户信息');
          return;
        }
        
        // 保存令牌
        console.log('[DEBUG] Saving token and user data');
        setAccessToken(token);
        
        // 更新应用状态
        await setInitialState((s) => ({
          ...s,
          token: token,
          user: user,
        }));
        
        // 获取初始化数据
        console.log('[DEBUG] Fetching initial data');
        try {
          const meta = await initialState?.fetchInitData();
          
          if (meta) {
            console.log('[DEBUG] Updated app state with meta data');
            await setInitialState((s) => ({
              ...s,
              token: token,
              user: user,
              ...meta,
            }));
          }
        } catch (metaError) {
          console.error('[DEBUG] Error fetching meta data:', metaError);
          // 继续处理，即使获取元数据失败
        }
        
        // 处理重定向
        console.log('[DEBUG] Handling redirect after login');
        // 检查history对象
        if (!history) {
          console.error('[DEBUG] History object not available');
          window.location.href = '/admin/';
          return;
        }
        
        try {
          // 获取查询参数中的重定向URL
          const { query } = history.location;
          const { redirect } = query || {};
          const targetPath = redirect || '/';
          
          console.log('[DEBUG] Redirecting to:', targetPath);
          history.push(targetPath);
        } catch (navError) {
          console.error('[DEBUG] Navigation error:', navError);
          // 如果路由跳转失败，使用直接URL导航
          window.location.href = '/admin/';
        }
        
        return;
      } else if (msg.statusCode === 401 || msg.response?.status === 401) {
        // 处理认证失败
        console.log('[DEBUG] Login failed with 401');
        message.error(msg.message || '用户名或密码错误');
      } else {
        // 处理其他错误
        console.log('[DEBUG] Login failed with status:', msg.statusCode || msg.response?.status);
        message.error(msg.message || '登录失败，请稍后再试');
      }
    } catch (error) {
      // 处理请求异常
      console.error('[DEBUG] Login error:', error);
      
      if (error.response?.status === 401) {
        console.log('[DEBUG] Caught 401 error @auth.controller.ts @auth.provider.ts');
        message.error('用户名或密码错误');
      } else if (error.message) {
        message.error(`登录失败: ${error.message}`);
      } else {
        message.error('登录请求失败，请检查网络连接');
      }
    }
  };

  return (
    <div className="container">
      <div className="content">
        <LoginForm
          className="loginForm"
          logo={<img alt="logo" src="/logo.svg" />}
          title="VanBlog"
          subTitle={'VanBlog 博客管理后台'}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            try {  
              await handleSubmit({
                username: values.username,
                password: values.password,
              });
            } catch (error) {
              console.error('[DEBUG] Error in form processing:', error);
              message.error('表单处理出错，请重试');
            }
          }}
        >
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                autoComplete="off"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className="prefixIcon" />,
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
                autoComplete="off"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className="prefixIcon" />,
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
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              onClick={() => {
                history.push('/user/restore');
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
