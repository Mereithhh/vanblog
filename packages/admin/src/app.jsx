import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import { PageLoading, SettingDrawer } from '@ant-design/pro-layout';
import { history, Link } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { fetchAll } from './services/van-blog/api';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const basePath = '/';
/** 获取用户信息比较慢的时候会展示一个 loading */

export const initialStateConfig = {
  loading: <PageLoading />,
};
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

export async function getInitialState() {
  // console.log("init")
  const fetchInitData = async (option) => {
    try {
      const msg = await fetchAll(option);

      // console.log(msg,window.location.pathname)
      if (msg.statusCode == 233) {
        history.push('/init');
      } else if (window.location.pathname == '/init' && msg.statusCode == 200) {
        history.push('/');
      } else {
        const result = msg.data;
        if (result.articles && result.meta && result.meta.about) {
          // 把 about 加进去
          result.articles?.push({
            id: 0,
            category: '关于',
            tag: ['关于'],
            content: result.meta.about.content,
            updatedAt: result.meta.about.updatedAt,
          });
        }
        return msg.data;
      }
    } catch (error) {
      // console.log("error",error)
      history.push(loginPath);
    }

    return undefined;
  }; // 如果不是登录页面，执行
  let option = {};
  if (location.pathname == loginPath || location.pathname == '/init') {
    option.skipErrorHandler = true;
  }
  const initData = await fetchInitData(option);
  return {
    fetchInitData,
    ...initData,
    settings: defaultSettings,
  };
} // ProLayout 支持的api https://procomponents.ant.design/components/layout

export const layout = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history; // 如果没有登录，重定向到 login
      // console.log('onchange,',location,initialState)
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
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
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
              settings={initialState?.settings}
              onSettingChange={(settings) => {
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
        success: resData?.statusCode == 200,
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
