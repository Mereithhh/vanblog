import { PageContainer } from '@ant-design/pro-layout';
import { Button, message } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';
import Category from './tabs/Category';
import SiteInfo from './tabs/SiteInfo';
export default function () {
  const tabMap = {
    category: <Category />,
    siteInfo: <SiteInfo />,
  };
  const [currTabKey, setCurrTabKey] = useState('category');
  const { initialState, setInitialState } = useModel('@@initialState');
  return (
    <PageContainer
      tabList={[
        {
          tab: '分类管理',
          key: 'category',
        },
        {
          tab: '站点配置',
          key: 'siteInfo',
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
      }}
    >
      {tabMap[currTabKey] || tabMap['category']}
    </PageContainer>
  );
}
