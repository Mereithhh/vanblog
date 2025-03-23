export default [
  {
    path: '/welcome',
    name: '分析概览',
    icon: 'SmileOutlined',
    access: 'isAdmin',
  },
  { 
    path: '/article', 
    name: '文章管理', 
    icon: 'FormOutlined',
  },
  {
    path: '/editor',
    name: '图形编辑器',
    icon: 'FormOutlined',
    hideInMenu: true,
  },
  {
    path: '/code',
    name: '代码编辑器',
    icon: 'ToolOutlined',
    hideInMenu: true,
    access: 'isAdmin',
  },
  {
    path: '/about',
    name: '关于',
    icon: 'FormOutlined',
    hideInMenu: true,
  },
  { 
    path: '/draft', 
    name: '草稿管理', 
    icon: 'ContainerOutlined',
  },
  {
    path: '/static/img',
    name: '图片管理',
    icon: 'PictureOutlined',
    hideInBreadcrumb: true,
  },
  {
    path: '/site',
    name: '站点管理',
    icon: 'ToolOutlined',
    hideInBreadcrumb: true,
    access: 'isAdmin',
    routes: [
      { 
        path: '/site/data', 
        name: '数据管理',
      },
      { 
        path: '/site/comment', 
        name: '评论管理',
      },
      { 
        path: '/site/pipeline', 
        name: '流水线',
      },
      { 
        path: '/site/setting', 
        name: '系统设置',
      },
      {
        path: '/site/customPage',
        name: '自定义页面',
      },
      { 
        path: '/site/log', 
        name: '日志管理',
      },
    ],
  },
]; 