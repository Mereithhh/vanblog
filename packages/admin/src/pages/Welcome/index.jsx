import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space } from 'antd';
import { useMemo } from 'react';
import OverView from './tabs/overview';
import { useModel } from 'umi';
import Viewer from './tabs/viewer';
import { useTab } from '@/services/van-blog/useTab';

const Welcome = () => {
  const [tab, setTab] = useTab('overview', 'tab');

  const { initialState } = useModel('@@initialState');
  const tabMap = {
    overview: <OverView />,
    viewer: <Viewer />,
  };
  const showCommentBtn = useMemo(() => {
    const url = initialState?.walineServerUrl;
    if (!url || url == '') {
      return false;
    }
    return true;
  }, [initialState]);
  return (
    <PageContainer
      onTabChange={(k) => {
        setTab(k);
      }}
      tabActiveKey={tab}
      tabList={[
        {
          tab: '数据概览',
          key: 'overview',
        },
        {
          tab: '访客统计',
          key: 'viewer',
        },
      ]}
      title={'Hi，今天写了没？'}
      extra={
        <Space>
          {showCommentBtn && (
            <Button
              type="primary"
              onClick={() => {
                const urlRaw = data?.link?.walineServerUrl || '';
                if (urlRaw == '') {
                  return;
                }
                const u = new URL(urlRaw).toString();
                window.open(`${u}ui`, '_blank');
              }}
            >
              评论管理
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => {
              const urlRaw = data?.link?.baseUrl || '';
              if (urlRaw == '') {
                return;
              }

              window.open(`${urlRaw}`, '_blank');
            }}
          >
            前往主站
          </Button>
        </Space>
      }
    >
      {tabMap[tab]}
    </PageContainer>
  );
};

export default Welcome;
