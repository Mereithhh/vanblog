import { getStaticSetting, updateStaticSetting } from '@/services/van-blog/api';
import { checkNoChinese } from '@/services/van-blog/checkString';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { useState } from 'react';
export default function (props: {}) {
  const [enableWaterMark, setEnableWaterMark] = useState<boolean>(false);
  return (
    <>
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const { data } = await getStaticSetting();
          setEnableWaterMark(data?.enableWaterMark || false);
          if (!data) {
            return {
              enableWaterMark: false,
              enableWebp: true,
            };
          }
          return data;
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({ title: '演示站禁止修改此配置！' });
            return;
          }
          for (const [k, v] of Object.entries(data)) {
            if (v == 'false') {
              data[k] = false;
            } else if (v == 'true') {
              data[k] = true;
            } else {
              data[k] = v;
            }
          }
          setEnableWaterMark(data?.enableWaterMark || false);
          if (data.enableWaterMark && !data.waterMarkText) {
            Modal.info({ title: '开启水印必须指定水印文字！' });
            return;
          }
          if (!checkNoChinese(data.waterMarkText)) {
            Modal.info({
              title:
                '目前水印文字不支持中文！因为用了纯 js 库节约资源，后面会加上自定义图片作为水印。',
            });
            return;
          }
          const toUpload = data;
          await updateStaticSetting(toUpload);
          message.success('更新成功！');
        }}
      >
        <ProFormSelect
          name="enableWebp"
          label="图片自动压缩"
          request={async () => {
            return [
              {
                label: '开启',
                value: true,
              },
              {
                label: '关闭',
                value: false,
              },
            ];
          }}
          rules={[{ required: true, message: '这是必填项' }]}
          required
          placeholder={'是否开启图片自动压缩'}
          tooltip="开启之后上传图片将压缩至 webp 格式以提高加载速度，无论哪种存储策略都生效。"
        />
        <ProFormSelect
          fieldProps={{
            onChange: (target) => {
              setEnableWaterMark(target);
            },
          }}
          name="enableWaterMark"
          required
          label="水印"
          placeholder={'是否开启水印'}
          request={async () => {
            return [
              {
                label: '开启',
                value: true,
              },
              {
                label: '关闭',
                value: false,
              },
            ];
          }}
          tooltip={
            '是否开启水印，开启之后上传图片将自动添加水印，无论哪种图床。宽高小于 128px 的图片可能会加不上水印。'
          }
          rules={[{ required: true, message: '这是必填项' }]}
        ></ProFormSelect>
        <ProFormText
          name="waterMarkText"
          label={'水印文字'}
          required
          tooltip={'此文字会作为水印加到图片右下角，目前不支持中文'}
          placeholder="请输入水印文字"
        />
      </ProForm>
    </>
  );
}
