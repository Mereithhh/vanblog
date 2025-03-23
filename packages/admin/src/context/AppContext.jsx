import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { message, Modal, notification } from 'antd';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAllMeta } from '../services/van-blog/api';
import { checkUrl } from '../services/van-blog/checkUrl';
import { beforeSwitchTheme, getInitTheme, mapTheme } from '../services/van-blog/theme';
import { checkRedirectCycle, getAccessToken, removeAccessToken, isLoggedIn, resetRedirectCycle } from '../utils/auth';

const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const loginPath = '/user/login';
  const initPath = '/init';

  // Detect if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  const fetchInitData = async (option) => {
    try {
      console.log('[DEBUG] Fetching init data with options:', option);
      const msg = await fetchAllMeta(option);
      console.log('[DEBUG] Init data response status:', msg.statusCode);
      
      // 如果需要初始化并且不在初始化页面，就重定向到初始化页面
      if (msg.statusCode === 233) {
        console.log('[DEBUG] App needs initialization');
        if (location.pathname !== initPath) {
          console.log('[DEBUG] Redirecting to /init');
          navigate(initPath, { replace: true });
        } else {
          console.log('[DEBUG] Already on init page, not redirecting');
        }
        return msg.data || {};
      } else if (location.pathname === initPath && msg.statusCode === 200) {
        console.log('[DEBUG] On init page but app is initialized, redirecting to home');
        navigate('/', { replace: true });
      }
      
      if (msg.statusCode === 200 && msg.data) {
        console.log('[DEBUG] Init data successfully fetched');
        return msg.data;
      } else {
        console.warn('[DEBUG] Failed to fetch init data:', msg);
        return {};
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching init data:', error);
      
      // 如果状态码是 233，表示需要初始化
      if (error.response?.status === 233 || error.data?.statusCode === 233) {
        console.log('[DEBUG] System needs initialization');
        if (location.pathname !== initPath) {
          console.log('[DEBUG] Redirecting to init page');
          navigate(initPath, { replace: true });
        }
        return {};
      }
      
      // In development mode, provide default data instead of redirecting to login
      if (isDevelopment) {
        console.warn('[DEBUG] Using mock data for development');
        return {
          latestVersion: '0.0.0-dev',
          updatedAt: new Date().toISOString(),
          baseUrl: 'http://localhost',
          version: 'dev',
          user: { username: 'dev-user', type: 'admin' }
        };
      }
      
      // Don't redirect to login if already on login page or in the login process
      const isAuthPage = location.pathname.includes(loginPath) || location.pathname.includes(initPath);
      
      if (!isAuthPage) {
        console.log('[DEBUG] Not on auth page, redirecting to login');
        navigate(loginPath, { replace: true });
      } else {
        console.log('[DEBUG] Already on auth page, not redirecting');
      }
      
      return {};
    }
  };

  useEffect(() => {
    // 初始化当前APP的状态
    const init = async () => {
      console.log('[DEBUG] Starting app initialization');
      setLoading(true);
      
      try {
        // 定义重要路径的检查函数
        const isLoginPage = location.pathname.includes(loginPath);
        const isInitPage = location.pathname.includes(initPath);
        const isRestorePage = location.pathname.includes('/user/restore');
        const isAuthPage = isLoginPage || isInitPage || isRestorePage;
        const isAuthenticated = isLoggedIn();
        
        console.log('[DEBUG] Init context:', { 
          path: location.pathname, 
          isAuthPage,
          isAuthenticated 
        });
        
        // 检查重定向循环
        if (!isAuthPage && !isAuthenticated && checkRedirectCycle()) {
          console.error('[DEBUG] Breaking redirect cycle during initialization');
          message.error('检测到重定向循环，请刷新页面或清除浏览器缓存', 10);
          removeAccessToken();
          setInitialState({
            fetchInitData,
            settings: {
              navTheme: 'light',
              layout: 'side',
              headerRender: false,
            },
          });
          setLoading(false);
          return;
        }
        
        // 重置重定向循环计数，特别是在认证页面
        if (isAuthPage) {
          console.log('[DEBUG] On auth page, resetting redirect cycle');
          resetRedirectCycle();
        }
        
        // 如果在初始化页面，设置最小状态
        if (isInitPage) {
          console.log('[DEBUG] On init page, setting minimal state');
          setInitialState({
            fetchInitData,
            settings: {
              navTheme: 'light',
              layout: 'side',
              headerRender: false,
            },
          });
          setLoading(false);
          
          // 尝试获取初始化数据以检查是否需要初始化
          console.log('[DEBUG] Checking if initialization is needed');
          fetchInitData().catch(err => {
            console.warn('[DEBUG] Error checking initialization status:', err);
          });
          return;
        }
        
        // 首先检查用户是否已登录
        if (!isAuthenticated && !isAuthPage) {
          console.log('[DEBUG] Not authenticated, redirecting to login from:', location.pathname);
          setLoading(false);
          // 将当前路径添加为重定向参数
          const redirectParam = location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname)}` : '';
          navigate(`${loginPath}${redirectParam}`, { replace: true });
          return;
        }
        
        // 只有在非认证页面且已认证时才获取初始化数据
        let meta = {};
        if (!isAuthPage || isAuthenticated) {
          // 获取初始化数据
          meta = await fetchInitData();
        }
        
        // 检查获取的数据
        if (!meta || Object.keys(meta).length === 0) {
          console.warn('[DEBUG] Empty meta data received');
          if (isAuthenticated && !isAuthPage) {
            console.log('[DEBUG] Token might be invalid, but not redirecting to avoid loops');
            // 不立即重定向，让页面级检查处理，避免循环
          }
        }
        
        // 验证BaseURL的有效性
        if (meta.baseUrl && !meta.baseUrl.startsWith('http')) {
          // URL格式无效，显示警告
          Modal.warning({
            title: '警告',
            content: `您的网站URL配置错误: ${meta.baseUrl}, 请更正为包含 http:// 或 https:// 的完整URL`,
          });
        }
        
        // 检查版本更新
        if (meta.latestVersion && meta.version && meta.latestVersion !== meta.version) {
          console.log('[DEBUG] New version available:', meta.latestVersion);
          if (!meta.version.includes('dev')) {
            Modal.info({
              title: '版本更新',
              content: `新版本可用: ${meta.latestVersion}, 当前版本: ${meta.version}`,
            });
          }
        }
        
        // 更新应用状态
        setInitialState({
          ...meta,
          fetchInitData,
          settings: {
            navTheme: 'light',
            layout: 'side',
            headerRender: false,
          },
        });
      } catch (error) {
        console.error('[DEBUG] Error during app initialization:', error);
        // 避免非认证页面的自动重定向，防止循环
        if (!isAuthPage && !checkRedirectCycle()) {
          navigate(loginPath, { replace: true });
        } else {
          // 提供最小状态以便应用能够运行
          setInitialState({
            fetchInitData,
            settings: {
              navTheme: 'light',
              layout: 'side',
              headerRender: false,
            },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [location.pathname]);
  
  // Handle page change logic (previously in onPageChange)
  useEffect(() => {
    if (!initialState) return;
    
    // Add detailed debugging of route changes
    console.debug('[DEBUG] Current path:', location.pathname);
    console.debug('[DEBUG] Query params:', location.search);
    console.debug('[DEBUG] User state:', initialState.user ? 'Logged in' : 'Not logged in');
    
    if (location.pathname === '/init' && !initialState.user) {
      return;
    }
    
    if (!initialState.user && ![loginPath, '/user/restore'].includes(location.pathname)) {
      navigate(loginPath);
    }
    
    if (location.pathname === loginPath && Boolean(initialState.user)) {
      navigate('/');
    }
  }, [location.pathname, location.search, initialState]);
  
  // Handle window resize
  useEffect(() => {
    const handleSizeChange = () => {
      const headerPoint = 768;
      const show = window.innerWidth > headerPoint ? false : true;
      if (show) {
        const el = document.querySelector('header.ant-layout-header');
        if (el) {
          el.style.display = 'block';
        }
      } else {
        const el = document.querySelector('header.ant-layout-header');
        if (el) {
          el.style.display = 'none';
        }
      }
    };

    window.addEventListener('resize', handleSizeChange);
    handleSizeChange();
    
    return () => {
      window.removeEventListener('resize', handleSizeChange);
    };
  }, []);

  // 只有在初始化数据加载完成后才渲染子组件，否则显示加载中
  const appContextValue = useMemo(
    () => ({
      initialState,
      setInitialState,
      fetchInitData,
      loading,
    }),
    [initialState, loading]
  );

  if (loading) {
    return <PageLoading />;
  }

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
}; 