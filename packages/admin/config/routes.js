export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { name: '登录', path: '/user/login', component: './user/Login' },
      { component: './404' },
    ],
  },
  { path: '/init', layout: false, component: './InitPage' },
  { path: '/welcome', name: '分析概览', icon: 'smile', component: './Welcome' },
  { name: '文章管理', icon: 'form', path: '/article', component: './Article' },
  {
    name: '图形编辑器',
    icon: 'form',
    path: '/editor',
    component: './Editor',
    hideInMenu: true,
  },
  { name: '草稿管理', icon: 'container', path: '/draft', component: './Draft' },
  {
    name: '文件管理',
    icon: 'container',
    path: '/static',
    hideInBreadcrumb: true,
    routes: [
      { name: '图片管理', icon: 'container', path: '/static/img', component: './Static/img' },
    ],
  },
  { name: '站点管理', icon: 'tool', path: '/site', component: './SiteConfig' },
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
