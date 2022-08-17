import Footer from '@/components/Footer';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { PageLoading, SettingDrawer } from '@ant-design/pro-layout';
import { notification } from 'antd';
import moment from 'moment';
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
        return {};
      } else if (history.location.pathname == '/init' && msg.statusCode == 200) {
        history.push('/');
      }
      return msg.data;
    } catch (error) {
      console.log('fet init data error', error);
      history.push(loginPath);
      return {};
    }
  }; // 如果不是登录页面，执行
  let option = {};
  if (history.location.pathname == loginPath || history.location.pathname == '/init') {
    option.skipErrorHandler = true;
  }
  const initData = await fetchInitData(option);

  const { latestVersion, updatedAt, version } = initData;
  // 来一个横幅提示
  if (version && latestVersion && version != 'dev') {
    if (version == latestVersion) {
      // 新的
      // notification.success({
      //   message: (
      //     <div>
      //       <p style={{ marginBottom: 4 }}>{`当前版本:\t${version}()`}</p>
      //       <p style={{ marginBottom: 4 }}>{`更新时间:\t${moment(updatedAt).format(
      //         'YYYY-MM-DD HH:mm:ss',
      //       )}`}</p>
      //     </div>
      //   ),
      // });
    } else {
      // 老的
      notification.info({
        message: (
          <div>
            <p style={{ marginBottom: 4 }}>有新版本！</p>
            <p style={{ marginBottom: 4 }}>{`当前版本:\t${version}`}</p>
            <p style={{ marginBottom: 4 }}>{`最新版本:\t${latestVersion}`}</p>
            <p style={{ marginBottom: 4 }}>{`更新时间:\t${moment(updatedAt).format(
              'YYYY-MM-DD HH:mm:ss',
            )}`}</p>
          </div>
        ),
      });
    }
  }
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
          {
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
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          }
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
