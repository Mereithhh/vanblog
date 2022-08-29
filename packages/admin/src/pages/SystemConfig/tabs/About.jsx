import ProCard from '@ant-design/pro-card';
import { Image, Space, Tag } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';
export default function (props) {
  const { initialState } = useModel('@@initialState');
  const version = useMemo(() => {
    let v = initialState?.version || '获取中';
    return v;
  }, [initialState, history]);
  return (
    <ProCard>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        <Image width={200} src="/logo.svg" alt="logo" preview={false} />
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div>VanBlog</div>
          <div style={{ marginBottom: 4, marginLeft: 4 }}>
            <Tag color="cyan">{version}</Tag>
          </div>
        </div>
        <p align="center">一款简洁实用优雅的高性能个人博客系统</p>
        <p>
          <Space>
            <a target={'_blank'} rel="noreferrer" href="https://github.com/Mereithhh/van-blog">
              Github
            </a>
            <a target={'_blank'} rel="noreferrer" href="https://vanblog.mereith.com">
              项目主页
            </a>
            <a target={'_blank'} rel="noreferrer" href="/swagger">
              API文档
            </a>
            <a
              target={'_blank'}
              rel="noreferrer"
              href="https://github.com/Mereithhh/van-blog/issues/new"
            >
              提交BUG
            </a>
          </Space>
        </p>
      </div>
    </ProCard>
  );
}
