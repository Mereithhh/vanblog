import { ProFormDatePicker, ProFormText } from '@ant-design/pro-components';

export default function (props: {
  showOption: boolean;
  showRequire: boolean;
  showLayout: boolean;
}) {
  return (
    <>
      {props.showRequire && (
        <>
          <ProFormText
            name="author"
            required
            label="作者名字"
            placeholder={'请输入作者名字'}
            rules={[{ required: true, message: '这是必填项' }]}
          ></ProFormText>
          <ProFormText
            name="authorDesc"
            required
            label="作者描述"
            placeholder={'请输入作者描述'}
            rules={[{ required: true, message: '这是必填项' }]}
          ></ProFormText>
          <ProFormText
            name="authorLogo"
            required
            label="作者 Logo"
            placeholder={'请输入作者 Logo Url'}
            rules={[{ required: true, message: '这是必填项' }]}
          ></ProFormText>
        </>
      )}
      {props.showOption && (
        <ProFormText
          name="authorLogoDark"
          label="作者 Logo（黑暗模式）"
          placeholder={'请输入黑暗模式作者 Logo Url，留空表示沿用上个'}
        ></ProFormText>
      )}
      {props.showRequire && (
        <ProFormText
          name="siteLogo"
          required
          label="网站 Logo"
          placeholder={'请输入网站 Logo Url'}
          rules={[{ required: true, message: '这是必填项' }]}
        ></ProFormText>
      )}
      {props.showOption && (
        <ProFormText
          name="siteLogoDark"
          label="网站 Logo（黑暗模式）"
          placeholder={'请输入网站黑暗模式 Logo Url，留空表示沿用上个'}
        ></ProFormText>
      )}
      {props.showRequire && (
        <>
          <ProFormText
            name="favicon"
            required
            label="网站图标"
            placeholder={'请输入网站图标 Url'}
            rules={[{ required: true, message: '这是必填项' }]}
          ></ProFormText>
          <ProFormText
            name="siteName"
            required
            label="网站名"
            placeholder={'请输入网站名'}
            rules={[{ required: true, message: '这是必填项' }]}
          ></ProFormText>
          <ProFormText
            name="siteDesc"
            required
            label="网站描述"
            placeholder={'请输入网站描述'}
            rules={[{ required: true, message: '这是必填项' }]}
          ></ProFormText>
        </>
      )}
      {props.showOption && (
        <>
          <ProFormText
            name="payAliPay"
            label="支付宝图片 Url"
            placeholder={'请输入支付宝打赏图片 Url，留空不启用打赏'}
          ></ProFormText>{' '}
          <ProFormText
            name="payAliPayDark"
            label="支付宝图片 Url（黑暗模式）"
            placeholder={'请输入黑暗模式支付宝打赏图片 Url，留空沿用上个'}
          ></ProFormText>
          <ProFormText
            name="payWechat"
            label="微信图片 Url"
            placeholder={'请输入微信打赏图片 Url，留空不启用打赏'}
          ></ProFormText>
          <ProFormText
            name="payWechatDark"
            label="微信图片 Url（黑暗模式）"
            placeholder={'请输入黑暗模式微信打赏图片 Url，留空沿用上个'}
          ></ProFormText>
        </>
      )}
      {props.showRequire && (
        <ProFormText
          name="baseUrl"
          required
          label="网站 Url"
          placeholder={'请输入网站 Url'}
          rules={[{ required: true, message: '这是必填项' }]}
        ></ProFormText>
      )}
      {props.showOption && (
        <>
          <ProFormText
            name="beianNumber"
            label="备案号"
            placeholder={'请输入备案号，留空不显示备案信息'}
          ></ProFormText>
          <ProFormText
            name="beianUrl"
            label="备案网址"
            placeholder={'请输入备案网址，留空不显示备案信息'}
          ></ProFormText>
          <ProFormText
            name="gaAnalysisId"
            label="Google Analysis ID"
            placeholder={'请输入 Google Analysis ID，留空表示不启用'}
          ></ProFormText>
          <ProFormText
            name="baiduAnalysisId"
            label="Baidu 分析 ID"
            placeholder={'请输入 Baidu 分析 ID，留空表示不启用'}
          ></ProFormText>
          <ProFormText
            name="walineServerUrl"
            label="WaLine 服务端 Url"
            placeholder={'请输入 WaLine 服务端 Url，留空表示不启用'}
          ></ProFormText>
          <ProFormDatePicker name="since" width={'lg'} label="建站时间" />
        </>
      )}
    </>
  );
}
