import { deleteLink, updateLink } from '@/services/van-blog/api';
import { EditableProTable } from '@ant-design/pro-components';
import { Modal } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';

export default function () {
  const { initialState, setInitialState } = useModel('@@initialState');
  // const actionRef = useRef();
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const fetchData = async () => {
    let data = await initialState?.fetchInitData?.();
    await setInitialState((s) => ({ ...s, ...data }));
    data = data?.meta?.links;
    return data;
  };
  const columns = [
    {
      title: '伙伴名',
      dataIndex: 'name',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '地址',
      dataIndex: 'url',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '最后设置时间',
      valueType: 'date',
      editable: false,
      dataIndex: 'updatedAt',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.name);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            Modal.confirm({
              onOk: async () => {
                await deleteLink(record.name);
                const data = await fetchData();
                setDataSource(data);
              },
              title: `确认删除"${record.name}"吗?`,
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  return (
    <>
      <EditableProTable
        rowKey="name"
        headerTitle="友情链接"
        maxLength={5}
        scroll={{
          x: 960,
        }}
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({ name: '请输入伙伴名' }),
        }}
        loading={false}
        columns={columns}
        request={async () => {
          let data = await fetchData();

          return {
            data,
            success: true,
          };
        }}
        value={dataSource}
        onChange={async (values) => {
          const data = await fetchData();
          setDataSource(data);
        }}
        editable={{
          type: 'multiple',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            const toSaveObj = {
              name: data.name,
              url: data.url,
            };
            await updateLink(toSaveObj);
            // await waitTime(2000);
          },
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
}
