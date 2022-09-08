import { getMenu, updateMenu } from '@/services/van-blog/api';
import { EditableProTable } from '@ant-design/pro-components';
import { Modal, Spin } from 'antd';
import { useCallback, useRef, useState } from 'react';

export default function () {
  // const actionRef = useRef();
  const [loading, setLoading] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [values, setValues] = useState([]);
  const [expendKeys, setExpendKeys] = useState([]);
  const actionRef = useRef();
  const fetchData = async () => {
    setLoading(true);
    const { data } = await getMenu();
    const menuData = data?.data || [];
    setLoading(false);
    setValues(menuData);
    // setExpendKeys(menuData.map((m) => m.id));
    return menuData;
    // return data.map((item) => ({ key: item.name, ...item }));
  };
  const getNewId = () => {
    let id = 0;
    values.forEach((v) => {
      if (v.id > id) {
        id = v.id;
      }
    });
    return id + 1;
  };
  const save = useCallback(async (vals) => {
    await updateMenu({ data: vals });
    //@ts-ignore
    actionRef?.current?.reload();
  }, []);
  const columns = [
    {
      title: '菜单名',
      dataIndex: 'name',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '跳转网址',
      dataIndex: 'value',
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
          key="addChild"
          onClick={() => {
            const newId = getNewId();
            const vals = values.map((v) => {
              if (v.id == record.id) {
                return {
                  ...v,
                  children: [
                    {
                      id: newId,
                    },
                  ],
                };
              } else {
                return v;
              }
            });
            console.log(vals);
            setValues(vals);
            setExpendKeys([...expendKeys, newId]);
            action?.startEditable?.(newId);
          }}
        >
          新增下级
        </a>,
        <a
          key="delete"
          onClick={async () => {
            Modal.confirm({
              onOk: async () => {
                action?.reload();
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
      <Spin spinning={loading}>
        <EditableProTable
          expandable={{
            // 使用 request 请求数据时无效
            // defaultExpandAllRows: true,
            expandedRowKeys: expendKeys,
            onExpandedRowsChange: (ks) => {
              setExpendKeys(ks as any);
            },
            // expandedRowKeys:
          }}
          actionRef={actionRef}
          rowKey="id"
          headerTitle="导航菜单管理"
          maxLength={5}
          scroll={{
            x: 960,
          }}
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ id: getNewId() }),
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
          value={values}
          onValuesChange={(vals) => {
            setValues(vals);
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            onDelete: async (rowKey, record) => {
              const vals = values.filter((v) => v.id != record.id);
              save(vals);
            },
            onSave: async (rowKey, record, data, row) => {
              if (location.hostname == 'blog-demo.mereith.com') {
                Modal.info({ title: '演示站禁止修改此项！' });
                return;
              }
              let has = false;
              const vals = values.map((v) => {
                if (v.id == record.id) {
                  has = true;
                  return record;
                } else {
                  return v;
                }
              });
              if (!has) {
                vals.push(record);
              }

              save(vals);

              // await updateMenu({ data: values });
              // await updateMenu(toSaveObj);
              //@ts-ignore
              // actionRef?.current?.reload();
            },
            onChange: setEditableRowKeys,
          }}
        />
      </Spin>
    </>
  );
}
