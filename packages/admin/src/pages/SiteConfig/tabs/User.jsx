import { updateUser } from '@/services/van-blog/api';
import { ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useModel, history } from 'umi';
export default function () {
  const { initialState, setInitialState } = useModel('@@initialState');
  return (
    <ProCard>
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          return {
            name: initialState?.user?.name || '',
            password: initialState?.user?.password || '',
          };
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          await updateUser(data);
          window.localStorage.removeItem('token');
          setInitialState((s) => ({ ...s, user: undefined }));
          history.push('/');
          message.success('更新用户成功！请重新登录！');
        }}
      >
        <ProFormText
          width="lg"
          name="name"
          required={true}
          rules={[{ required: true, message: '这是必填项' }]}
          label="登录用户名"
          placeholder={'请输入登录用户名'}
        />
        <ProFormText.Password
          width="lg"
          name="password"
          required={true}
          rules={[{ required: true, message: '这是必填项' }]}
          label="登录密码"
          placeholder={'请输入登录密码'}
        />
      </ProForm>
    </ProCard>
  );
}
