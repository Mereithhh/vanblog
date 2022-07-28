import Footer from '@/components/Footer';
import InitForm from '@/components/InitForm';
import { fetchInit } from '@/services/van-blog/api';
import ProCard from '@ant-design/pro-card';
import ProForm from '@ant-design/pro-form';
import { message } from 'antd';
import { useHistory } from 'umi';
import styles from './index.less';

const InitPage = () => {
  const history = useHistory();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ProCard title="初始化 VanBlog 系统...">
          <ProForm
            onFinish={async (data) => {
              const { username, password, ...siteInfo } = data;
              const newData = {
                user: {
                  username,
                  password,
                },
                siteInfo,
              };
              const res = await fetchInit(newData);
              if (res?.statusCode == 200 || res?.statusCode == 500) {
                message.success('初始化成功!');
                history.push('/user/login');
              }
              console.log(newData);
            }}
          >
            <InitForm requireUser={true} />
          </ProForm>
        </ProCard>
      </div>
      <Footer />
    </div>
  );
};
export default InitPage;
