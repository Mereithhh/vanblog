import InitForm from '@/components/InitForm';
import { updateSiteInfo } from '@/services/van-blog/api';
import { ProCard, ProForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useModel } from 'umi';
export default function () {
  const { initialState, setInitialState } = useModel('@@initialState');
  return (
    <ProCard>
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const allData = await initialState?.fetchInitData?.();
          await setInitialState((s) => ({ ...s, ...allData }));
          // console.log(initialState);
          return initialState?.meta?.siteInfo || {};
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          await updateSiteInfo(data);
          const allData = await initialState?.fetchInitData?.();
          await setInitialState((s) => ({ ...s, ...allData }));
          message.success('更新成功!');
        }}
      >
        <InitForm></InitForm>
      </ProForm>
    </ProCard>
  );
}
