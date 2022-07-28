import { deleteSocial, getSocialTypes, updateSocial } from '@/services/van-blog/api';
import { EditableProTable } from '@ant-design/pro-components';
import { Modal, Spin } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';

export default function () {
  const { initialState, setInitialState } = useModel('@@initialState');
  // const actionRef = useRef();
  const [loading, setLoading] = useState(true);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const fetchData = async () => {
    setLoading(true);
    let data = await initialState?.fetchInitData?.();
    await setInitialState((s) => ({ ...s, ...data }));
    data = data?.meta?.socials;
    setLoading(false);
    return data;
  };
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
      request: async () => {
        const { data } = await getSocialTypes();
        return data || [];
      },
    },
    {
      title: '值',
      dataIndex: 'value',
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
            action?.startEditable?.(record.type);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            Modal.confirm({
              onOk: async () => {
                await deleteSocial(record.type);
                const data = await fetchData();
                setDataSource(data);
              },
              title: `确认删除"${record.type}"吗?`,
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
      <Spin spinning={loading}>
        <EditableProTable
          rowKey="type"
          headerTitle="联系方式"
          maxLength={5}
          scroll={{
            x: 960,
          }}
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ type: '选择类型' }),
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
                type: data.type,
                value: data.value,
              };
              await updateSocial(toSaveObj);
              // await waitTime(2000);
            },
            onChange: setEditableRowKeys,
          }}
        />
      </Spin>
    </>
  );
}
