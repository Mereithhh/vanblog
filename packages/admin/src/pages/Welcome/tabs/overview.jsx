import { StatisticCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { Area } from '@ant-design/plots';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWelcomeData } from '@/services/van-blog/api';
import TipTitle from '@/components/TipTitle';
import style from '../index.less';
import NumSelect from '@/components/NumSelect';
import { useNum } from '@/services/van-blog/useNum';
const { Statistic } = StatisticCard;

const OverView = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [num, setNum] = useNum(5);
  const fetchData = useCallback(async () => {
    const { data: res } = await getWelcomeData('overview', num);
    setData(res);
  }, [setData, num]);
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
            title: '文章数',
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
            title: (
              <TipTitle
                title="总访客数"
                tip="以浏览器内缓存的唯一标识符为衡量标准计算全站独立访客的数量"
              />
            ),
            value: data?.viewer?.now?.visited || 0,
            description: (
              <Statistic title="今日新增" value={data?.viewer?.add?.visited || 0} trend="up" />
            ),
          }}
        />
        <StatisticCard
          statistic={{
            title: (
              <TipTitle
                title="总访问数"
                tip="以每一次页面的访问及跳转为衡量标准计算全站的访问数量"
              />
            ),
            value: data?.viewer?.now?.viewer || 0,
            description: (
              <Statistic title="今日新增" value={data?.viewer?.add?.viewer || 0} trend="up" />
            ),
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group style={{ marginTop: -10 }}>
        <StatisticCard
          className={style['card-full-title']}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>总访客数趋势图</div>
              <NumSelect d="天" value={num} setValue={setNum} />
            </div>
          }
          chart={<Area height={200} yField="访客数" {...lineConfig} />}
        />
        <StatisticCard
          className={style['card-full-title']}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>总访问量趋势图</div>
              <NumSelect d="天" value={num} setValue={setNum} />
            </div>
          }
          chart={<Area height={200} yField="访问量" {...lineConfig} />}
        />
      </StatisticCard.Group>
    </Spin>
  );
};

export default OverView;
