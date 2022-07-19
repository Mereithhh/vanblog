import {
  createDraft,
  deleteDraft,
  getAllCategories,
  getTags,
  publishDraft,
} from '@/services/van-blog/api';
import { mutiSearch } from '@/services/van-blog/search';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Tag } from 'antd';
import moment from 'moment';
import { useRef } from 'react';
import { history, useModel } from 'umi';
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

        let data = await initialState?.fetchInitData?.();
        await setInitialState((s) => ({ ...s, ...data }));
        data = data.drafts;
        // 排序
        if (sort && sort.createdAt) {
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

        const { current, pageSize, ...searchObj } = params;
        if (searchObj) {
          for (const [targetName, target] of Object.entries(searchObj)) {
            switch (targetName) {
              case 'title':
                if (target != '') {
                  data = data.filter((eachRecord) => {
                    return mutiSearch(eachRecord.title, target);
                  });
                }
                break;
              case 'tags':
                if (target != '') {
                  data = data.filter((eachRecord) => {
                    if (!eachRecord.tags || eachRecord.tags.length == 0) {
                      return false;
                    }
                    return eachRecord.tags.some((eachTag) => mutiSearch(eachTag, target));
                  });
                }
                break;
              case 'endTime':
                data = data.filter((eachRecord) => {
                  const t = moment(eachRecord.createdAt);
                  const t0 = moment(searchObj?.startTime);
                  const t1 = moment(searchObj?.endTime);
                  return t.isBetween(t0, t1, 'day', '[]');
                });
                break;
              case 'category':
                data = data.filter((eachRecord) => {
                  return mutiSearch(eachRecord.category, target);
                });
                break;
            }
          }
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
        onChange(value) {},
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
        span: 6,
      }}
      pagination={{
        pageSize: 5,
        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="草稿管理"
      toolBarRender={() => [
        <ModalForm
          title="新建草稿"
          trigger={
            <Button key="button" icon={<PlusOutlined />} type="primary">
              新建草稿
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

            await createDraft(washedValues);
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
        </ModalForm>,
      ]}
    />
  );
};
