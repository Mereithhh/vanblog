import { PageContainer } from '@ant-design/pro-layout';
import styles from './Welcome.less';
import { StatisticCard } from '@ant-design/pro-components';
import { useModel } from 'umi';
import { wordCount } from '@/services/van-blog/wordCount';
import { useMemo } from 'react';
import { Button, Space } from 'antd';
import { Line } from '@ant-design/plots';
const { Statistic } = StatisticCard;

const Welcome = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const lineConfig = {
    data: initialState?.viewer?.grid || [],
    padding: 'auto',
    xField: 'date',
  };

  const totalWords = useMemo(() => {
    const articles = initialState?.articles || [];
    let t = 0;
    articles.forEach((a) => {
      t = t + wordCount(a?.content || '');
    });
    return t;
  }, [initialState]);
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
            value: initialState?.articles?.length || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总字数',
            value: totalWords,
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
          chart={<Line height={200} yField="visited" {...lineConfig} />}
        />
        <StatisticCard
          title="访问量趋势图"
          chart={<Line height={200} yField="viewer" {...lineConfig} />}
        />
      </StatisticCard.Group>

      {/* </Card> */}
    </PageContainer>
  );
};

export default Welcome;
