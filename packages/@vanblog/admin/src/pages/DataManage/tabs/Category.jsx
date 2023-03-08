import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '@/services/van-blog/api';
import { encodeQuerystring } from '@/services/van-blog/encode';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef } from 'react';
const columns = [
  {
    dataIndex: 'name',
    title: '题目',
    search: false,
  },
  {
    title: '加密',
    tooltip:
      '分类加密后，此分类下的所有文章都会被加密。密码以分类的密码为准。加密后，访客仍可正常访问分类并获取文章列表。',
    dataIndex: 'private',
    search: false,
    valueType: 'select',
    valueEnum: {
      [true]: {
        text: '加密',
        status: 'Error',
      },
      [false]: {
        text: '未加密',
        status: 'Success',
      },
    },
  },
  {
    title: '操作',
    valueType: 'option',
    width: 200,
    render: (text, record, _, action) => [
      <a
        key="viewCategory"
        onClick={() => {
          window.open(`/category/${encodeQuerystring(record.name)}`, '_blank');
        }}
      >
        查看
      </a>,
      <ModalForm
        key={`editCateoryC%{${record.name}}`}
        title={`修改分类 "${record.name}"`}
        trigger={<a key={'editC' + record.name}>修改</a>}
        autoFocusFirstInput
        initialValues={{
          password: record.password,
          private: record.private,
        }}
        submitTimeout={3000}
        onFinish={async (values) => {
          if (Object.keys(values).length == 0) {
            message.error('无有效信息！请至少填写一个选项！');
            return false;
          }
          if (values.private && !values.password) {
            message.error('如若加密，请填写密码！');
            return false;
          }

          Modal.confirm({
            content: `确定修改分类 "${record.name}" 吗？改动将立即生效!`,
            onOk: async () => {
              await updateCategory(record.name, values);
              message.success('提交成功');
              action?.reload();
              return true;
            },
          });

          return true;
        }}
      >
        <ProFormText width="md" name="name" label="分类名" placeholder="请输入新的分类名称" />
        <ProFormSelect
          width="md"
          name="private"
          label="是否加密"
          placeholder="是否加密"
          request={async () => {
            return [
              { label: '未加密', value: false },
              { label: '加密', value: true },
            ];
          }}
        />
        <ProFormText.Password
          width="md"
          name="password"
          label="密码"
          placeholder="请输入加密密码"
        />
      </ModalForm>,

      <a
        key={'deleteCategoryC' + record.name}
        onClick={() => {
          Modal.confirm({
            title: `确定删除分类 "${record.name}"吗？`,
            onOk: async () => {
              try {
                await deleteCategory(record.name);
                message.success('删除成功!');
              } catch {}
              action?.reload();
            },
          });
          // action?.startEditable?.(record.id);
        }}
      >
        删除
      </a>,
    ],
  },
];
export default function () {
  const fetchData = async () => {
    const { data: res } = await getAllCategories(true);
    return res.map((item) => ({
      key: item.id,
      ...item,
    }));
  };
  const actionRef = useRef();
  return (
    <>
      <ProTable
        rowKey="name"
        columns={columns}
        search={false}
        dateFormatter="string"
        // headerTitle="分类"
        actionRef={actionRef}
        options={false}
        toolBarRender={() => [
          <ModalForm
            title="新建分类"
            key="newCategoryN"
            trigger={
              <Button key="buttonCN" icon={<PlusOutlined />} type="primary">
                新建分类
              </Button>
            }
            width={450}
            autoFocusFirstInput
            submitTimeout={3000}
            onFinish={async (values) => {
              await createCategory(values);
              actionRef?.current?.reload();
              message.success('新建分类成功！');
              return true;
            }}
            layout="horizontal"
            labelCol={{ span: 6 }}
          >
            <ProFormText
              width="md"
              required
              id="nameC"
              name="name"
              label="分类名称"
              key="nameCCCC"
              placeholder="请输入分类名称"
              rules={[{ required: true, message: '这是必填项' }]}
            />
          </ModalForm>,
        ]}
        request={async () => {
          const data = await fetchData();
          return {
            data,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: data.length,
          };
        }}
      />
    </>
  );
}
