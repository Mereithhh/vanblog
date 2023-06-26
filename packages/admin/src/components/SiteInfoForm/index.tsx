import {
  ProFormDateTimePicker,
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
          />
          <ProFormText
            name="authorDesc"
            required
            label="作者描述"
            placeholder={'请输入作者描述'}
            rules={[{ required: true, message: '这是必填项' }]}
          />
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
          />
          <ProFormText
            name="siteDesc"
            required
            label="网站描述"
            placeholder={'请输入网站描述'}
            rules={[{ required: true, message: '这是必填项' }]}
          />
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
          placeholder={'请输入包含访问协议的完整 URL'}
          tooltip={'请输入包含访问协议的完整 URL，此 URL 会被用来生成前后台/RSS的相关数据。'}
          required={true}
        />
      )}
      {props.showOption && (
        <>
          <ProFormText name="copyrightAggreement" label="版权协议" placeholder={'版权协议'} />
          <ProFormText
            name="beianNumber"
            label="ICP 备案号"
            placeholder={'请输入备案号，留空不显示备案信息'}
          />
          <ProFormText
            name="beianUrl"
            label="ICP 备案网址"
            placeholder={'请输入备案网址，留空不显示备案信息'}
          />
          <ProFormText
            name="gaBeianNumber"
            label="公安备案号"
            placeholder={'请输入公安备案号，留空不显示公安备案信息'}
          />
          <ProFormText
            name="gaBeianUrl"
            label="公安备案网址"
            placeholder={'请输入公安备案号点击后跳转的网址，留空则不跳转'}
          />
          <UrlFormItem
            formRef={props.form}
            isInit={props.isInit}
            name="gaBeianLogoUrl"
            label="公安备案 Logo 地址"
            placeholder={'请输入公安备案的 logo 的 url，留空不显示公安备案 logo'}
            required={false}
          />
          <ProFormText
            name="gaAnalysisId"
            label="Google Analysis ID"
            placeholder={'请输入 Google Analysis ID，留空表示不启用'}
          />
          <ProFormText
            name="baiduAnalysisId"
            label="Baidu 分析 ID"
            placeholder={'请输入 Baidu 分析 ID，留空表示不启用'}
          />
          <ProFormSelect
            name={'enableComment'}
            label="是否开启评论系统"
            placeholder={'开启'}
            valueEnum={{
              true: '开启',
              false: '关闭',
            }}
            tooltip={'默认开启'}
          />
          <ProFormDateTimePicker
            name="since"
            width={'lg'}
            label="建站时间"
            placeholder="不填默认为此刻"
          />
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
            tooltip={'默认隐藏，开启后将在主导航栏下方显示分类子导航栏（其实就是双层导航栏）。'}
          />

          <ProFormDigit
            name={'subMenuOffset'}
            label="分类导航栏左侧偏移（px）"
            dependencies={['showSubMenu']}
            placeholder={'0'}
            fieldProps={{ precision: 0 }}
            min={0}
            max={200}
            tooltip={'导航栏显示的是网站名的时候，设置正确偏移以对其分类第一个字。'}
          />
          <ProFormSelect
            name={'headerLeftContent'}
            label="导航栏左侧显示内容"
            valueEnum={{
              siteLogo: '网站logo',
              siteName: '网站名',
            }}
            placeholder="网站名"
            tooltip={'显示网站 logo 的前提是已设置正确的网站 logo 哦。默认显示网站名'}
          />
          <ProFormSelect
            name={'showAdminButton'}
            label="后台按钮是否显示"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后前台会隐藏后台按钮'}
          />
          <ProFormSelect
            name={'showDonateInfo'}
            label="是否显示捐赠信息"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后关于页面会隐藏捐赠信息'}
          />

          <ProFormSelect
            name={'showCopyRight'}
            label="是否显示版权声明"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后文章页面将不显示版权声明'}
          />
          <ProFormSelect
            name={'showDonateButton'}
            label="是否显示打赏按钮"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示（前提是设置了支付宝和微信支付图片），关闭后所有位置将不显示打赏按钮'}
          />
          <ProFormSelect
            name={'showDonateInAbout'}
            label="关于页面是否显示打赏按钮"
            placeholder={'隐藏'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认隐藏，开启后关于页面会显示打赏按钮'}
          />
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
          />
          <ProFormSelect
            name={'allowOpenHiddenPostByUrl'}
            label="是否允许通过 URL 打开隐藏的文章"
            placeholder={'不允许'}
            valueEnum={{
              true: '允许',
              false: '不允许',
            }}
            tooltip={'默认不允许，开启后可通过 URL 打开隐藏文章。'}
          />
          <ProFormSelect
            name={'enableCustomizing'}
            label="是否开启客制化功能"
            placeholder={'开启'}
            valueEnum={{
              true: '开启',
              false: '关闭',
            }}
            tooltip={'默认开启，关闭后即使通过客制化面板，自定义了 CSS、Script、HTML 也不会生效。'}
          />
          <ProFormSelect
            name={'showRSS'}
            label="是否显示 RSS 按钮"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后所有位置会隐藏 RSS 按钮。'}
          />
          <ProFormSelect
            name={'openArticleLinksInNewWindow'}
            label="前台点击链接时的默认行为"
            placeholder={'在当前页面跳转'}
            valueEnum={{
              true: '打开新标签页',
              false: '在当前页面跳转',
            }}
            tooltip={
              '默认在当前页面跳转，会影响除了导航栏之外的大部分链接。注意如果打开新标签的话，就不会那么丝滑了哦（当前页面跳转的话是无感切换的）'
            }
          />
          <ProFormSelect
            name={'showExpirationReminder'}
            label="是否显示文章内容过时提醒"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认显示，关闭后文章页面不会显示内容过期提醒。'}
          />
          <ProFormSelect
            name={'showEditButton'}
            label="是否在前台展示编辑按钮"
            placeholder={'显示'}
            valueEnum={{
              true: '显示',
              false: '隐藏',
            }}
            tooltip={'默认开启，关闭后登录后台时，前台将不再显示编辑按钮。'}
          />
        </>
      )}
    </>
  );
}
