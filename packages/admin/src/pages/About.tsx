import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { Image, Space, Spin, Tag } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';
export default function (props) {
  const { initialState } = useModel('@@initialState');
  const version = useMemo(() => {
    let v = initialState?.version || '获取中';
    return v;
  }, [initialState, history]);

  return (
    <PageContainer title={null} extra={null} header={{ title: null, extra: null, ghost: true }}>
      <Spin spinning={version == '获取中'}>
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

            <Space>
              <a target={'_blank'} rel="noreferrer" href="https://github.com/Mereithhh/van-blog">
                Github
              </a>
              <a target={'_blank'} rel="noreferrer" href="https://vanblog.mereith.com">
                项目文档
              </a>
              <a
                target={'_blank'}
                rel="noreferrer"
                href="https://vanblog.mereith.com/changelog.html"
              >
                更新日志
              </a>
              <a target={'_blank'} rel="noreferrer" href="/swagger">
                API文档
              </a>
            </Space>
            <Space style={{ marginTop: 8 }}>
              <a
                target={'_blank'}
                rel="noreferrer"
                href="https://github.com/Mereithhh/van-blog/issues/new/choose"
              >
                提交BUG
              </a>
              <a
                target={'_blank'}
                rel="noreferrer"
                href="https://github.com/Mereithhh/van-blog/issues/new/choose"
              >
                提交案例
              </a>
              <a
                target={'_blank'}
                rel="noreferrer"
                href="https://github.com/Mereithhh/van-blog#%E6%89%93%E8%B5%8F"
              >
                打赏
              </a>
              <a target={'_blank'} rel="noreferrer" href="https://jq.qq.com/?_wv=1027&k=5NRyK2Sw">
                交流群
              </a>
            </Space>
          </div>
        </ProCard>
      </Spin>
    </PageContainer>
  );
}
