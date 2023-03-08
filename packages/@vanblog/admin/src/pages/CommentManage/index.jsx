import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Space, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { history, useModel } from 'umi';
import TipTitle from '../../components/TipTitle';
export default function () {
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(true);
  const { current } = useRef({ hasInit: false });
  const src = useMemo(() => {
    if (initialState?.version && initialState?.version == 'dev') {
      return 'http://192.168.5.11:8360/ui';
    } else {
      return '/ui/';
    }
  }, [initialState]);
  const showTips = () => {
    Modal.info({
      title: '使用说明',
      content: (
        <div>
          <p>
            Vanblog 内嵌了{' '}
            <a target={'_blank'} rel="noreferrer" href="https://waline.js.org/">
              Waline
            </a>{' '}
            作为评论系统。
          </p>
          <p>本管理页面也是内嵌的 Waline 后台管理页面。</p>
          <p>首次使用请先注册，首个注册的用户将默认成为管理员。</p>
          <p>
            PS: 评论功能默认开启，关闭请前往
            站点设置->系统设置->站点配置->高级设置->是否开启评论系统
          </p>
          <p>
            <a
              target={'_blank'}
              rel="noreferrer"
              href="https://vanblog.mereith.com/feature/basic/comment.html"
            >
              帮助文档
            </a>
          </p>
        </div>
      ),
    });
  };
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      if (!localStorage.getItem('CommentTipped')) {
        localStorage.setItem('CommentTipped', true);
        showTips();
      }
    }
  }, [current]);
  return (
    <PageContainer
      className="editor-full"
      style={{ overflow: 'hidden' }}
      title={null}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => {
              history.push(`/site/setting?tab=waline`);
            }}
          >
            设置
          </Button>
          <Button onClick={showTips}>帮助</Button>
        </Space>
      }
      header={{
        title: (
          <TipTitle
            title="评论管理"
            tip="基于内嵌的 Waline，首个注册的用户即为管理员。未来会用自己的实现替代 Waline"
          />
        ),
      }}
    >
      <Spin spinning={loading}>
        <iframe
          onLoad={() => {
            setLoading(false);
          }}
          title="waline 后台"
          src={src}
          width="100%"
          height={'100%'}
        ></iframe>
      </Spin>
    </PageContainer>
  );
}
