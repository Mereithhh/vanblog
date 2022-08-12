import Footer from '@/components/Footer';
import { fetchInit } from '@/services/van-blog/api';
import ProCard from '@ant-design/pro-card';
import { ProFormInstance } from '@ant-design/pro-form';
import { message } from 'antd';
import { useHistory } from 'umi';
//@ts-ignore
import styles from './index.less';

import { ProFormText, StepsForm } from '@ant-design/pro-components';

import SiteInfoForm from '@/components/SiteInfoForm';
import { useRef } from 'react';

const InitPage = () => {
  const history = useHistory();
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const formRef1 = useRef<ProFormInstance>();
  const formRef2 = useRef<ProFormInstance>();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ProCard
          title={
            <div>
              <p style={{ fontSize: 20, marginBottom: 0 }}>欢迎使用 VanBlog 个人博客系统</p>
            </div>
          }
        >
          <StepsForm
            formMapRef={formMapRef}
            onFinish={async (values) => {
              const { name, password, ...siteInfo } = values;
              const newData = {
                user: {
                  username: name,
                  password,
                },
                siteInfo,
              };
              const res = await fetchInit(newData);
              if (res?.statusCode == 200 || res?.statusCode == 500) {
                message.success('初始化成功!');
                history.push('/user/login');
                return true;
              }
              return false;
            }}
          >
            <StepsForm.StepForm name="step1" title="配置用户">
              <ProFormText
                name="name"
                required={true}
                rules={[{ required: true, message: '这是必填项' }]}
                label="登录用户名"
                placeholder={'请输入登录用户名'}
              ></ProFormText>
              <ProFormText.Password
                name="password"
                required={true}
                rules={[{ required: true, message: '这是必填项' }]}
                label="登录密码"
                placeholder={'请输入登录密码'}
              ></ProFormText.Password>
            </StepsForm.StepForm>
            <StepsForm.StepForm name="step2" title={'基本配置'} formRef={formRef1}>
              <SiteInfoForm
                showRequire={true}
                showOption={false}
                showLayout={false}
                form={formRef1}
              />
            </StepsForm.StepForm>
            <StepsForm.StepForm name="step3" title={'额外配置'} formRef={formRef2}>
              <SiteInfoForm
                showRequire={false}
                showOption={true}
                showLayout={true}
                form={formRef2}
              />
            </StepsForm.StepForm>
          </StepsForm>
        </ProCard>
      </div>
      <Footer />
    </div>
  );
};
export default InitPage;
