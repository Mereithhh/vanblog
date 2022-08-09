import Footer from '@/components/Footer';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { PageLoading, SettingDrawer } from '@ant-design/pro-layout';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import LogoutButton from './components/LogoutButton';
import ThemeButton from './components/ThemeButton';
import { fetchAllMeta } from './services/van-blog/api';
import { beforeSwitchTheme, getInitTheme, mapTheme } from './services/van-blog/theme';
const isDev = process.env.UMI_ENV === 'dev';
const loginPath = '/user/login';
/** 获取用户信息比较慢的时候会展示一个 loading */

export const initialStateConfig = {
  loading: <PageLoading />,
};
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState() {
  const fetchInitData = async (option) => {
    try {
      const msg = await fetchAllMeta(option);
      if (msg.statusCode == 233) {
        history.push('/init');
      } else if (window.location.pathname == '/init' && msg.statusCode == 200) {
        history.push('/');
      } else {
        return msg.data;
      }
    } catch (error) {
      history.push(loginPath);
    }

    return undefined;
  }; // 如果不是登录页面，执行
  let option = {};
  if (location.pathname == loginPath || location.pathname == '/init') {
    option.skipErrorHandler = true;
  }
  const initData = await fetchInitData(option);
  // 暗色模式
  const theme = getInitTheme();
  const sysTheme = mapTheme(theme);
  return {
    fetchInitData,
    ...initData,
    settings: { ...defaultSettings, navTheme: sysTheme },
    theme,
  };
} // ProLayout 支持的api https://procomponents.ant.design/components/layout

export const layout = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeButton />
          <LogoutButton
            key="logoutRightContent"
            trigger={
              <a>
                <LogoutOutlined />
                <span style={{ marginLeft: 6 }}>登出</span>
              </a>
            }
          />
        </div>
      );
    },
    // disableContentMargin: true,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history; // 如果没有登录，重定向到 login
      if (location.pathname === '/init' && !initialState?.user) {
        return;
      }
      if (!initialState?.user && location.pathname !== loginPath) {
        history.push(loginPath);
      }
      if (location.pathname == loginPath && Boolean(initialState?.user)) {
        history.push('/');
      }
    },
    links: [
      <a key="mainSiste" rel="noreferrer" target="_blank" href={initialState?.baseUrl || '/'}>
        <HomeOutlined />
        <span>主站</span>
      </a>,
      <LogoutButton
        key="logoutSider"
        trigger={
          <a>
            <LogoutOutlined />
            <span>登出</span>
          </a>
        }
      />,
    ],

    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              colorList={false}
              settings={initialState?.settings}
              themeOnly={true}
              onSettingChange={(settings) => {
                if (settings.navTheme != initialState?.settings?.navTheme) {
                  // 切换了主题
                  beforeSwitchTheme(settings.navTheme);
                }
                setInitialState((preInitialState) => ({ ...preInitialState, settings }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};
export const request = {
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: resData?.statusCode == 200 || resData?.statusCode == 233,
        errorMessage: resData.message,
      };
    },
  },
  requestInterceptors: [
    (url, options) => {
      return {
        url: url,
        options: {
          ...options,
          interceptors: true,
          headers: {
            token: (() => {
              return window.localStorage.getItem('token') || 'null';
            })(),
          },
        },
      };
    },
  ],
  // responseInterceptors: [
  //   response => {
  //     if (response.statusCode === 233) {
  //       console.log("go to init!")
  //       // window.location.pathname = '/init'
  //       history.push('/init')
  //       return response
  //     } else {
  //       return response
  //     }

  //   }
  // ]
};
