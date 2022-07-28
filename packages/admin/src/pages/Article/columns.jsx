import { Tag } from 'antd';
import { deleteArticle, getAllCategories } from '@/services/van-blog/api';
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
    title: '顶置',
    key: (() => {
      return Math.floor(Math.random() * 10000);
    })(),
    dataIndex: 'top',
    valueType: 'number',
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
          history.push(`/editor?type=${record?.about ? 'about' : 'article'}&id=${record.id}`);
        }}
      >
        编辑
      </a>,
      <a
        href={`/post/${record.id}`}
        target="_blank"
        rel="noopener noreferrer"
        key={'view' + record.id}
      >
        查看
      </a>,
      <a
        key={'deleteArticle' + record.id}
        onClick={() => {
          Modal.confirm({
            title: `确定删除 "${record.title}"吗？`,
            onOk: async () => {
              await deleteArticle(record.id);
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
