import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { createArticle, getTags } from '@/services/van-blog/api';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
export default function () {
  return (
    <ModalForm
      title="新建文章"
      trigger={
        <Button key="button" icon={<PlusOutlined />} type="primary">
          新建
        </Button>
      }
      width={450}
      autoFocusFirstInput
      submitTimeout={3000}
      onFinish={async (values) => {
        const washedValues = {};
        for (const [k, v] of Object.entries(values)) {
          washedValues[k.replace('C', '')] = v;
        }

        await createArticle(washedValues);
        actionRef?.current?.reload();
        return true;
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      // wrapperCol: { span: 14 },
    >
      <ProFormText
        width="md"
        required
        id="titleC"
        name="titleC"
        label="文章标题"
        placeholder="请输入标题"
        rules={[{ required: true, message: '这是必填项' }]}
      />
      <ProFormText
        width="md"
        id="topC"
        name="topC"
        label="置顶优先级"
        placeholder="留空或0表示不置顶，其余数字越大表示优先级越高"
      />
      <ProFormSelect
        mode="tags"
        tokenSeparators={[',']}
        width="md"
        name="tagsC"
        label="标签"
        placeholder="请选择或输入标签"
        request={async () => {
          const msg = await getTags();
          return msg?.data?.map((item) => ({ label: item, value: item })) || [];
        }}
      />
      <ProFormSelect
        width="md"
        required
        id="categoryC"
        name="categoryC"
        label="分类"
        placeholder="请选择分类"
        rules={[{ required: true, message: '这是必填项' }]}
        request={async () => {
          return initialState?.categories?.map((e) => {
            return {
              label: e,
              value: e,
            };
          });
        }}
      />
      <ProFormSelect
        width="md"
        name="privateC"
        id="privateC"
        label="是否加密"
        placeholder="是否加密"
        request={async () => {
          return [
            {
              label: '否',
              value: false,
            },
            {
              label: '是',
              value: true,
            },
          ];
        }}
      />
      <ProFormText.Password
        label="密码"
        width="md"
        id="passwordC"
        name="passwordC"
        placeholder="请输入密码"
        dependencies={['private']}
      />
      <ProFormSelect
        width="md"
        name="hiddenC"
        id="hiddenC"
        label="是否隐藏"
        placeholder="是否隐藏"
        request={async () => {
          return [
            {
              label: '否',
              value: false,
            },
            {
              label: '是',
              value: true,
            },
          ];
        }}
      />
    </ModalForm>
  );
}
