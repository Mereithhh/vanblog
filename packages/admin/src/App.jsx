import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PageLoading } from '@ant-design/pro-layout';

import { AppProvider } from './context/AppContext';
import { getAccessToken } from './utils/auth';
import { useInitHistory } from './utils/umiCompat';
import BasicLayout from './layouts/BasicLayout';
import BlankLayout from './layouts/BlankLayout';

// Preload SVG resources
function preloadSvgIcons() {
  // Common SVG icons to preload
  const svgIcons = [
    `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z" /></svg>`,
    `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 22 11.8995C21.3608 16.3743 17.3659 19.7499 12.5 19.7499C6.97715 19.7499 2.5 15.2728 2.5 9.74994C2.5 6.07277 4.60504 2.88202 7.70435 1.5C7.25167 3.15141 7 4.92169 7 6.75C7 11.5941 10.4059 15 15.25 15C16.3954 15 17.4908 14.7958 18.4904 14.4241C15.2137 16.3482 10.6886 15.0249 10 7Z" /></svg>`,
  ];

  // Create hidden div to preload icons
  const preloadContainer = document.createElement('div');
  preloadContainer.style.position = 'absolute';
  preloadContainer.style.width = '0';
  preloadContainer.style.height = '0';
  preloadContainer.style.overflow = 'hidden';
  preloadContainer.style.visibility = 'hidden';
  document.body.appendChild(preloadContainer);

  // Create image elements for each SVG
  svgIcons.forEach(svg => {
    const encodedSvg = btoa(svg);
    const imgElement = document.createElement('img');
    imgElement.src = `data:image/svg+xml;base64,${encodedSvg}`;
    preloadContainer.appendChild(imgElement);
  });
}

// Lazy load all page components
const Login = lazy(() => import('./pages/user/Login'));
const Restore = lazy(() => import('./pages/user/Restore'));
const InitPage = lazy(() => import('./pages/InitPage'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Article = lazy(() => import('./pages/Article'));
const Editor = lazy(() => import('./pages/Editor'));
const Code = lazy(() => import('./pages/Code'));
const About = lazy(() => import('./pages/About'));
const Draft = lazy(() => import('./pages/Draft'));
const ImageManage = lazy(() => import('./pages/ImageManage'));
const DataManage = lazy(() => import('./pages/DataManage'));
const CommentManage = lazy(() => import('./pages/CommentManage'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const SystemConfig = lazy(() => import('./pages/SystemConfig'));
const CustomPage = lazy(() => import('./pages/CustomPage'));
const LogManage = lazy(() => import('./pages/LogManage'));
const NotFound = lazy(() => import('./pages/404'));

// Protected route component
const ProtectedRoute = ({ isAdmin, children }) => {
  const location = useLocation();
  const token = getAccessToken();
  
  console.log('[DEBUG] ProtectedRoute check:', { 
    path: location.pathname,
    hasToken: !!token,
    isAdminRoute: !!isAdmin
  });
  
  // 如果没有令牌，重定向到登录页面并保存当前路径
  if (!token) {
    console.log('[DEBUG] No token found, redirecting to login');
    return <Navigate to={`/user/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // 如果是管理员路由，但用户不是管理员
  if (isAdmin && !isAdmin()) {
    console.log('[DEBUG] Admin route access denied');
    return <Navigate to="/404" replace />;
  }
  
  // 通过验证，渲染子组件
  console.log('[DEBUG] Route access granted');
  return children;
};

// isAdmin check function
const isAdmin = () => {
  console.log('[DEBUG] Checking admin status');
  // Implement your admin check logic here
  // This would typically check the user type in the app context
  return true; // Simplified for now, you'll need to implement actual check
};

const App = () => {
  // Initialize history singleton for compatibility
  useInitHistory();
  
  // Preload SVG icons for theme button
  useEffect(() => {
    preloadSvgIcons();
  }, []);
  
  return (
    <AppProvider>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* User routes */}
          <Route element={<BlankLayout />}>
            <Route path="/user/login" element={<Login />} />
            <Route path="/user/restore" element={<Restore />} />
            <Route path="/init" element={<InitPage />} />
          </Route>
          
          {/* Main application routes with layout */}
          <Route element={<BasicLayout />}>
            <Route path="/welcome" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <Welcome />
              </ProtectedRoute>
            } />
            
            <Route path="/article" element={
              <ProtectedRoute>
                <Article />
              </ProtectedRoute>
            } />
            
            <Route path="/editor" element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } />
            
            <Route path="/code" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <Code />
              </ProtectedRoute>
            } />
            
            <Route path="/about" element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            } />
            
            <Route path="/draft" element={
              <ProtectedRoute>
                <Draft />
              </ProtectedRoute>
            } />
            
            <Route path="/static/img" element={
              <ProtectedRoute>
                <ImageManage />
              </ProtectedRoute>
            } />
            
            {/* Site management routes */}
            <Route path="/site/data" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <DataManage />
              </ProtectedRoute>
            } />
            
            <Route path="/site/comment" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <CommentManage />
              </ProtectedRoute>
            } />
            
            <Route path="/site/pipeline" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <Pipeline />
              </ProtectedRoute>
            } />
            
            <Route path="/site/setting" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <SystemConfig />
              </ProtectedRoute>
            } />
            
            <Route path="/site/customPage" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <CustomPage />
              </ProtectedRoute>
            } />
            
            <Route path="/site/log" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <LogManage />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to article */}
            <Route path="/" element={<Navigate to="/article" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </AppProvider>
  );
};

export default App; 