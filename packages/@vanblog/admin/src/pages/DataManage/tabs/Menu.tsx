import { getMenu, updateMenu } from '@/services/van-blog/api';
import { EditableProTable, useRefFunction } from '@ant-design/pro-components';
import { message, Modal, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
type DataSourceType = {
  id: React.Key;
  name: string;
  value: string;
  level: number;
  children?: DataSourceType[];
};
const loopDataSourceFilter = (
  data: DataSourceType[],
  id: React.Key | undefined,
): DataSourceType[] => {
  return data
    .map((item) => {
      if (item.id !== id) {
        if (item.children) {
          const newChildren = loopDataSourceFilter(item.children, id);
          return {
            ...item,
            children: newChildren.length > 0 ? newChildren : undefined,
          };
        }
        return item;
      }
      return null;
    })
    .filter(Boolean) as DataSourceType[];
};

export default function () {
  const [loading, setLoading] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [expendKeys, setExpendKeys] = useState([]);
  const removeRow = useRefFunction((record: DataSourceType) => {
    const toUpdateData = loopDataSourceFilter(dataSource, record.id);
    setDataSource(toUpdateData);
    setEditableRowKeys(editableKeys.filter((e) => e != record.id));
    setExpendKeys(expendKeys.filter((e) => e != record.id));
    update(toUpdateData);
  });
  const actionRef = useRef();
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMenu();
      const menuData = data?.data || [];
      setDataSource(menuData);
      const expendKs = menuData.filter((e) => Boolean(e.children)).map((e) => e.id);
      setExpendKeys(expendKs);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, [setLoading, setDataSource, setExpendKeys]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const getNewId = () => {
    return Date.now();
  };
  const update = useCallback(
    async (vals) => {
      await updateMenu({ data: vals });
      //@ts-ignore
      fetchData();
    },
    [fetchData],
  );
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
      tooltip: `内部地址需以 / 开头，外部地址请以协议开头( http/https )`,
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
      render: (text, record, _, action) => {
        const l = record.level;
        return [
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          >
            编辑
          </a>,
          l == 0 ? (
            <a
              key="addChild"
              onClick={() => {
                if (record.level >= 1) {
                  message.warning('目前最大只支持二级菜单');
                  return;
                }

                const children = record?.children || [];
                const newId = getNewId();
                children.push({
                  id: newId,
                  level: record.level + 1,
                });

                // 没有子属性的话增加一个子属性。
                const newData = dataSource.map((d) => {
                  if (d.id == record.id) {
                    return {
                      ...record,
                      children,
                    };
                  } else {
                    return d;
                  }
                });
                setDataSource(newData);
                setExpendKeys([...expendKeys, record.id]);
                action.startEditable(newId);
              }}
            >
              新增下级
            </a>
          ) : undefined,
          <a
            key="delete"
            onClick={async () => {
              Modal.confirm({
                onOk: async () => {
                  removeRow(record);
                },
                title: `确认删除"${record.name || '-'}"吗?`,
              });
            }}
          >
            删除
          </a>,
        ];
      },
    },
  ];
  return (
    <>
      <Spin spinning={loading}>
        <EditableProTable
          expandable={{
            defaultExpandAllRows: true,
            expandedRowKeys: expendKeys,
            onExpand: (e, r) => {
              if (e) {
                setExpendKeys([...expendKeys, r.id]);
              } else {
                setExpendKeys(expendKeys.filter((e) => e != r.id));
              }
            },
            // expandedRowKeys:
          }}
          actionRef={actionRef}
          rowKey="id"
          headerTitle="导航菜单管理"
          scroll={{
            x: 960,
          }}
          recordCreatorProps={{
            position: 'bottom',
            newRecordType: 'dataSource',
            record: () => ({ id: getNewId(), level: 0 }),
          }}
          loading={false}
          columns={columns}
          value={dataSource}
          onValuesChange={(vals) => {
            setDataSource(vals);
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            onSave: async (key, record, originRow, newLineConfig?) => {
              update(dataSource);
            },
            onDelete: async (key, row) => {
              removeRow(row);
            },

            onChange: setEditableRowKeys,
          }}
        />
      </Spin>
    </>
  );
}
