import { getLoginConfig, updateLoginConfig } from '@/services/van-blog/api';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Alert, Card, message, Modal } from 'antd';
export default function (props) {
  return (
    <Card title="登录安全策略">
      <Alert
        type="warning"
        message="这是一个实验性功能，目前还不稳定！暂时先不可配置，稳定后开放。"
        style={{ marginBottom: 8 }}
      />
      <ProForm
        grid={true}
        layout={'horizontal'}
        request={async (params) => {
          const { data } = await getLoginConfig();
          return data || { enableMaxLoginRetry: false };
        }}
        disabled={true}
        syncToInitialValues={true}
        onFinish={async (data) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({ title: '演示站禁止修改登录安全策略！' });
            return;
          }
          await updateLoginConfig(data);
          message.success('更新成功！');
        }}
      >
        <ProFormSelect
          name={'enableMaxLoginRetry'}
          label="开启最大登录失败次数限制"
          fieldProps={{
            options: [
              {
                label: '开启',
                value: true,
              },
              {
                label: '关闭',
                value: false,
              },
            ],
          }}
          placeholder="关闭"
          tooltip={'默认关闭，开启后同一 ip 登录失败次数过多后需等一分钟后才能再次登录'}
        ></ProFormSelect>
      </ProForm>
    </Card>
  );
}
