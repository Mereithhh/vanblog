import CodeEditor from '@/components/CodeEditor';
import { getLayoutConfig, updateLayoutConfig } from '@/services/van-blog/api';
import { useTab } from '@/services/van-blog/useTab';
import { ProForm } from '@ant-design/pro-components';
import { Button, Card, message, Modal, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
const helpMap = {
  css: '自定义 css 会把您写入的 css 代码作为 <link> 标签插入到前台页面中的 <head> 中。',
  script: '自定义 script 会把您写入的 script 代码作为 <script> 标签插入到前台页面的最下方。',
  html: '自定义 html 会把您写入的 html 代码插入到前台页面的最下方。',
};
export default function () {
  const [tab, setTab] = useTab('css', 'subTab');
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({
    css: '',
    script: '',
    html: '',
  });
  const [form] = ProForm.useForm();
  const cardRef = useRef();
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getLayoutConfig();
      if (data) {
        setValues({
          css: data?.css || '',
          script: data?.script || '',
          html: data?.html || '',
        });
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setValues, setLoading]);
  const handleSave = async () => {
    Modal.confirm({
      title: '保存确认',
      content: '在保存前请确认代码的正确性！有问题的代码可能导致前台报错哦！',
      onOk: async () => {
        setLoading(true);
        try {
          await updateLayoutConfig(values);
          setLoading(false);
          message.success('更新成功！');
        } catch (err) {
          throw err;
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const handleReset = async () => {
    fetchData();
    message.success('重置成功！');
  };
  const handleHelp = () => {
    Modal.info({
      title: '帮助',
      content: (
        <div>
          <p>{helpMap[tab]}</p>
          <a target="_blank" href="" rel="noreferrer">
            帮助文档
          </a>
        </div>
      ),
    });
  };
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const languageMap = {
    css: 'css',
    script: 'javascript',
    html: 'html',
  };

  const tabList = [
    {
      key: 'css',
      tab: '自定义 CSS',
    },
    {
      key: 'script',
      tab: '自定义 Script',
    },
    {
      key: 'html',
      tab: '自定义 HTML',
    },
  ];
  return (
    <>
      <Card
        ref={cardRef}
        tabList={tabList}
        onTabChange={setTab}
        activeTabKey={tab}
        className="card-body-full"
        actions={[
          <Button type="link" key="save" onClick={handleSave}>
            保存
          </Button>,
          <Button type="link" key="reset" onClick={handleReset}>
            重置
          </Button>,
          <Button type="link" key="help" onClick={handleHelp}>
            帮助
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <CodeEditor
            height={600}
            language={languageMap[tab]}
            onChange={(v) => {
              setValues({ ...values, [tab]: v });
            }}
            value={values[tab] || ''}
          />
        </Spin>
      </Card>
    </>
  );
}
