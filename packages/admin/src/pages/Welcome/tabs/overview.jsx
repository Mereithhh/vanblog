import { StatisticCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { Area } from '@ant-design/plots';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWelcomeData } from '@/services/van-blog/api';
const { Statistic } = StatisticCard;

const OverView = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    const { data: res } = await getWelcomeData('overview');
    setData(res);
  }, [setData]);
  useEffect(() => {
    setLoading(true);
    fetchData().then(() => {
      setLoading(false);
    });
  }, [fetchData, setLoading]);

  const lineData = useMemo(() => {
    const res = [];
    for (const each of data?.viewer?.grid || []) {
      res.push({
        date: each.date,
        访客数: each.visited,
        访问量: each.viewer,
      });
    }
    return res;
  }, [data]);
  const lineConfig = {
    data: lineData,
    padding: 'auto',
    xField: 'date',
    autoFix: false,
  };

  return (
    <Spin spinning={loading}>
      <StatisticCard.Group>
        <StatisticCard
          statistic={{
            title: '总文章数',
            value: data?.total?.articleNum || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总字数',
            value: data?.total?.wordCount || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总访客数',
            value: data?.viewer?.now?.visited || 0,
            description: (
              <Statistic title="今日新增" value={data?.viewer?.add?.visited || 0} trend="up" />
            ),
          }}
        />
        <StatisticCard
          statistic={{
            title: '总访问量',
            value: data?.viewer?.now?.viewer || 0,
            description: (
              <Statistic title="今日新增" value={data?.viewer?.add?.viewer || 0} trend="up" />
            ),
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group style={{ marginTop: -10 }}>
        <StatisticCard
          title="总访客数趋势图"
          chart={<Area height={200} yField="访客数" {...lineConfig} />}
        />
        <StatisticCard
          title="总访问量趋势图"
          chart={<Area height={200} yField="访问量" {...lineConfig} />}
        />
      </StatisticCard.Group>
    </Spin>
  );
};

export default OverView;
