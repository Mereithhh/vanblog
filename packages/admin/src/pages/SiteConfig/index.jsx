import { PageContainer } from '@ant-design/pro-layout';
import { useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import Backup from './tabs/Backup';
import Category from './tabs/Category';
import Donate from './tabs/Donate';
import Link from './tabs/Link';
import Menu from './tabs/Menu';
import SiteInfo from './tabs/SiteInfo';
import Social from './tabs/Social';
export default function () {
  const tabMap = {
    category: <Category />,
    siteInfo: <SiteInfo />,
    donateInfo: <Donate />,
    links: <Link />,
    socials: <Social />,
    io: <Backup></Backup>,
    menuConfig: <Menu></Menu>,
  };
  const [currTabKey, setCurrTabKey] = useState('category');
  const { initialState, setInitialState } = useModel('@@initialState');
  const currTab = useMemo(() => {
    return history.location.query?.tab || 'category';
  }, [history]);
  useEffect(() => {
    setCurrTabKey(currTab);
  }, [currTab]);

  return (
    <PageContainer
      tabActiveKey={currTabKey}
      tabList={[
        {
          tab: '分类管理',
          key: 'category',
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
          key: 'io',
        },
      ]}
      onTabChange={(tab) => {
        setCurrTabKey(tab);
        history.push(`${history.location.pathname}?tab=${tab}`);
      }}
    >
      {tabMap[currTabKey] || tabMap['category']}
    </PageContainer>
  );
}
