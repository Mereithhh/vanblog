import { getWalineConfig, updateWalineConfig } from '@/services/van-blog/api';
import { WALINE_EMAIL_FIELDS } from '@/utils/walineEmailFields';
import { parseWalineOtherConfigJson } from '@/utils/walineOtherConfig';
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { useState } from 'react';
export default function (props: {}) {
  const [enableEmail, setEnableEmail] = useState<any>(false);
  return (
    <>
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const { data } = await getWalineConfig();
          setEnableEmail(data?.['smtp.enabled'] || false);
          if (!data) {
            return {
              'smtp.enabled': false,
              forceLoginComment: 'false',
            };
          }
          return {
            ...data,
            forceLoginComment:
              data.forceLoginComment === true || data.forceLoginComment === 'true'
                ? 'true'
                : 'false',
          };
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({ title: '演示站禁止修改 waline 配置！' });
            return;
          }
          if (data.otherConfig) {
            try {
              parseWalineOtherConfigJson(data.otherConfig);
            } catch (err) {
              Modal.info({ title: '自定义环境变量不是合法 JSON 格式！' });
              return;
            }
          }
          setEnableEmail(data?.['smtp.enabled'] || false);
          await updateWalineConfig({
            ...data,
            forceLoginComment: data.forceLoginComment === true || data.forceLoginComment === 'true',
          });
          message.success('更新成功！');
        }}
      >
        <ProFormText
          name="webhook"
          label="评论后的 webhook 地址"
          tooltip={'收到评论后会向此地址发送一条携带评论信息的 HTTP 请求'}
          placeholder="评论后的 webhook 地址"
        />
        <ProFormSelect
          fieldProps={{
            options: [
              {
                label: '开启',
                value: 'true',
              },
              {
                label: '关闭',
                value: 'false',
              },
            ],
          }}
          name="forceLoginComment"
          label="是否强制登录后评论"
          tooltip="开启后访客必须登录 Waline 评论账号才能发表评论，匿名提交会被拒绝"
          placeholder={'是否强制登录后评论，默认关闭'}
        ></ProFormSelect>
        <ProFormSelect
          fieldProps={{
            onChange: (target) => {
              console.log(target);
              setEnableEmail(target);
            },
            options: [
              {
                label: '开启',
                value: true as any,
              },
              {
                label: '关闭',
                value: false as any,
              },
            ],
          }}
          name={WALINE_EMAIL_FIELDS.smtpEnabled.name}
          label={WALINE_EMAIL_FIELDS.smtpEnabled.label}
          tooltip={WALINE_EMAIL_FIELDS.smtpEnabled.tooltip}
          placeholder={WALINE_EMAIL_FIELDS.smtpEnabled.placeholder}
        ></ProFormSelect>
        {enableEmail && (
          <>
            <ProFormText
              name={WALINE_EMAIL_FIELDS.smtpHost.name}
              label={WALINE_EMAIL_FIELDS.smtpHost.label}
              tooltip={WALINE_EMAIL_FIELDS.smtpHost.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.smtpHost.placeholder}
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormDigit
              name={WALINE_EMAIL_FIELDS.smtpPort.name}
              label={WALINE_EMAIL_FIELDS.smtpPort.label}
              tooltip={WALINE_EMAIL_FIELDS.smtpPort.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.smtpPort.placeholder}
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText
              name={WALINE_EMAIL_FIELDS.smtpUser.name}
              label={WALINE_EMAIL_FIELDS.smtpUser.label}
              tooltip={WALINE_EMAIL_FIELDS.smtpUser.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.smtpUser.placeholder}
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText.Password
              name={WALINE_EMAIL_FIELDS.smtpPassword.name}
              label={WALINE_EMAIL_FIELDS.smtpPassword.label}
              tooltip={WALINE_EMAIL_FIELDS.smtpPassword.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.smtpPassword.placeholder}
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText
              name={WALINE_EMAIL_FIELDS.authorEmail.name}
              label={WALINE_EMAIL_FIELDS.authorEmail.label}
              tooltip={WALINE_EMAIL_FIELDS.authorEmail.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.authorEmail.placeholder}
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText
              name={WALINE_EMAIL_FIELDS.senderName.name}
              label={WALINE_EMAIL_FIELDS.senderName.label}
              tooltip={WALINE_EMAIL_FIELDS.senderName.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.senderName.placeholder}
            />
            <ProFormText
              name={WALINE_EMAIL_FIELDS.senderEmail.name}
              label={WALINE_EMAIL_FIELDS.senderEmail.label}
              tooltip={WALINE_EMAIL_FIELDS.senderEmail.tooltip}
              placeholder={WALINE_EMAIL_FIELDS.senderEmail.placeholder}
            />
          </>
        )}
        <ProFormTextArea
          name="otherConfig"
          label={
            <a
              href="https://waline.js.org/reference/server.html"
              target={'_blank'}
              rel="norefferrer"
            >
              自定义环境变量
            </a>
          }
          tooltip={
            'JSON 对象。大写键（如 IPQPS）会作为环境变量传给内嵌 Waline 服务端；客户端选项（如 imageUploader: false）会传给前台评论组件。布尔请用 false/true，不要加引号。'
          }
          placeholder={'{\n  "imageUploader": false,\n  "IPQPS": 60\n}'}
          fieldProps={{
            autoSize: {
              minRows: 10,
              maxRows: 30,
            },
          }}
        />
      </ProForm>
    </>
  );
}
