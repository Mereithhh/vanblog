import StaticForm from '@/components/StaticForm';
import WatchMarkForm from '@/components/WaterMarkForm';
import { exportAllImgs, scanImgsOfArticles } from '@/services/van-blog/api';
import { Alert, Button, Card, message, Modal, Table, Typography } from 'antd';
import { useState } from 'react';

export default function () {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  return (
    <>
      <Card title="图床功能设置">
        <WatchMarkForm />
      </Card>
      <Card title="存储策略设置" style={{ marginTop: 8 }}>
        <StaticForm />
      </Card>
      <Card title="高级操作" style={{ marginTop: 8 }}>
        <Button
          style={{ margin: '20px 0' }}
          onClick={async () => {
            setLoading(true);
            try {
              const { data } = await scanImgsOfArticles();
              message.success(`扫描成功！共 ${data?.total || 0} 项`);
              setLoading(false);
              const { errorLinks } = data;
              if (errorLinks && errorLinks.length) {
                Modal.info({
                  title: '失效链接：',
                  content: (
                    <Table
                      pagination={{
                        hideOnSinglePage: true,
                      }}
                      rowKey={'link'}
                      dataSource={errorLinks}
                      size="small"
                      columns={[
                        {
                          title: '文章 ID',
                          dataIndex: 'artcileId',
                          key: 'artcileId',
                        },
                        { title: '标题', dataIndex: 'title', key: 'title' },
                        {
                          title: '链接',
                          dataIndex: 'link',
                          key: 'link',
                          render: (val) => {
                            return (
                              <Typography.Text
                                copyable={val.length > 20}
                                style={{
                                  wordBreak: 'break-all',
                                  wordWrap: 'break-word',
                                }}
                              >
                                {val}
                              </Typography.Text>
                            );
                          },
                        },
                      ]}
                    />
                  ),
                });
              }
            } catch (err) {
              setLoading(false);
            }
          }}
          type="primary"
          loading={loading}
        >
          扫描现有文章图片到图床
        </Button>
        <Alert
          type="info"
          message="PS: 扫描文章图片会把文章内的所有图片扫描到数据库中，就可以在图床页面看到了。只支持外链。"
        ></Alert>
        <Button
          style={{ margin: '20px 0' }}
          loading={exporting}
          type="primary"
          onClick={async () => {
            setExporting(true);
            try {
              const { data } = await exportAllImgs();
              const link = document.createElement('a');
              link.href = data;
              link.download = data.split('/').pop();
              link.click();
              setExporting(false);
            } catch (err) {
            } finally {
              setExporting(false);
            }
          }}
        >
          导出全部本地图床内容（压缩包）
        </Button>
        <Alert
          type="info"
          message="PS: 导出全部图片会把本地图床的全部文件打包成一个 zip 压缩包并在完成后弹出下载窗口。"
        ></Alert>
      </Card>
    </>
  );
}
