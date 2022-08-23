import StaticForm from '@/components/StaticForm';
import { scanImgsOfArticles } from '@/services/van-blog/api';
import { Alert, Button, Card, message, Modal, Table, Typography } from 'antd';
import { useState } from 'react';

export default function () {
  const [loading, setLoading] = useState(false);
  return (
    <Card>
      <StaticForm />

      <Button
        style={{ margin: '20px 0' }}
        onClick={async () => {
          setLoading(true);
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
                    { title: '文章 ID', dataIndex: 'artcileId', key: 'artcileId' },
                    { title: '标题', dataIndex: 'title', key: 'title' },
                    {
                      title: '链接',
                      dataIndex: 'link',
                      key: 'link',
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
                />
              ),
            });
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
    </Card>
  );
}
