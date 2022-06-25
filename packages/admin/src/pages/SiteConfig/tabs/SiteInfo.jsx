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
        labelCol={{ span: 4 }}
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
        <ProFormDatePicker width="lg" name="since" label="起始时间日期" />
      </ProForm>
    </ProCard>
  );
}
