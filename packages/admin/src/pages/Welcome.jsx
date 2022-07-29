import { PageContainer } from '@ant-design/pro-layout';
import { StatisticCard } from '@ant-design/pro-components';
import { useModel } from 'umi';
import { Button, Space } from 'antd';
import { Area } from '@ant-design/plots';
import { useMemo } from 'react';
const { Statistic } = StatisticCard;

const Welcome = () => {
  const { initialState } = useModel('@@initialState');
  const lineData = useMemo(() => {
    const res = [];
    for (const each of initialState?.viewer?.grid || []) {
      res.push({
        date: each.date,
        访客数: each.visited,
        访问量: each.viewer,
      });
    }
    return res;
  }, [initialState.viewer]);
  const lineConfig = {
    data: lineData,
    padding: 'auto',
    xField: 'date',
    autoFix: false,
  };

  return (
    <PageContainer
      title={'Hi，今天写了没？'}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => {
              const urlRaw = initialState?.meta?.siteInfo?.walineServerUrl || '';
              if (urlRaw == '') {
                return;
              }
              const u = new URL(urlRaw).toString();

              window.open(`${u}ui`, '_blank');
            }}
          >
            评论管理
          </Button>
          <Button
            type="primary"
            onClick={() => {
              const urlRaw = initialState?.meta?.siteInfo?.baseUrl || '';
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
      {/* <Card> */}
      <StatisticCard.Group>
        <StatisticCard
          statistic={{
            title: '总文章数',
            value: initialState?.total?.articleNum || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总字数',
            value: initialState?.total?.wordCount || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总访客数',
            value: initialState?.meta?.visited || 0,
            description: (
              <Statistic
                title="今日新增"
                value={initialState?.viewer?.add?.visited || 0}
                trend="up"
              />
            ),
          }}
        />
        <StatisticCard
          statistic={{
            title: '总访问量',
            value: initialState?.meta?.viewer || 0,
            description: (
              <Statistic
                title="今日新增"
                value={initialState?.viewer?.add?.viewer || 0}
                trend="up"
              />
            ),
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group>
        <StatisticCard
          title="访客数趋势图"
          chart={<Area height={200} yField="访客数" {...lineConfig} />}
        />
        <StatisticCard
          title="访问量趋势图"
          chart={<Area height={200} yField="访问量" {...lineConfig} />}
        />
      </StatisticCard.Group>

      {/* </Card> */}
    </PageContainer>
  );
};

export default Welcome;
