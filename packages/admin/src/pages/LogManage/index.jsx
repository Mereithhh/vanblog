import { useTab } from '@/services/van-blog/useTab';
import { PageContainer } from '@ant-design/pro-layout';
import thinstyle from '../Welcome/index.less';
import Login from './tabs/Login';
import Pipeline from "./tabs/Pipeline";
export default function () {
  const tabMap = {
    login: <Login />,
    pipeline: <Pipeline />
  };
  const [tab, setTab] = useTab('pipeline', 'tab');

  return (
    <PageContainer
      title={null}
      extra={null}
      header={{ title: null, extra: null, ghost: true }}
      className={thinstyle.thinheader}
      tabActiveKey={tab}
      tabList={[
        {
          tab: "流水线日志",
          key: "pipeline"
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
