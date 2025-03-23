import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import '../Welcome/index.less';
import Login from './tabs/Login';
import Pipeline from './tabs/Pipeline';
export default function () {
  const tabMap = {
    login: <Login />,
    pipeline: <Pipeline />,
  };
  const [tab, setTab] = useTab('login', 'tab');

  return (
    <PageContainer
      title={null}
      extra={null}
      header={{ title: null, extra: null, ghost: true }}
      className="thinheader"
      tabActiveKey={tab}
      tabList={[
        {
          tab: '登录日志',
          key: 'login',
        },
        {
          tab: '系统日志',
          key: 'pipeline',
        },
      ]}
      onTabChange={setTab}
    >
      {tabMap[tab]}
    </PageContainer>
  );
}
