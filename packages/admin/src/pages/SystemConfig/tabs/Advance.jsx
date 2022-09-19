import { activeISR, getLoginConfig, updateLoginConfig } from '@/services/van-blog/api';
import { ProForm, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { Alert, Button, Card, message, Modal } from 'antd';
import { useState } from 'react';
export default function (props) {
  const [isrLoading, setIsrLoading] = useState(false);
  return (
    <>
      <Card title="登录安全策略">
        <Alert
          type="warning"
          message="开启最大登录失败次数限制目前还不稳定！暂时先不可配置，稳定后开放。"
          style={{ marginBottom: 8 }}
        />
        <ProForm
          grid={true}
          layout={'horizontal'}
          request={async (params) => {
            const { data } = await getLoginConfig();
            return data || { enableMaxLoginRetry: false };
          }}
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
            disabled={true}
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
          <ProFormDigit
            name={'expiresIn'}
            label="登录凭证(Token)有效期(秒)"
            placeholder={'默认为 7 天'}
            tooltip="默认为 7 天"
          />
        </ProForm>
      </Card>
      <Card title="手动触发 ISR" style={{ marginTop: 8 }}>
        <Alert
          type="info"
          message="通常来说你不需要这样做，但某些情况下你也可以手动触发增量渲染。这会让后端尝试重新验证/渲染已知所有路由（触发完成后需要一些时间生效）。"
          style={{ marginBottom: 8 }}
        />
        <Button
          type="primary"
          onClick={async () => {
            setIsrLoading(true);
            try {
              await activeISR();
              message.success('ISR 手动触发成功！');
            } catch (err) {
              message.error('ISR 触发失败！');
            }
            setIsrLoading(false);
          }}
          loading={isrLoading}
        >
          手动触发
        </Button>
      </Card>
    </>
  );
}
