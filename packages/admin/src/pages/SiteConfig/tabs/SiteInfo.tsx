import SiteInfoForm from '@/components/SiteInfoForm';
import { getSiteInfo, updateSiteInfo } from '@/services/van-blog/api';
import { useTab } from '@/services/van-blog/useTab';
import { ProForm } from '@ant-design/pro-components';
import { Card, message } from 'antd';
export default function () {
  const [tab, setTab] = useTab('basic', 'subTab');
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
    <Card tabList={tabList} onTabChange={setTab} activeTabKey={tab}>
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
          showLayout={tab == 'layout'}
          showOption={tab == 'more'}
          showRequire={tab == 'basic'}
        />
      </ProForm>
    </Card>
  );
}
