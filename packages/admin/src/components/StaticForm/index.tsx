import { getStaticSetting, updateStaticSetting } from '@/services/van-blog/api';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { message } from 'antd';
export default function (props: {}) {
  return (
    <>
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const { data } = await getStaticSetting();
          if (!data) {
            return {
              storageType: 'local',
            };
          }
          return data;
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          console.log(data);
          await updateStaticSetting(data);
          message.success('更新成功！');
        }}
      >
        <ProFormSelect
          name="storageType"
          required
          label="存储策略"
          placeholder={'请选择存储策略'}
          valueEnum={{
            local: '本地存储',
            picGo: 'OSS 存储',
          }}
          tooltip={'本地存储之前请确保映射了永久目录以防丢失哦'}
          rules={[{ required: true, message: '这是必填项' }]}
        ></ProFormSelect>
      </ProForm>
    </>
  );
}
