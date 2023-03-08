import { exportAll } from '@/services/van-blog/api';
import { Alert, Button, Card, message, Modal, Space, Spin, Upload } from 'antd';
import moment from 'moment';
import { useState } from 'react';

export default function (props) {
  const [loading, setLoading] = useState(false);
  const handleOutPut = async () => {
    setLoading(true);
    const data = await exportAll();
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `备份-${moment().format('YYYY-MM-DD')}.json`;
    link.click();
    setLoading(false);
  };
  return (
    <Card title="备份与恢复">
      <Alert
        type="warning"
        message="注意：导入导出并不会实际导出图床中的图片本身，而是导入导出其图片记录以便检索。需要备份本地图床图片的话，可以在图床设置中点击导出全部本地图床内容哦！"
        style={{ marginBottom: 20 }}
      />
      <Spin spinning={loading}>
        <Space size="large">
          <Upload
            showUploadList={false}
            name="file"
            accept=".json"
            action="/api/admin/backup/import"
            headers={{
              token: (() => {
                return window.localStorage.getItem('token') || 'null';
              })(),
            }}
            onChange={(info) => {
              setLoading(true);
              if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
              }
              if (info.file.status === 'done') {
                if (location.hostname == 'blog-demo.mereith.com') {
                  Modal.info({
                    title: '演示站禁止修改此项！',
                    content: '因为有个人在演示站首页放黄色信息，所以关了这个权限了。',
                  });
                  return;
                }
                message.success(`${info.file.name} 上传成功! 稍后刷新就生效了!`);
                setLoading(false);
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败!`);
                setLoading(false);
              }
            }}
          >
            <Button>导入全部数据</Button>
          </Upload>
          <Button type="primary" onClick={handleOutPut}>
            导出全部数据
          </Button>
        </Space>
      </Spin>
    </Card>
  );
}
