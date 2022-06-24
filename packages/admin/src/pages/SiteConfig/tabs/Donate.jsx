import { deleteDonate, updateDonate } from '@/services/van-blog/api';
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
    data = data?.meta?.rewards;
    return data;
  };
  const columns = [
    {
      title: '捐赠人',
      dataIndex: 'name',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '金额',
      valueType: 'money',
      dataIndex: 'value',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '最后捐赠时间',
      valueType: 'time',
      editable: false,
      dataIndex: 'createdAt',
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
                await deleteDonate(record.name);
                const data = await fetchData();
                setDataSource(data);
              },
              title: `确认删除"${record.name}"的捐赠吗?`,
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
        headerTitle="捐赠详情"
        maxLength={5}
        scroll={{
          x: 960,
        }}
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({ name: '请输入捐赠者' }),
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
              value: data.value,
            };
            await updateDonate(data);
            // await waitTime(2000);
          },
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
}
