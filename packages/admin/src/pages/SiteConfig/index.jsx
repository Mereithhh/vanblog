import { PageContainer } from '@ant-design/pro-layout';
import { Button, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import Category from './tabs/Category';
import Donate from './tabs/Donate';
import Link from './tabs/Link';
import SiteInfo from './tabs/SiteInfo';
import Social from './tabs/Social';
export default function () {
  const tabMap = {
    category: <Category />,
    siteInfo: <SiteInfo />,
    donateInfo: <Donate />,
    links: <Link />,
    socials: <Social />,
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
      extra={[
        <Button
          key="1"
          type="primary"
          onClick={async () => {
            const allData = await initialState?.fetchInitData?.();
            await setInitialState((s) => ({ ...s, ...allData }));
            message.success('刷新成功 !');
          }}
        >
          刷新
        </Button>,
      ]}
      // footer={[
      //   <Button key="rest">重置</Button>,
      //   <Button key="submit" type="primary">
      //     提交
      //   </Button>,
      // ]}
      onTabChange={(tab) => {
        setCurrTabKey(tab);
        history.push(`${history.location.pathname}?tab=${tab}`);
      }}
    >
      {tabMap[currTabKey] || tabMap['category']}
    </PageContainer>
  );
}
