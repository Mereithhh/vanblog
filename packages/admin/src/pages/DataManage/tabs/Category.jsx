import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '@/services/van-blog/api';
import { encodeQuerystring } from '@/services/van-blog/encode';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Switch } from 'antd';
import { useRef, useState } from 'react';

function HiddenSwitch({ record, action }) {
  const [loading, setLoading] = useState(false);
  return (
    <span data-category-hidden-toggle={String(record.name)}>
      <Switch
        size="small"
        loading={loading}
        checked={Boolean(record.hidden)}
        checkedChildren="是"
        unCheckedChildren="否"
        aria-label={`是否隐藏 ${record.name}`}
        onChange={async (checked) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({
              title: '演示站禁止修改信息！',
              content: '本来是可以的，但有个人在演示站首页放黄色信息，所以关了这个权限了。',
            });
            return;
          }
          setLoading(true);
          try {
            await updateCategory(record.name, { hidden: checked });
            message.success(checked ? '已设为隐藏' : '已取消隐藏');
            action?.reload();
          } finally {
            setLoading(false);
          }
        }}
      />
    </span>
  );
}

const columns = [
  {
    dataIndex: 'name',
    title: '题目',
    search: false,
  },
  {
    title: '是否隐藏',
    tooltip:
      '隐藏后，前台分类列表、导航分类子菜单、分类页和 sitemap 不再展示该分类。后台仍可见。该分类下的文章仍按各自的隐藏/加密规则展示，不会因为分类隐藏而被加密。',
    dataIndex: 'hidden',
    search: false,
    render: (_, record, __, action) => <HiddenSwitch record={record} action={action} />,
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
          hidden: Boolean(record.hidden),
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
          name="hidden"
          label="是否隐藏"
          placeholder="是否隐藏"
          request={async () => {
            return [
              { label: '否', value: false },
              { label: '是', value: true },
            ];
          }}
        />
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
