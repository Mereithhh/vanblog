import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './global.less';

// Set moment locale
moment.locale('zh-cn');

// Base path for admin routes
const basename = '/admin';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter basename={basename}>
    <ConfigProvider locale={zhCN}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ConfigProvider>
  </BrowserRouter>
); 