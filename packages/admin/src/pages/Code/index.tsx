import CodeEditor from '@/components/CodeEditor';
import { getCustomPageByPath, updateCustomPage } from '@/services/van-blog/api';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, message, Space, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { history } from 'umi';

export default function () {
  const [value, setValue] = useState('');
  const [currObj, setCurrObj] = useState<any>({});
  const type = history.location.query?.type;
  const path = history.location.query?.path;
  const typeMap = {
    customPage: '自定义页面',
  };
  const fetchData = useCallback(async () => {
    if (!path) {
      message.error('未知类型，无法保存！');
      return;
    } else {
      const { data } = await getCustomPageByPath(path);
      if (data) {
        setCurrObj(data);
        setValue(data?.html || '');
      }
    }
  }, [setCurrObj, setValue, path]);
  const handleSave = async () => {
    if (type != 'customPage') {
      message.error('未知类型，无法保存！');
      return;
    } else {
      await updateCustomPage({ ...currObj, html: value });
      message.success('保存成功！');
    }
  };
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <PageContainer
      className="editor-full"
      header={{
        title: (
          <Space>
            <span title={currObj?.name}>{currObj?.name}</span>
            <>
              <Tag color="green">{typeMap[type] || '未知类型'}</Tag>
            </>
          </Space>
        ),
        extra: [
          <Button key="saveBtn" type="primary" onClick={handleSave}>
            保存
          </Button>,
          <Button
            key="backBtn"
            onClick={() => {
              history.go(-1);
            }}
          >
            返回
          </Button>,
          <Button
            key="docBtn"
            onClick={() => {
              window.open('https://vanblog.mereith.com/feature/advance/customPage.html');
            }}
          >
            文档
          </Button>,
        ],
        breadcrumb: {},
      }}
      footer={null}
    >
      <div style={{ height: '100%' }}>
        <CodeEditor
          value={value}
          onChange={setValue}
          language={'html'}
          width={'100%'}
          height={'calc(100vh - 120px)'}
        />
      </div>
    </PageContainer>
  );
}
