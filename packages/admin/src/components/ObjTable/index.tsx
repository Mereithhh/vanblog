import { Table, Typography } from 'antd';
import { useMemo } from 'react';

export default function (props: { obj: any }) {
  const data = useMemo(() => {
    if (!props.obj || Object.keys(props.obj).length == 0) {
      return [];
    }
    const res = [];
    for (const [k, v] of Object.entries(props.obj)) {
      res.push({ key: k, name: k, val: v });
    }
    return res;
  }, [props]);
  return (
    <Table
      dataSource={data}
      size="small"
      columns={[
        { title: '属性', dataIndex: 'name', key: 'name', width: 60 },
        {
          title: '值',
          dataIndex: 'val',
          key: 'val',
          render: (val) => {
            return (
              <Typography.Text
                copyable={val.length > 20}
                style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}
              >
                {val}
              </Typography.Text>
            );
          },
        },
      ]}
      pagination={{
        hideOnSinglePage: true,
      }}
    ></Table>
  );
}
