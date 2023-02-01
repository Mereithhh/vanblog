import CodeEditor from '@/components/CodeEditor';
import { getLayoutConfig, updateLayoutConfig } from '@/services/van-blog/api';
import { useTab } from '@/services/van-blog/useTab';
import { Button, Card, message, Modal, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
const helpMap = {
  css: '自定义 css 会把您写入的 css 代码作为 <style> 标签插入到前台页面中的 <head> 中。',
  script: '自定义 script 会把您写入的 script 代码作为 <script> 标签插入到前台页面的最下方。',
  html: '自定义 html 会把您写入的 html 代码插入到前台页面 body 标签中的下方。是静态化的，首屏源代码即存在。',
  head: '自定义 html 会把您写入的 html 代码插入到前台页面的 head 标签中的下方。是静态化的，首屏源代码即存在，可以用于网站所有权验证。',
};
export default function () {
  const [tab, setTab] = useTab('css', 'customTab');
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({
    css: '',
    script: '',
    html: '',
    head: '',
  });
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
          head: data?.head || '',
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
      content:
        '在保存前请确认代码的正确性,有问题的代码可能导致前台报错！如不生效，请检查是否在站点配置/布局设置中打开了客制化功能。',
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
          <a
            target="_blank"
            href="https://vanblog.mereith.com/feature/advance/customizing.html"
            rel="noreferrer"
          >
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
    head: 'html',
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
      tab: '自定义 HTML (body)',
    },
    {
      key: 'head',
      tab: '自定义 HTML (head)',
    },
  ];
  return (
    <>
      <Card
        ref={cardRef}
        tabList={tabList}
        onTabChange={setTab}
        activeTabKey={tab}
        defaultActiveTabKey={'css'}
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
          {tab == 'css' && (
            <CodeEditor
              height={600}
              language={languageMap[tab]}
              onChange={(v) => {
                setValues({ ...values, [tab]: v });
              }}
              value={values[tab] || ''}
            />
          )}
          {tab == 'script' && (
            <CodeEditor
              height={600}
              language={languageMap[tab]}
              onChange={(v) => {
                setValues({ ...values, [tab]: v });
              }}
              value={values[tab] || ''}
            />
          )}
          {tab == 'html' && (
            <CodeEditor
              height={600}
              language={languageMap[tab]}
              onChange={(v) => {
                setValues({ ...values, [tab]: v });
              }}
              value={values[tab] || ''}
            />
          )}
          {tab == 'head' && (
            <CodeEditor
              height={600}
              language={languageMap[tab]}
              onChange={(v) => {
                setValues({ ...values, [tab]: v });
              }}
              value={values[tab] || ''}
            />
          )}
        </Spin>
      </Card>
    </>
  );
}
