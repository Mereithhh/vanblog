import { ProFormDatePicker, ProFormText } from '@ant-design/pro-components';
import SiteInfoForm from '../SiteInfoForm';

export default function () {
  return (
    <>
      <ProFormText
        width="lg"
        name="name"
        required={true}
        rules={[{ required: true, message: '这是必填项' }]}
        label="登录用户名"
        placeholder={'请输入登录用户名'}
      ></ProFormText>
      <ProFormText.Password
        width="lg"
        name="password"
        required={true}
        rules={[{ required: true, message: '这是必填项' }]}
        label="登录密码"
        placeholder={'请输入登录密码'}
      ></ProFormText.Password>
      <SiteInfoForm />
    </>
  );
}
