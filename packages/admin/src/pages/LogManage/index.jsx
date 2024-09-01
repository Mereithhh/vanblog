import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import thinstyle from '../Welcome/index.less';
import Login from './tabs/Login';
import Pipeline from './tabs/Pipeline';
import System from './tabs/System';
export default function () {
  const tabMap = {
    login: <Login />,
    pipeline: <Pipeline />,
    system: <System />,
  };
  const [tab, setTab] = useTab('system', 'tab');

  return (
    <PageContainer
      title={null}
      extra={null}
      header={{ title: null, extra: null, ghost: true }}
      className={thinstyle.thinheader}
      tabActiveKey={tab}
      tabList={[
        {
          tab: '系统日志',
          key: 'system',
        },
        {
          tab: '流水线日志',
          key: 'pipeline',
        },
        {
          tab: '登录日志',
          key: 'login',
        },
      ]}
      onTabChange={setTab}
    >
      {tabMap[tab]}
    </PageContainer>
  );
}
