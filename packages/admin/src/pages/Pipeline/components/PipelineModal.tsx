import { ModalForm, ProFormSelect, ProFormSwitch, ProFormText } from '@ant-design/pro-form';

import { getPipelineConfig, createPipeline, updatePipelineById } from '@/services/van-blog/api';
import { useEffect, useState } from 'react';
import { Form, message } from 'antd';
export default function ({
  mode,
  trigger,
  initialValues,
  onFinish,
}: {
  mode: 'edit' | 'create';
  trigger: any;
  initialValues?: any;
  onFinish: (vals: any) => void;
}) {
  const isEdit = mode === 'edit';
  const [des, setDes] = useState<string>('选择触发事件后讲展示详情');
  const [config, setConfig] = useState<any[]>([]);

  const check = (vals: any) => {
    const keys = Object.keys(vals);
    const mustKeys = ['name', 'description', 'eventName', 'enabled'];
    for (let i = 0; i < mustKeys.length; i++) {
      if (!keys.includes(mustKeys[i])) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (!initialValues || !initialValues.eventName) return;
    const targetDes = config.find((item) => item.eventName === initialValues.eventName)
      ?.eventDescription;
    setDes(targetDes || '选择触发事件后讲展示详情');
  }, [initialValues, config]);

  return (
    <ModalForm
      trigger={trigger}
      onFinish={async (vals) => {
        console.log(vals);
        if (!check(vals)) {
          message.error('请填写完整信息后提交！');
          return false;
        } else {
          if (mode == 'create') {
            await createPipeline(vals);
            message.success('提交成功！');
            onFinish(vals);
            return true;
          } else {
            await updatePipelineById(initialValues.id, vals);
            message.success('提交成功！');
            onFinish(vals);
            return true;
          }
        }
      }}
      layout="horizontal"
      labelCol={{ span: 4 }}
      initialValues={isEdit ? { ...initialValues } : { enabled: false }}
      autoFocusFirstInput
      title={isEdit ? '修改流水线' : '创建流水线'}
    >
      <ProFormText name="name" label="名称" required />
      <ProFormText name="description" label="描述" required tooltip="给自己写的，防止忘了" />
      <ProFormSelect
        name="eventName"
        label="触发事件"
        tooltip="选择后可以看到事件的说明"
        required
        request={async () => {
          const { data } = await getPipelineConfig();
          setConfig(data);
          return data?.map((item) => ({
            label: item.eventNameChinese,
            value: item.eventName,
          }));
        }}
        fieldProps={{
          onChange: (val) => {
            const targetDes = config.find((item) => item.eventName === val)?.eventDescription;
            setDes(targetDes || '选择触发事件后讲展示详情');
          },
        }}
      />
      <Form.Item label="事件说明">
        <div>{des}</div>
      </Form.Item>
      <ProFormSwitch name="enabled" label="状态" required />
      <ProFormSelect
        name="deps"
        label="依赖"
        tooltip="依赖是 nodejs 包名，可以输入多个，将通过 pnpm install <依赖名> 来依次安装"
        mode="tags"
        placeholder={'请输入依赖'}
      />
    </ModalForm>
  );
}
