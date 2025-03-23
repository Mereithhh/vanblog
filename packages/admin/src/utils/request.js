import { message } from 'antd';
import { getAccessToken, removeAccessToken, checkRedirectCycle, resetRedirectCycle } from './auth';
import { history } from './umiCompat';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  233: '系统需要初始化。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// 开发模式检测
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// 登录路径常量
const LOGIN_PATH = '/user/login';
const INIT_PATH = '/init';

// Mock API responses for development mode
const mockResponses = {
  // '/api/admin/meta': {
  //   statusCode: 200,
  //   data: {
  //     latestVersion: '0.0.0-dev',
  //     updatedAt: new Date().toISOString(),
  //     baseUrl: 'http://localhost',
  //     version: 'dev',
  //     user: { username: 'dev-user', type: 'admin' }
  //   }
  // },
  // '/api/admin/auth/login': {
  //   statusCode: 200,
  //   data: {
  //     token: 'dev-token',
  //     user: { username: 'dev-user', type: 'admin' }
  //   }
  // }
};

// 错误处理函数
const errorHandler = (error, skipErrorHandler, url) => {
  const { response, data } = error;
  
  // 如果调用方要求跳过错误处理，直接返回响应
  if (skipErrorHandler) {
    return response;
  }
  
  // 获取当前路径以检查是否在特殊页面
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes(LOGIN_PATH) || 
                      currentPath.includes(INIT_PATH) ||
                      currentPath.includes('/user/restore');

  // 有响应对象时处理错误
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status } = response;
    
    // 处理233状态码 - 需要初始化
    if (status === 233) {
      console.log('[DEBUG] 233 Initialization needed');
      
      // 如果已经在初始化页面，不做任何操作
      if (currentPath.includes(INIT_PATH)) {
        console.log('[DEBUG] Already on init page, not redirecting');
        return {
          statusCode: 233,
          data: { needInit: true }
        };
      }
      
      // 如果不在初始化页面，重定向到初始化页面
      console.log('[DEBUG] Redirecting to init page');
      setTimeout(() => {
        window.location.replace('/admin/init');
      }, 100);
      
      return {
        statusCode: 233,
        data: { needInit: true }
      };
    }

    // 处理401认证错误
    if (status === 401) {
      console.log('[DEBUG] 401 Unauthorized response detected');
      console.log('[DEBUG] Current path:', currentPath);
      
      // 如果在认证相关页面，只显示错误消息，不跳转
      if (isAuthPage) {
        console.log('[DEBUG] Already on auth page, showing error only');
        if (currentPath.includes(LOGIN_PATH)) {
          message.error('用户名或密码错误');
        }
        return response;
      }
      
      // 检查是否处于重定向循环中
      if (checkRedirectCycle()) {
        console.error('[DEBUG] Breaking redirect cycle - halting redirects');
        message.error('检测到重定向循环，请刷新页面并重新登录', 10);
        // 移除token以清理无效状态
        removeAccessToken();
        return response;
      }
      
      // 正常401处理：清除token并跳转到登录页
      console.log('[DEBUG] Handling 401 by redirecting to login');
      message.error('登录已过期，请重新登录');
      removeAccessToken();
      
      // 使用直接URL替换，保留当前路径作为重定向参数
      setTimeout(() => {
        // 给页面一点时间显示消息
        const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
        window.location.replace(`/admin/user/login${redirectParam}`);
      }, 500);
      
      return response;
    } else {
      // 非401错误，重置循环检测
      resetRedirectCycle();
      
      // 如果在初始化页面，对于某些错误要特殊处理
      if (currentPath.includes(INIT_PATH)) {
        if (status === 400 && url && url.includes('/api/admin/init')) {
          // 如果是初始化API的错误，我们期望表单提交可能会出现问题
          console.log('[DEBUG] Init API error, letting component handle it');
          throw error; // 将错误传递给组件处理
        }
      }
      
      // 显示通用错误消息
      message.error(`请求错误 ${status}: ${errorText}`);
    }
  } else if (!response) {
    // 网络错误
    message.error('网络异常，无法连接服务器');
  }

  return response;
};

// 请求处理函数
const request = async (url, options = {}) => {
  const { skipErrorHandler = false, ...requestOptions } = options;
  
  // 开发模式下记录API请求信息
  if (isDevelopment) {
    console.info(`[DEV] API request:`, { url, options });
  }
  
  // 获取认证token并添加到请求头
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Token: token } : {}),
    ...options.headers,
  };
  
  // Debug token for troubleshooting auth issues
  if (token) {
    console.log('[DEBUG] Using auth token (first 15 chars):', token.substring(0, 15) + '...');
  } else {
    console.log('[DEBUG] No auth token available for request');
  }
  
  try {
    // 构建请求配置，处理body和data两种请求体参数形式
    const { body, data: requestData, ...restOptions } = options;
    const requestBody = body || requestData;
    const requestBodyStr = requestBody ? JSON.stringify(requestBody) : undefined;
    
    // 调试输出请求信息
    const debugRequestInfo = {
      ...restOptions,
      headers: {
        ...headers,
        Token: headers.Token ? '(token present)' : undefined,
      },
      body: requestBody ? '(data present)' : undefined
    };
    console.log('[DEBUG] Sending request to:', url, debugRequestInfo);
    
    // 发送请求
    const response = await fetch(url, {
      ...restOptions,
      headers,
      body: requestBodyStr,
    });


    // 处理204响应（无内容）
    if (response.status === 204) {
      return { success: true };
    }
    
    // 如果是233状态码，特殊处理
    if (response.status === 233) {
      return {
        statusCode: 233,
        data: { needInit: true }
      };
    }
    
    // 解析响应JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('[DEBUG] Failed to parse JSON response:', e);
      responseData = { message: 'Failed to parse server response' };
    }
    
    if (response.ok) {
      return responseData;
    }
    
    // 如果是401状态码，特殊处理
    if (response.status === 401) {
      const error = new Error(responseData.message || 'Unauthorized');
      error.response = response;
      error.data = responseData;
      error.status = 401;
      
      console.log('[DEBUG] 401 Unauthorized detected in response:', JSON.stringify(responseData));
      console.log('[DEBUG] Request URL:', url);
      console.log('[DEBUG] Request headers:', JSON.stringify({
        ...headers,
        Token: headers.Token ? `${headers.Token.substring(0, 15)}...` : undefined
      }));
      
      // 如果调用方要求跳过错误处理，直接抛出错误
      if (skipErrorHandler) {
        throw error;
      }
      
      return errorHandler(error, skipErrorHandler, url);
    }
    
    // 请求成功但业务逻辑错误
    const error = new Error(responseData.message || 'Request failed');
    error.response = response;
    error.data = responseData;
    throw error;
  } catch (error) {
    // 开发模式下记录更详细的错误信息
    if (isDevelopment) {
      console.warn(`[DEV] API error:`, error);
      console.warn(`[DEV] Details:`, { 
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.data,
        message: error.message
      });
    }
    
    if (!skipErrorHandler) {
      try {
        return errorHandler(error, skipErrorHandler, url);
      } catch (handlerError) {
        throw handlerError; // 如果错误处理器要求抛出错误，继续抛出
      }
    } else {
      throw error; // 如果调用方要求跳过错误处理，直接抛出错误
    }
  }
};

export default request; 