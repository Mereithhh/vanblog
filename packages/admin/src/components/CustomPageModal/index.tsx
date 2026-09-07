import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Alert, Modal } from 'antd';

import { createCustomPage, updateCustomPage } from '@/services/van-blog/api';

export default ({
  onFinish,
  trigger,
  initialValues,
}: {
  onFinish: () => void;
  // FIXME: Add types
  trigger: any;
  // FIXME: Add types
  initialValues?: any;
}) => (
  <ModalForm
    title={initialValues ? '修改自定义页面' : '新建自定义页面'}
    trigger={trigger}
    width={520}
    autoFocusFirstInput
    submitTimeout={3000}
    initialValues={initialValues}
    key={initialValues?._id || 'create-custom-page'}
    modalProps={{ destroyOnClose: true }}
    onFinish={async (values) => {
      // FIXME: Should be refactor in to an env variable controlling "A demo state"
      if (location.hostname === 'blog-demo.mereith.com') {
        Modal.info({
          title: '演示站不可修改此项！',
        });
        return;
      }

      const path = values.path as string;

      if (path.substring(0, 1) != '/') {
        Modal.info({
          title: '路径必须以斜杠为开头！',
        });
        return false;
      }

      if (path === '/' || path.slice(1).includes('/')) {
        Modal.info({
          title: '路径必须是单级，例如 /uptime（对应 /c/uptime/），不要写成 /foo/bar',
        });
        return false;
      }

      if (initialValues) {
        // Keep _id so the server can update this row after path changes (#453).
        await updateCustomPage({
          _id: initialValues._id,
          type: initialValues.type,
          ...values,
        });
      } else {
        await createCustomPage(values);
      }

      if (onFinish) {
        onFinish();
      }

      return true;
    }}
    layout="horizontal"
    labelCol={{ span: 6 }}
  >
    {!initialValues && (
      <>
        <Alert
          style={{ marginBottom: 8 }}
          type="info"
          message="创建后到列表里编辑内容或上传文件。多文件页面只托管静态 HTML/CSS/JS，入口必须是根目录的 index.html（路径 /uptime 对应 /c/uptime/）。带 /static/... 绝对路径的 React 打包产物通常打不开，请改相对路径或用反代。"
        />
        <ProFormSelect
          width="md"
          name="type"
          required
          tooltip="单文件：后台编辑一段 HTML。多文件：上传 HTML/CSS/JS 等静态文件；不支持 Node/PHP 后端。SPA 请用相对资源路径，并保证根目录有 index.html。"
          label="类型"
          placeholder="请选择类型"
          rules={[{ required: true, message: '这是必填项' }]}
          initialValue={'folder'}
          request={async () => {
            return [
              { label: '单文件页面', value: 'file' },
              { label: '多文件页面', value: 'folder' },
            ];
          }}
        />
      </>
    )}
    <ProFormText
      width="md"
      required
      id="name"
      name="name"
      label="名称"
      placeholder="请输入名称"
      tooltip="自定义页面的名称"
      rules={[{ required: true, message: '这是必填项' }]}
    />
    <ProFormText
      disabled={initialValues && initialValues.type == 'folder'}
      width="md"
      required
      id="path"
      name="path"
      label="路径"
      placeholder="例如 /uptime"
      tooltip="必须以 / 开头，且只能有一级，例如 /uptime。实际地址是 /c + 路径，即 /c/uptime/。多文件页面会读取该目录下的 index.html。"
      rules={[{ required: true, message: '这是必填项' }]}
    />
  </ModalForm>
);
