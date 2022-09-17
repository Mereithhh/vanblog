import { getWalineConfig, updateWalineConfig } from '@/services/van-blog/api';
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
              forceLoginComment: false,
            };
          }
          return { ...data };
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({ title: '演示站禁止修改 waline 配置！' });
            return;
          }
          if (data.otherConfig) {
            try {
              JSON.parse(data.otherConfig);
            } catch (err) {
              Modal.info({ title: '自定义环境变量不是合法 JSON 格式！' });
              return;
            }
          }
          setEnableEmail(data?.['smtp.enabled'] || false);
          await updateWalineConfig(data);
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
                value: true as any,
              },
              {
                label: '关闭',
                value: false as any,
              },
            ],
          }}
          name="forceLoginComment"
          label="是否强制登录后评论"
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
          name="smtp.enabled"
          label="是否启用邮件通知"
          tooltip="启用后新评论会通知博主，被回复时会通知填写邮箱的被回复者"
          placeholder={'默认关闭'}
        ></ProFormSelect>
        {enableEmail && (
          <>
            <ProFormText
              name="smtp.host"
              label="SMTP 地址(host)"
              tooltip={'发送邮件使用的 smtp 地址'}
              placeholder="请输入发送邮件使用的 smtp 地址"
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormDigit
              name="smtp.port"
              label="SMTP 端口号"
              tooltip={'发送邮件使用的 smtp 端口号'}
              placeholder="请输入发送邮件使用的 smtp 端口号"
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText
              name="smtp.user"
              label="SMTP 用户名"
              tooltip={'发送邮件使用的 smtp 用户名'}
              placeholder="请输入发送邮件使用的 smtp 用户名"
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText.Password
              name="smtp.password"
              label="SMTP 密码"
              tooltip={'发送邮件使用的 smtp 密码'}
              placeholder="请输入发送邮件使用的 smtp 密码"
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText
              name="authorEmail"
              label="博主邮箱"
              tooltip={'用来通知博主有新评论'}
              placeholder="用来通知博主有新评论"
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormText
              name="sender.name"
              label="自定义发送邮件的发件人"
              tooltip={'自定义发送邮件的发件人'}
              placeholder="自定义发送邮件的发件人"
            />
            <ProFormText
              name="sender.email"
              label="自定义发送邮件的发件地址"
              tooltip={'自定义发送邮件的发件地址'}
              placeholder="自定义发送邮件的发件地址"
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
          tooltip={'json 格式的键值对，会传递个 waline 作为环境变量'}
          placeholder="json 格式的键值对，会传递个 waline 作为环境变量"
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
