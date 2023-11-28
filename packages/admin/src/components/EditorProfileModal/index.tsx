import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
export default function (props: { setValue: any; value: any; trigger: any }) {
  const { setValue, value, trigger } = props;
  return (
    <ModalForm
      title="编辑器偏好设置"
      trigger={trigger}
      width={450}
      autoFocusFirstInput
      submitTimeout={3000}
      initialValues={value || {}}
      onFinish={async (vals) => {
        setValue({ ...value, ...vals });
        message.success('保存成功！');
        return true;
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      key="editForm"
    >
      <Alert
        type="info"
        message="此配置保存在浏览器存储中，切换设备需重新设置。"
        style={{ marginBottom: 8 }}
      ></Alert>

      <ProFormSelect
        width="md"
        required
        id="afterSave"
        name="afterSave"
        label="保存后行为"
        placeholder="请选择保存后行为，默认留在此页面"
        request={async () => {
          return [
            {
              label: '留在此页',
              value: 'stay',
            },
            {
              label: '返回之前页面',
              value: 'goBack',
            },
          ];
        }}
      />

      <ProFormSelect
        width="md"
        required
        id="useLocalCache"
        name="useLocalCache"
        label="本地缓存"
        tooltip="默认关闭，开启后将在本地缓存编辑器内容，当本地内容比服务器内容更新时间更近时，将使用本地内容展示在编辑器中。"
        placeholder="是否开启本地缓存"
        request={async () => {
          return [
            {
              label: '开启',
              value: 'open',
            },
            {
              label: '关闭',
              value: 'close',
            },
          ];
        }}
      />
    </ModalForm>
  );
}
