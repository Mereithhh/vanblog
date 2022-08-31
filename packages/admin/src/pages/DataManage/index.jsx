import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import thinstyle from '../Welcome/index.less';
import Category from './tabs/Category';
import Donate from './tabs/Donate';
import Link from './tabs/Link';
import Menu from './tabs/Menu';
import Social from './tabs/Social';
import Tag from './tabs/Tag';
export default function () {
  const tabMap = {
    category: <Category />,
    tag: <Tag />,
    donateInfo: <Donate />,
    links: <Link />,
    socials: <Social />,
    menuConfig: <Menu />,
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
          tab: '标签管理',
          key: 'tag',
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
      ]}
      onTabChange={setTab}
    >
      {tabMap[tab]}
    </PageContainer>
  );
}
