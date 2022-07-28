import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { deleteDraft, getAllCategories, publishDraft } from '@/services/van-blog/api';
export const columns = [
  {
    dataIndex: 'id',
    valueType: 'number',
    title: 'ID',
    width: 48,
    search: false,
  },
  {
    title: '标题',
    dataIndex: 'title',
    copyable: true,
    ellipsis: true,
    tip: '标题过长会自动收缩',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    title: '分类',
    dataIndex: 'category',

    valueType: 'select',
    request: async () => {
      const res = await getAllCategories();
      const data = res?.data?.map((each) => ({
        label: each,
        value: each,
      }));

      return data;
    },
  },
  {
    disable: true,
    title: '标签',
    dataIndex: 'tags',
    search: true,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    render: (val, record) => {
      if (!record?.tags?.length) {
        return '-';
      } else {
        return record?.tags?.map((each) => (
          <Tag style={{ marginBottom: 4 }} key={`tag-${each}`}>
            {each}
          </Tag>
        ));
      }
    },
  },
  {
    title: '创建时间',
    key: 'showTime',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    sorter: true,
    hideInSearch: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateRange',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    render: (text, record, _, action) => [
      <a
        key={'editable' + record.id}
        onClick={() => {
          history.push(`/editor?type=draft&id=${record.id}`);
        }}
      >
        编辑
      </a>,
      <ModalForm
        title={`发布草稿: ${record.title}`}
        key="publishModal"
        trigger={<a key={'publish' + record.id}>发布草稿</a>}
        width={450}
        autoFocusFirstInput
        submitTimeout={3000}
        onFinish={async (values) => {
          await publishDraft(record.id, values);
          action.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        // wrapperCol: { span: 14 },
      >
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
      </ModalForm>,

      <a
        key={'deleteDraft' + record.id}
        onClick={() => {
          Modal.confirm({
            title: `确定删除草稿 "${record.title}" 吗？`,
            onOk: async () => {
              await deleteDraft(record.id);
              message.success('删除成功!');
              action?.reload();
            },
          });
        }}
      >
        删除
      </a>,
    ],
  },
];
