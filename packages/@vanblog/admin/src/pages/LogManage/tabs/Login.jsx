import { getLog } from '@/services/van-blog/api';
import { ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRef } from 'react';

const columns = [
  {
    title: '序号',
    align: 'center',
    width: 50,
    render: (text, record, index) => {
      return index + 1;
    },
  },
  {
    title: '登录时间',
    dataIndex: 'time',
    key: 'time',
    align: 'center',
    render: (text, record) => {
      return new Date(record.time).toLocaleString();
    },
  },
  {
    title: '登录地址',
    dataIndex: 'address',
    key: 'address',
    align: 'center',
  },
  {
    title: '登录IP',
    dataIndex: 'ip',
    key: 'ip',
    align: 'center',
  },
  {
    title: '登录设备',
    dataIndex: 'platform',
    key: 'platform',
    align: 'center',
  },
  {
    title: '登录状态',
    dataIndex: 'success',
    key: 'success',
    align: 'center',
    render: (text, record) => {
      return (
        <Tag color={record.success ? 'success' : 'error'} style={{ marginRight: 0 }}>
          {record.success ? '成功' : '失败'}
        </Tag>
      );
    },
  },
];
export default function () {
  const actionRef = useRef();
  return (
    <>
      <ProTable
        // ghost
        cardBordered
        rowKey="time"
        columns={columns}
        search={false}
        dateFormatter="string"
        actionRef={actionRef}
        options={true}
        headerTitle="登录日志"
        pagination={{
          pageSize: 10,
          simple: true,
          hideOnSinglePage: true,
        }}
        request={async (params) => {
          // console.log(params);
          // const data = await fetchData();
          const { data } = await getLog('login', params.current, params.pageSize);
          return {
            data: data.data,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: data.total,
          };
        }}
      />
    </>
  );
}
