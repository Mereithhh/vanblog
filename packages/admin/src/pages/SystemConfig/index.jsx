import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import thinstyle from '../Welcome/index.less';
import About from './tabs/About';
import Backup from './tabs/Backup';
import Caddy from './tabs/Caddy';
import ImgTab from './tabs/ImgTab';
import SiteInfo from './tabs/SiteInfo';
import User from './tabs/User';
import WalineTab from './tabs/WalineTab';
export default function () {
  const tabMap = {
    siteInfo: <SiteInfo />,

    backup: <Backup />,
    about: <About />,
    user: <User />,
    img: <ImgTab />,
    waline: <WalineTab />,
    caddy: <Caddy />,
  };
  const [tab, setTab] = useTab('siteInfo', 'tab');

  return (
    <PageContainer
      title={null}
      extra={null}
      header={{ title: null, extra: null, ghost: true }}
      className={thinstyle.thinheader}
      tabActiveKey={tab}
      tabList={[
        {
          tab: '站点配置',
          key: 'siteInfo',
        },
        {
          tab: '用户设置',
          key: 'user',
        },
        {
          tab: '图床设置',
          key: 'img',
        },
        {
          tab: '评论设置',
          key: 'waline',
        },
        {
          tab: '备份恢复',
          key: 'backup',
        },
        {
          tab: 'HTTPS',
          key: 'caddy',
        },

        {
          tab: '关于',
          key: 'about',
        },
      ]}
      onTabChange={setTab}
    >
      {tabMap[tab]}
    </PageContainer>
  );
}
