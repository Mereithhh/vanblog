import SiteInfoForm from '@/components/SiteInfoForm';
import { getSiteInfo, updateSiteInfo } from '@/services/van-blog/api';
import { useTab } from '@/services/van-blog/useTab';
import { ProForm } from '@ant-design/pro-components';
import { Card, message, Modal } from 'antd';
export default function () {
  const [tab, setTab] = useTab('basic', 'siteInfoTab');
  const [form] = ProForm.useForm();
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
        form={form}
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const { data } = await getSiteInfo();
          return data;
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({ title: '演示站禁止修改站点配置！' });
            return;
          }
          await updateSiteInfo(data);
          message.success('更新成功！');
        }}
      >
        <SiteInfoForm
          form={form}
          showLayout={tab == 'layout'}
          showOption={tab == 'more'}
          showRequire={tab == 'basic'}
          isInit={false}
        />
      </ProForm>
    </Card>
  );
}
