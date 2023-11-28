import TipTitle from '@/components/TipTitle';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { Button, message, Modal, Space, Tag } from 'antd';
import { getPiplelines, getPipelineConfig, deletePipelineById } from '@/services/van-blog/api';
import PipelineModal from './components/PipelineModal';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';

export default function () {
  const [pipelineConfig, setPipelineConfig] = useState<any[]>([]);
  const actionRef = useRef<any>();

  useEffect(() => {
    getPipelineConfig().then(({ data }) => {
      setPipelineConfig(data);
    });
  }, []);

  const columns = [
    {
      dataIndex: 'id',
      valueType: 'number',
      title: 'ID',
      width: 48,
    },
    {
      dataIndex: 'name',
      valueType: 'text',
      title: '名称',
      width: 120,
    },
    {
      title: '是否异步',
      width: 60,
      render: (_, record) => {
        const passive = pipelineConfig.find((item) => item.eventName === record.eventName)?.passive;
        return <Tag children={passive ? '异步' : '阻塞'} color={passive ? 'green' : 'red'} />;
      },
    },
    {
      dataIndex: 'eventName',
      valueType: 'text',
      title: '触发事件',
      width: 120,
      render: (eventName) => {
        return pipelineConfig.find((item) => item.eventName === eventName)?.eventNameChinese;
      },
    },
    {
      dataIndex: 'enabled',
      title: '状态',
      width: 60,
      render: (enabled: boolean) => (
        <Tag children={enabled ? '启用' : '禁用'} color={enabled ? 'green' : 'gray'} />
      ),
    },
    {
      title: '操作',
      width: 180,
      render: (_, record, action) => {
        return (
          <>
            <Space>
              <a
                onClick={() => {
                  history.push('/code?type=pipeline&id=' + record.id);
                }}
              >
                编辑脚本
              </a>
              <PipelineModal
                mode="edit"
                trigger={<a>修改信息</a>}
                initialValues={record}
                onFinish={() => {
                  actionRef.current?.reload();
                }}
              />

              <a
                onClick={async () => {
                  Modal.confirm({
                    title: '确定删除该流水线吗？ ',
                    onOk: async () => {
                      await deletePipelineById(record.id);
                      console.log(action);
                      actionRef.current.reload();
                      message.success('删除成功！');
                    },
                  });
                }}
              >
                删除
              </a>
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <TipTitle title="流水线" tip="流水线允许用户在特定事件时，自动触发执行自定义代码。" />
        ),
      }}
      extra={
        <Button
          onClick={() => {
            window.open('https://vanblog.mereith.com/features/pipeline.html', '_blank');
          }}
        >
          帮助文档
        </Button>
      }
    >
      <ProTable
        actionRef={actionRef}
        pagination={{
          hideOnSinglePage: true,
        }}
        toolBarRender={(action) => {
          return [
            <PipelineModal
              mode="create"
              key="createPipelineBtn1"
              trigger={<Button type="primary">新建</Button>}
              onFinish={() => {
                action.reload();
              }}
            />,
            <Button
              key="viewLog"
              onClick={() => {
                history.push('/site/log?tab=pipeline');
              }}
            >
              运行日志
            </Button>,
          ];
        }}
        headerTitle="流水线列表"
        columns={columns}
        search={false}
        rowKey="id"
        request={async () => {
          const data = await getPiplelines();
          return {
            data: data.data,
            success: true,
            total: data.data.length,
          };
        }}
      />
    </PageContainer>
  );
}
