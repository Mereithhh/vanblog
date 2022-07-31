import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import Backup from './tabs/Backup';
import Category from './tabs/Category';
import Donate from './tabs/Donate';
import Link from './tabs/Link';
import Menu from './tabs/Menu';
import SiteInfo from './tabs/SiteInfo';
import Social from './tabs/Social';
import User from './tabs/User';
export default function () {
  const tabMap = {
    category: <Category />,
    siteInfo: <SiteInfo />,
    donateInfo: <Donate />,
    links: <Link />,
    socials: <Social />,
    backup: <Backup />,
    menuConfig: <Menu />,
    user: <User />,
  };
  const [tab, setTab] = useTab('category', 'tab');

  return (
    <PageContainer
      tabActiveKey={tab}
      tabList={[
        {
          tab: '分类管理',
          key: 'category',
        },
        {
          tab: '用户设置',
          key: 'user',
        },
        {
          tab: '站点配置',
          key: 'siteInfo',
        },
        {
          tab: '导航配置',
          key: 'menuConfig',
        },
        {
          tab: '捐赠管理',
          key: 'donateInfo',
        },
        {
          tab: '友情链接',
          key: 'links',
        },
        {
          tab: '联系方式',
          key: 'socials',
        },
        {
          tab: '导入导出',
          key: 'backup',
        },
      ]}
      onTabChange={setTab}
    >
      {tabMap[tab]}
    </PageContainer>
  );
}
