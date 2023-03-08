import NumSelect from '@/components/NumSelect';
import TipTitle from '@/components/TipTitle';
import { getWelcomeData } from '@/services/van-blog/api';
import { useNum } from '@/services/van-blog/useNum';
import { Area } from '@ant-design/plots';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import style from '../index.less';
const { Statistic } = StatisticCard;

const OverView = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [num, setNum] = useNum(5);
  const [responsive, setResponsive] = useState(false);
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

  const eachData = useMemo(() => {
    const res = [];
    for (const each of data?.viewer?.grid?.each || []) {
      res.push({
        date: each.date,
        访客数: each.visited,
        访问量: each.viewer,
      });
    }
    return res;
  }, [data]);

  const totalData = useMemo(() => {
    const res = [];
    for (const each of data?.viewer?.grid?.total || []) {
      res.push({
        date: each.date,
        访客数: each.visited,
        访问量: each.viewer,
      });
    }
    return res;
  }, [data]);
  const lineConfig = {
    data: totalData,
    xField: 'date',
    // autoFit: true,
    height: 200,
  };
  const eachConfig = {
    data: eachData,
    xField: 'date',
    height: 200,
  };

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <Spin spinning={loading}>
        <ProCard
          split={responsive ? 'horizontal' : 'vertical'}
          bordered
          style={{ marginBottom: responsive ? 8 : 0 }}
        >
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              title: '文章数',
              value: data?.total?.articleNum || 0,
              layout: responsive ? 'horizontal' : 'vertical',
            }}
          />
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              title: '总字数',
              layout: responsive ? 'horizontal' : 'vertical',
              value: data?.total?.wordCount || 0,
            }}
          />

          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              title: (
                <TipTitle
                  title="总访客数"
                  tip="以浏览器内缓存的唯一标识符为衡量标准计算全站独立访客的数量"
                />
              ),
              value: data?.viewer?.now?.visited || 0,
              layout: responsive ? 'horizontal' : 'vertical',
              description: (
                <Statistic title="今日新增" value={data?.viewer?.add?.visited || 0} trend="up" />
              ),
            }}
          />
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              title: (
                <TipTitle
                  title="总访问数"
                  tip="以每一次页面的访问及跳转为衡量标准计算全站的访问数量"
                />
              ),
              layout: responsive ? 'horizontal' : 'vertical',
              value: data?.viewer?.now?.viewer || 0,
              description: (
                <Statistic title="今日新增" value={data?.viewer?.add?.viewer || 0} trend="up" />
              ),
            }}
          />
        </ProCard>
        <ProCard
          bordered={responsive ? false : true}
          split={responsive ? 'horizontal' : 'vertical'}
          ghost={responsive ? true : false}
        >
          <StatisticCard
            style={{ marginBottom: responsive ? 8 : 0 }}
            colSpan={!responsive ? 12 : 24}
            className={style['card-full-title']}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>访客数趋势图</div>
                <NumSelect d="天" value={num} setValue={setNum} />
              </div>
            }
            chart={<Area yField="访客数" {...eachConfig} />}
          />

          <StatisticCard
            colSpan={!responsive ? 12 : 24}
            className={style['card-full-title']}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>访问量趋势图</div>
                <NumSelect d="天" value={num} setValue={setNum} />
              </div>
            }
            chart={<Area yField="访问量" {...eachConfig} />}
          />
        </ProCard>
        <ProCard
          bordered={responsive ? false : true}
          split={responsive ? 'horizontal' : 'vertical'}
          ghost={responsive ? true : false}
        >
          <StatisticCard
            style={{ marginBottom: responsive ? 8 : 0 }}
            colSpan={!responsive ? 12 : 24}
            className={style['card-full-title']}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>总访客数趋势图</div>
                <NumSelect d="天" value={num} setValue={setNum} />
              </div>
            }
            chart={<Area yField="访客数" {...lineConfig} />}
          />

          <StatisticCard
            colSpan={!responsive ? 12 : 24}
            className={style['card-full-title']}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>总访问量趋势图</div>
                <NumSelect d="天" value={num} setValue={setNum} />
              </div>
            }
            chart={<Area yField="访问量" {...lineConfig} />}
          />
        </ProCard>
      </Spin>
    </RcResizeObserver>
  );
};

export default OverView;
