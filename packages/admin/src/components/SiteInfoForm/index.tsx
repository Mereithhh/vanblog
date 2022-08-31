import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import UrlFormItem from '../UrlFormItem';

export default function (props: {
  showOption: boolean;
  showRequire: boolean;
  showLayout: boolean;
  form: any;
  isInit: boolean;
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
          <UrlFormItem
            isInit={props.isInit}
            formRef={props.form}
            name="authorLogo"
            required
            label="作者 Logo"
            placeholder={'请输入作者 Logo Url'}
          />
        </>
      )}
      {props.showOption && (
        <UrlFormItem
          required={false}
          formRef={props.form}
          name="authorLogoDark"
          label="作者 Logo（黑暗模式）"
          placeholder={'请输入黑暗模式作者 Logo Url，留空表示沿用上个'}
          isInit={props.isInit}
        />
      )}
      {props.showOption && (
        <>
          <UrlFormItem
            formRef={props.form}
            name="siteLogo"
            required={false}
            label="网站 Logo"
            placeholder={'请输入网站 Logo Url'}
            isInit={props.isInit}
          />
          <UrlFormItem
            formRef={props.form}
            name="siteLogoDark"
            label="网站 Logo（黑暗模式）"
            required={false}
            placeholder={'请输入网站黑暗模式 Logo Url，留空表示沿用上个'}
            isInit={props.isInit}
          />
        </>
      )}
      {props.showRequire && (
        <>
          <UrlFormItem
            isInit={props.isInit}
            formRef={props.form}
            name="favicon"
            required
            label="网站图标(favicon)"
            placeholder={'请输入网站图标 Url'}
            isFavicon={true}
          />
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
          <UrlFormItem
            formRef={props.form}
            isInit={props.isInit}
            name="payAliPay"
            label="支付宝图片 Url"
            placeholder={'请输入支付宝打赏图片 Url，留空不启用打赏'}
            required={false}
          />
          <UrlFormItem
            formRef={props.form}
            isInit={props.isInit}
            name="payAliPayDark"
            label="支付宝图片 Url（黑暗模式）"
            placeholder={'请输入黑暗模式支付宝打赏图片 Url，留空沿用上个'}
            required={false}
          />
          <UrlFormItem
            formRef={props.form}
            isInit={props.isInit}
            name="payWechat"
            label="微信图片 Url"
            placeholder={'请输入微信打赏图片 Url，留空不启用打赏'}
            required={false}
          />
          <UrlFormItem
            formRef={props.form}
            isInit={props.isInit}
            name="payWechatDark"
            label="微信图片 Url（黑暗模式）"
            placeholder={'请输入黑暗模式微信打赏图片 Url，留空沿用上个'}
            required={false}
          />
        </>
      )}
      {props.showRequire && (
        <ProFormText
          name="baseUrl"
          rules={[{ required: true, message: '这是必填项' }]}
          label="网站 Url"
          placeholder={'请输入网站 Url'}
          required={true}
        />
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
          <ProFormSelect
            name={'enableComment'}
            label="是否开启评论系统"
            placeholder={'开启'}
            valueEnum={{
              true: '开启',
              false: '关闭',
            }}
            tooltip={'默认开启'}
          ></ProFormSelect>
          <ProFormDatePicker name="since" width={'lg'} label="建站时间" />
        </>
      )}
      {/* 布局选项 */}
      {props.showLayout && (
        <>
          <ProFormSelect
            name={'showSubMenu'}
            label="显示分类导航栏"
            placeholder={'隐藏'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认隐藏，如果显示的是网站名，开启此项可能会对不齐。'}
          ></ProFormSelect>

          <ProFormDigit
            name={'subMenuOffset'}
            label="分类导航栏左侧偏移（px）"
            dependencies={['showSubMenu']}
            placeholder={'0'}
            fieldProps={{ precision: 0 }}
            min={0}
            max={200}
            tooltip={'导航栏显示的是网站名的时候，设置正确偏移以对其分类第一个字。'}
          ></ProFormDigit>
          <ProFormSelect
            name={'headerLeftContent'}
            label="导航栏左侧显示内容"
            valueEnum={{
              siteLogo: '网站logo',
              siteName: '网站名',
            }}
            placeholder="网站名"
            tooltip={'显示网站logo的前提是已设置正确的网站logo哦。默认显示网站名'}
          ></ProFormSelect>
          <ProFormSelect
            name={'showAdminButton'}
            label="后台按钮是否显示"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后导航栏会隐藏后台按钮'}
          ></ProFormSelect>
          <ProFormSelect
            name={'showFriends'}
            label="是否显示友情链接"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后导航栏会隐藏友情链接'}
          ></ProFormSelect>
          <ProFormSelect
            name={'showDonateInfo'}
            label="是否显示捐赠信息"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后关于页面会隐藏捐赠信息'}
          ></ProFormSelect>
          <ProFormSelect
            name={'showDonateInAbout'}
            label="关于页面是否显示打赏按钮"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后关于页面会隐藏打赏按钮'}
          ></ProFormSelect>
          <ProFormSelect
            name={'defaultTheme'}
            label="前台默认主题模式"
            placeholder={'自动模式'}
            valueEnum={{
              auto: '自动模式',
              dark: '暗色模式',
              light: '亮色模式',
            }}
            tooltip={'设置后第一次进入前台的用户将以此作为默认主题模式'}
          ></ProFormSelect>
        </>
      )}
    </>
  );
}
