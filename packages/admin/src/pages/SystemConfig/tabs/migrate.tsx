import { createArticle, createDraft } from '@/services/van-blog/api';
import { parseMarkdownFile } from '@/services/van-blog/parseMarkdownFile';
import { Alert, Button, Card, message, Space, Spin, Upload } from 'antd';
import { useState } from 'react';

const BatchImport = (props: { type: 'article' | 'draft'; beforeUpload: any }) => {
  return (
    <Upload
      showUploadList={false}
      accept=".md"
      multiple={true}
      beforeUpload={async (file, files) => {
        await props.beforeUpload(props.type, file);
        if (files[files.length - 1] == file) {
          message.success('批量上传完成！');
        }
        return false;
      }}
    >
      <Button type="primary">{props.type == 'article' ? '批量导入文章' : '批量导入草稿'}</Button>
    </Upload>
  );
};

export default function (props) {
  const [loading, setLoading] = useState(false);
  const handleImport = async (type, file) => {
    setLoading(true);
    try {
      const vals = await parseMarkdownFile(file, true);
      if (vals) {
        if (type == 'article') {
          await createArticle(vals);
        } else {
          await createDraft(vals);
        }
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <>
      <Card title="迁移助手">
        <Alert
          type="info"
          message="注意：使用迁移助手批量导入文章或草稿时，可能分类会为空，后期需要手动修改哦"
          style={{ marginBottom: 20 }}
        />
        <Spin spinning={loading}>
          <Space size="large">
            <BatchImport type="article" beforeUpload={handleImport} />
            <BatchImport type="draft" beforeUpload={handleImport} />
            {/* <Upload showUploadList={false} accept=".md" multiple={true} beforeUpload={}>
              <Button>批量导入草稿</Button>
            </Upload> */}
          </Space>
        </Spin>
      </Card>
    </>
  );
}
