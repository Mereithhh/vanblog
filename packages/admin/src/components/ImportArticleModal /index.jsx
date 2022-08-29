import { createArticle, getAllCategories, getTags } from '@/services/van-blog/api';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message, Modal, Upload } from 'antd';
import fm from 'front-matter';
import { useState } from 'react';
export default function (props) {
  const { onFinish } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const handleImport = async (file) => {
    const name = file.name.split('.')[0];
    const type = file.name.split('.').pop();
    if (type != 'md') {
      Modal.error({ title: '目前仅支持导入 Markdown 文件！' });
      return;
    }
    const txt = await file.text();

    const { attributes, body } = fm(txt);
    const title = attributes?.title || name;
    const categoris = attributes?.categories || [];
    let allCategories = undefined;
    try {
      const { data } = await getAllCategories();
      allCategories = data;
    } catch (err) {
      message.error('获取当前系统分析信息失败！');
      return;
    }
    let category = undefined;
    if (categoris.length > 0 && allCategories?.length > 0) {
      for (const each of categoris) {
        if (allCategories.includes(each)) {
          category = each;
          break;
        }
      }
    }
    const categoryInFile = attributes?.category;
    if (categoryInFile && allCategories.includes(categoryInFile)) {
      category = categoryInFile;
    }
    const tags = attributes?.tags || [];
    if (attributes?.tag) {
      tags.push(attributes?.tag);
    }
    const top = attributes?.top || 0;
    let createdAt = new Date().toISOString();
    try {
      if (attributes?.date) {
        createdAt = new Date(attributes?.date).toISOString();
      }
    } catch (err) {}
    const password = attributes?.password || undefined;
    const privateAttr = password ? true : false;
    const hidden = attributes?.hidden || attributes?.hide || false;
    const vals = {
      title,
      top,
      tags,
      category,
      password,
      private: privateAttr,
      hidden,
      createdAt,
      content: body,
    };
    form.setFieldsValue(vals);
    console.log(vals);
    setVisible(true);
  };
  return (
    <>
      <Upload showUploadList={false} multiple={false} accept={'.md'} beforeUpload={handleImport}>
        <Button key="button" type="primary" title="从 markdown 文件导入">
          导入
        </Button>
      </Upload>
      <ModalForm
        form={form}
        title="导入文章"
        visible={visible}
        onVisibleChange={(v) => {
          setVisible(v);
        }}
        width={450}
        autoFocusFirstInput
        submitTimeout={3000}
        onFinish={async (values) => {
          const washedValues = {};
          for (const [k, v] of Object.entries(values)) {
            washedValues[k.replace('C', '')] = v;
          }

          await createArticle(washedValues);
          if (onFinish) {
            onFinish();
          }

          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        // wrapperCol: { span: 14 },
      >
        <ProFormText
          width="md"
          required
          id="title"
          name="title"
          label="文章标题"
          placeholder="请输入标题"
          rules={[{ required: true, message: '这是必填项' }]}
        />
        <ProFormText
          width="md"
          id="top"
          name="top"
          label="置顶优先级"
          placeholder="留空或0表示不置顶，其余数字越大表示优先级越高"
        />
        <ProFormSelect
          mode="tags"
          tokenSeparators={[',']}
          width="md"
          name="tags"
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
          id="category"
          name="category"
          label="分类"
          placeholder="请选择分类"
          rules={[{ required: true, message: '这是必填项' }]}
          request={async () => {
            const { data: categories } = await getAllCategories();
            return categories?.map((e) => {
              return {
                label: e,
                value: e,
              };
            });
          }}
        />
        <ProFormDateTimePicker name="createdAt" id="createdAt" label="创建时间" />
        <ProFormSelect
          width="md"
          name="private"
          id="private"
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
          id="password"
          name="password"
          autocomplete="new-password"
          placeholder="请输入密码"
          dependencies={['private']}
        />
        <ProFormSelect
          width="md"
          name="hidden"
          id="hidden"
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
        <ProFormTextArea
          name="content"
          label="内容"
          id="content"
          fieldProps={{ autoSize: { minRows: 3, maxRows: 5 } }}
        />
      </ModalForm>
    </>
  );
}
