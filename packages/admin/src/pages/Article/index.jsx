import { createArticle } from '@/services/van-blog/api';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import moment from 'moment';
import { useRef } from 'react';
import { useModel } from 'umi';
const columns = [
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
    disable: true,
    title: '分类',
    dataIndex: 'category',
    filters: true,
    search: false,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      all: { text: '全部', status: 'Default' },
      open: {
        text: '未解决',
        status: 'Error',
      },
      closed: {
        text: '已解决',
        status: 'Success',
        disabled: true,
      },
      processing: {
        text: '解决中',
        status: 'Processing',
      },
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
        return <div>1</div>;
      }
      //   return <Space>
      //   {/* {record?.labels?.map(({ name, color }) => (
      //     <Tag color={color} key={name}>
      //       {name}
      //     </Tag>
      //   ))} */}
      // </Space>
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
          console.log('edit!');
          // action?.startEditable?.(record.id);
        }}
      >
        编辑
      </a>,
      <a href={record.url} target="_blank" rel="noopener noreferrer" key={'view' + record.id}>
        查看
      </a>,
      <a
        key={'deleteArticle' + record.id}
        onClick={() => {
          console.log('edit!');
          // action?.startEditable?.(record.id);
        }}
      >
        删除
      </a>,
      // <TableDropdown
      //   key="actionGroup"
      //   onSelect={() => action?.reload()}
      //   menus={[
      //     { key: 'copy', name: '复制' },
      //     { key: 'delete', name: '删除' },
      //   ]}
      // />,
    ],
  },
];

// const menu = (
//   <Menu>
//     <Menu.Item key="1">1st item</Menu.Item>
//     <Menu.Item key="2">2nd item</Menu.Item>
//     <Menu.Item key="3">3rd item</Menu.Item>
//   </Menu>
// );

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const actionRef = useRef();
  return (
    <ProTable
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params = {}, sort, filter) => {
        // console.log(sort, filter);
        console.log(params, sort, filter);
        let data = await initialState?.fetchInitData?.();
        await setInitialState((s) => ({ ...s, ...data }));
        data = data.articles;
        // 排序
        if (sort && sort.createdAt) {
          console.log(data);
          if (sort.createdAt == 'ascend') {
            data = data.sort((a, b) => {
              return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            });
          } else {
            data = data.sort((a, b) => {
              return moment(b.createdAt).unix() - moment(a.createdAt).unix();
            });
          }
        }
        // 搜索
        if (params && filter.length) {
        }
        return {
          data,
          // success 请返回 true，
          // 不然 table 会停止解析数据，即使有数据
          success: Boolean(data),
          // 不传会使用 data 的长度，如果是分页一定要传
          total: data?.articles?.length,
        };
      }}
      editable={false}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        onChange(value) {
          console.log('value: ', value);
        },
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      // form={{
      //   // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
      //   syncToUrl: (values, type) => {
      //     if (type === 'get') {
      //       return {
      //         ...values,
      //         created_at: [values.startTime, values.endTime],
      //       };
      //     }
      //     return values;
      //   },
      // }}
      pagination={{
        pageSize: 5,
        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="文章管理"
      toolBarRender={() => [
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
            const res = await createArticle(values);
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
            name="title"
            label="文章标题"
            placeholder="请输入标题"
            rules={[{ required: true, message: '这是必填项' }]}
          />
          <ProFormText width="md" name="tags" label="标签" placeholder="请输入标签" />
          <ProFormText
            width="md"
            required
            id="categoryC"
            name="category"
            label="分类"
            placeholder="请输入分类"
            rules={[{ required: true, message: '这是必填项' }]}
          />
          <ProFormSelect
            width="md"
            name="private"
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
            name="password"
            placeholder="请输入密码"
            dependencies={['private']}
          />
          <ProFormSelect
            width="md"
            name="hiden"
            id="hidenC"
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

        // <Dropdown key="menu" overlay={menu}>
        //   <Button>
        //     <EllipsisOutlined />
        //   </Button>
        // </Dropdown>,
      ]}
    />
  );
};
