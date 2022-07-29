import ProCard from '@ant-design/pro-card';
import { Space, Button, Upload, message, Spin } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { exportAll } from '@/services/van-blog/api';

export default function (props) {
  const [loading, setLoading] = useState(false);
  const handleOutPut = async () => {
    const data = await exportAll();
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `备份-${moment().format('YYYY-MM-DD')}.json`;
    link.click();
  };
  return (
    <ProCard>
      <Spin spinning={loading}>
        <Space size="large">
          <Upload
            showUploadList={false}
            name="file"
            accept=".json"
            action="/api/admin/all/import"
            headers={{
              token: (() => {
                return window.localStorage.getItem('token') || 'null';
              })(),
            }}
            onChange={(info) => {
              setLoading(true);
              if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
              }
              if (info.file.status === 'done') {
                message.success(`${info.file.name} 上传成功! 稍后刷新就生效了!`);
                setLoading(false);
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败!`);
                setLoading(false);
              }
            }}
          >
            <Button>导入</Button>
          </Upload>
          <Button type="primary" onClick={handleOutPut}>
            导出
          </Button>
        </Space>
      </Spin>
    </ProCard>
  );
}
