import { Tag, Modal, message } from 'antd';
import { history } from 'umi';
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
    width: 100,
    request: async () => {
      const { data: categories } = await getAllCategories();
      const data = categories.map((each) => ({
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
    width: 120,
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
    width: 150,
  },
  {
    title: '顶置',
    key: (() => {
      return Math.floor(Math.random() * 10000);
    })(),
    dataIndex: 'top',
    valueType: 'number',
    sorter: true,
    width: 80,
    hideInSearch: true,
  },
  {
    title: '浏览量',
    key: (() => {
      return Math.floor(Math.random() * 10000);
    })(),
    dataIndex: 'viewer',
    valueType: 'number',
    sorter: false,
    width: 80,
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
    width: 140,
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
