import { getStaticSetting, updateStaticSetting } from '@/services/van-blog/api';
import { ProForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import { useState } from 'react';
export default function (props: {}) {
  const [storageType, setStorageType] = useState<any>('local');
  return (
    <>
      <ProForm
        grid={true}
        layout={'horizontal'}
        labelCol={{ span: 6 }}
        request={async (params) => {
          const { data } = await getStaticSetting();
          setStorageType(data?.storageType || 'local');
          if (!data) {
            return {
              storageType: 'local',
            };
          }
          return { ...data, picgoConfig: JSON.stringify(data?.picgoConfig || '', null, 2) };
        }}
        syncToInitialValues={true}
        onFinish={async (data) => {
          setStorageType(data?.storageType || 'local');
          // 验证一下 json 格式
          let picgoConfig = null;
          let toUpload = data;
          if (data?.storageType == 'picgo' && data?.picgoConfig != '') {
            try {
              picgoConfig = JSON.parse(data?.picgoConfig);
              toUpload = { ...data, picgoConfig };
            } catch (err) {
              message.error('picgoConfig 格式错误，无法解析成 json');
            }
          }
          await updateStaticSetting(toUpload);
          message.success('更新成功！');
        }}
      >
        <ProFormSelect
          fieldProps={{
            onChange: (target) => {
              setStorageType(target);
            },
          }}
          name="storageType"
          required
          label="存储策略"
          placeholder={'请选择存储策略'}
          valueEnum={{
            local: '本地存储',
            picgo: 'OSS 图床',
          }}
          tooltip={'本地存储之前请确保映射了永久目录以防丢失哦'}
          rules={[{ required: true, message: '这是必填项' }]}
        ></ProFormSelect>
        {storageType == 'picgo' && (
          <>
            <ProFormTextArea
              name="picgoConfig"
              label={
                <a
                  href="https://picgo.github.io/PicGo-Core-Doc/zh/guide/config.html#%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90"
                  target={'_blank'}
                  rel="norefferrer"
                >
                  picgo 配置
                </a>
              }
              tooltip={'OSS 图床后端采用了 picgo'}
              placeholder="请输入 picgo 配置 (json)"
              fieldProps={{
                autoSize: {
                  minRows: 10,
                  maxRows: 30,
                },
              }}
            />
          </>
        )}
      </ProForm>
    </>
  );
}
