import SiteInfoForm from '@/components/SiteInfoForm';
import { getSiteInfo, updateSiteInfo } from '@/services/van-blog/api';
import { ProCard, ProForm } from '@ant-design/pro-components';
import { message } from 'antd';
import { useState } from 'react';
export default function () {
  return (
    <ProCard>
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
        <SiteInfoForm showOption={true} showRequire={true} />
      </ProForm>
    </ProCard>
  );
}
