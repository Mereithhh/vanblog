import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import thinstyle from '../Welcome/index.less';
import Backup from './tabs/Backup';
import Caddy from './tabs/Caddy';
import Category from './tabs/Category';
import Donate from './tabs/Donate';
import ImgTab from './tabs/ImgTab';
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
    img: <ImgTab />,
    caddy: <Caddy />,
  };
  const [tab, setTab] = useTab('category', 'tab');

  return (
    <PageContainer
      title={null}
      extra={null}
      header={{ title: null, extra: null, ghost: true }}
      className={thinstyle.thinheader}
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
          tab: '图床设置',
          key: 'img',
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
          tab: '备份恢复',
          key: 'backup',
        },
        {
          tab: 'HTTPS',
          key: 'caddy',
        },
      ]}
      onTabChange={setTab}
    >
      {tabMap[tab]}
    </PageContainer>
  );
}
