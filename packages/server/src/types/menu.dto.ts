export interface MenuItem {
  id: number;
  name: string;
  value: string;
  level: number;
  children?: MenuItem;
}
export const defaultMenu: MenuItem[] = [
  {
    id: 0,
    name: '首页',
    value: '/',
    level: 0,
  },
  {
    id: 1,
    name: '标签',
    value: '/tag',
    level: 0,
  },
  {
    id: 2,
    name: '分类',
    value: '/category',
    level: 0,
  },
  {
    id: 3,
    name: '时间线',
    value: '/timeline',
    level: 0,
  },
  {
    id: 4,
    name: '友链',
    value: '/link',
    level: 0,
  },
  {
    id: 5,
    name: '关于',
    value: '/about',
    level: 0,
  },
];
