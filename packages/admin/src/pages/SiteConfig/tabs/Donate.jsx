import { deleteDonate, updateDonate } from '@/services/van-blog/api';
import { EditableProTable } from '@ant-design/pro-components';
import { useState } from 'react';
import { useModel } from 'umi';

export default function () {
  const { initialState, setInitialState } = useModel('@@initialState');
  // const actionRef = useRef();
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
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
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            await deleteDonate(record.name);
            console.log(deleteDonate);
            setDataSource(dataSource.filter((item) => item.id !== record.id));
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
        rowKey="id"
        headerTitle="捐赠详情"
        maxLength={5}
        scroll={{
          x: 960,
        }}
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
        }}
        loading={false}
        columns={columns}
        request={async () => {
          let data = await initialState?.fetchInitData?.();
          await setInitialState((s) => ({ ...s, ...data }));
          data = data?.meta?.rewards;
          return {
            data,
            success: true,
          };
        }}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            const toSaveObj = {
              name: data.name,
              value: data.value,
            };
            await updateDonate(data);
            console.log(toSaveObj);
            // await waitTime(2000);
          },
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
}
