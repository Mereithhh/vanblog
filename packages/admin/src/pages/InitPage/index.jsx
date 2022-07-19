import Footer from '@/components/Footer';
import { fetchInit } from '@/services/van-blog/api';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
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
            <ProFormText
              width="lg"
              name="username"
              required
              label="用户名"
              placeholder={'请输入用户名'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="password"
              required
              label="密码"
              placeholder={'请输入密码'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="author"
              required
              label="作者名字"
              placeholder={'请输入作者名字'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="authorDesc"
              required
              label="作者描述"
              placeholder={'请输入作者描述'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="authorLogo"
              required
              label="作者 Logo"
              placeholder={'请输入作者 Logo Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="siteLogo"
              required
              label="网站 Logo"
              placeholder={'请输入网站 Logo Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="favicon"
              required
              label="图标"
              placeholder={'请输入网站图标 Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="siteName"
              required
              label="网站名"
              placeholder={'请输入网站名'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="siteDesc"
              required
              label="网站描述"
              placeholder={'请输入网站描述'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="beianNumber"
              required
              label="备案号"
              placeholder={'请输入备案号'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="beianUrl"
              required
              label="备案网址"
              placeholder={'请输入备案网址'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="payAliPay"
              required
              label="支付宝图片 Url"
              placeholder={'请输入支付宝打赏图片 Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="payWechat"
              required
              label="微信图片 Url"
              placeholder={'请输入微信打赏图片 Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="baseUrl"
              required
              label="网站 Url"
              placeholder={'请输入网站 Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="walineServerUrl"
              required
              label="WaLine 服务端 Url"
              placeholder={'请输入 WaLine 服务端 Url'}
              rules={[{ required: true, message: '这是必填项' }]}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="gaAnalysisId"
              label="Google Analysis ID"
              placeholder={'请输入 Google Analysis ID'}
            ></ProFormText>
            <ProFormText
              width="lg"
              name="baiduAnalysisId"
              label="Baidu 分析 ID"
              placeholder={'请输入 Baidu 分析 ID'}
            ></ProFormText>
            <ProFormDatePicker
              required
              rules={[{ required: true, message: '这是必填项' }]}
              width="lg"
              name="since"
              label="起始时间日期"
            />
          </ProForm>
        </ProCard>
      </div>
      <Footer />
    </div>
  );
};
export default InitPage;
