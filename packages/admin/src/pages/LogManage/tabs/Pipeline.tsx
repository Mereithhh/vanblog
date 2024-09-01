import { getLog, getPipelineConfig } from '@/services/van-blog/api';
import { ProTable } from '@ant-design/pro-components';
import { Modal, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';

export default function () {
  const actionRef = useRef();
  const [pipelineConfig, setPipelineConfig] = useState<any[]>([]);
  useEffect(() => {
    getPipelineConfig().then(({ data }) => {
      setPipelineConfig(data);
    });
  }, []);
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
      title: '流水线 id',
      dataIndex: 'pipelineId',
      key: 'pipelineId',
      align: 'center',
    },
    {
      title: '名称',
      dataIndex: 'pipelineName',
      key: 'pipelineName',
      align: 'center',
      render: (name, record) => (
        <a
          onClick={() => {
            history.push('/code?type=pipeline&id=' + record.pipelineId);
          }}
        >
          {name}
        </a>
      ),
    },
    {
      title: '触发事件',
      dataIndex: 'eventName',
      key: 'eventName',
      align: 'center',
      render: (eventName) => {
        return (
          <Tag color="blue">
            {pipelineConfig?.find((item) => item.eventName == eventName)?.eventNameChinese}
          </Tag>
        );
      },
    },
    {
      title: '结果',
      dataIndex: 'success',
      key: 'success',
      align: 'center',
      render: (success) => {
        return success ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>;
      },
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              Modal.info({
                title: '详情',
                width: 800,
                content: (
                  <div
                    style={{
                      maxHeight: '60vh',
                      overflow: 'auto',
                    }}
                  >
                    <p>脚本日志：</p>
                    <pre>
                      {record.logs.map((l) => (
                        <p>{l}</p>
                      ))}
                    </pre>
                    <p>输入：</p>
                    <pre>{JSON.stringify(record.input, null, 2)}</pre>
                    <p>输出：</p>
                    <pre>{JSON.stringify(record.output, null, 2)}</pre>
                  </div>
                ),
              });
            }}
          >
            详情
          </a>
        );
      },
    },
  ];
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
        headerTitle="流水线日志"
        pagination={{
          pageSize: 10,
          simple: true,
          hideOnSinglePage: true,
        }}
        request={async (params) => {
          // console.log(params);
          // const data = await fetchData();
          const { data } = await getLog('runPipeline', params.current, params.pageSize);
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
