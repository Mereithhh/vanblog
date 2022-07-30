import SiteInfoForm from '@/components/SiteInfoForm';
import { getSiteInfo, updateSiteInfo } from '@/services/van-blog/api';
import { ProCard, ProForm } from '@ant-design/pro-components';
import { Card, message } from 'antd';
import { useState } from 'react';
export default function () {
  const [activeTabKey, setActiveTabKey] = useState<string>('basic');
  const tabList = [
    {
      key: 'basic',
      tab: '基本设置',
    },
    {
      key: 'more',
      tab: '高级设置',
    },
    {
      key: 'layout',
      tab: '布局设置',
    },
  ];

  return (
    <Card
      tabList={tabList}
      onTabChange={(key) => {
        setActiveTabKey(key);
      }}
      activeTabKey={activeTabKey}
    >
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const { data } = await getSiteInfo();
          return data;
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          await updateSiteInfo(data);
          message.success('更新成功！');
        }}
      >
        <SiteInfoForm
          showLayout={activeTabKey == 'layout'}
          showOption={activeTabKey == 'more'}
          showRequire={activeTabKey == 'basic'}
        />
      </ProForm>
    </Card>
  );
}
