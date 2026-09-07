import StaticForm from '@/components/StaticForm';
import WatchMarkForm from '@/components/WaterMarkForm';
import { exportAllImgs, rewriteArticleBaseUrl, scanImgsOfArticles } from '@/services/van-blog/api';
import { Alert, Button, Card, Input, message, Modal, Table, Typography } from 'antd';
import { useState } from 'react';

export default function () {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [oldBase, setOldBase] = useState('');
  const [newBase, setNewBase] = useState(
    typeof window !== 'undefined' ? window.location.origin : '',
  );
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
      <Card title="域名变更后改写文章图片链接" style={{ marginTop: 8 }}>
        <Alert
          type="warning"
          style={{ marginBottom: 16 }}
          message="换域名后，文章/草稿里已经写成绝对地址的图片（如 https://旧域名/static/...）不会跟着改。这里只改 Mongo 里的正文链接，不会移动磁盘上的文件，也不会改写你没填写的第三方图床。"
        />
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 4 }}>旧站点 / 图床地址</div>
          <Input
            placeholder="https://old.example.com"
            value={oldBase}
            onChange={(e) => setOldBase(e.target.value)}
            allowClear
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 4 }}>新站点 / 图床地址</div>
          <Input
            placeholder="https://new.example.com"
            value={newBase}
            onChange={(e) => setNewBase(e.target.value)}
            allowClear
          />
        </div>
        <Button
          type="primary"
          loading={rewriting}
          onClick={() => {
            if (typeof window !== 'undefined' && location.hostname == 'blog-demo.mereith.com') {
              Modal.info({
                title: '演示站禁止修改此项！',
                content: '演示站不允许批量改写文章内容。',
              });
              return;
            }
            const from = (oldBase || '').trim();
            const to = (newBase || '').trim();
            if (!from || !to) {
              message.warning('请填写旧地址和新地址');
              return;
            }
            Modal.confirm({
              title: '确认改写文章和草稿中的链接？',
              content: `将把以「${from}」开头的链接改写成「${to}」。建议先在「备份恢复」导出一份数据。相对路径 /static/... 不会改动。`,
              okText: '开始改写',
              okButtonProps: { danger: true },
              onOk: async () => {
                setRewriting(true);
                try {
                  const { data } = await rewriteArticleBaseUrl({
                    oldBase: from,
                    newBase: to,
                  });
                  message.success(
                    `改写完成：文章 ${data?.articlesUpdated || 0} 篇，草稿 ${
                      data?.draftsUpdated || 0
                    } 篇，共 ${data?.replacements || 0} 处`,
                  );
                } finally {
                  setRewriting(false);
                }
              },
            });
          }}
        >
          改写文章与草稿中的链接
        </Button>
        <Alert
          type="info"
          style={{ marginTop: 16 }}
          message="之后请到「站点配置」把网站 Url 改成新域名，并确认 DNS 已指向本站。新上传的图片会按当前访问域名写入。"
        />
      </Card>
    </>
  );
}
