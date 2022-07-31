import { StatisticCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { getWelcomeData } from '@/services/van-blog/api';
import style from '../index.less';
import NumSelect from '@/components/NumSelect';
import { Pie, Column } from '@ant-design/plots';
import { useNum } from '@/services/van-blog/useNum';

const ArticleTab = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [num, setNum] = useNum(5);
  const fetchData = useCallback(async () => {
    const { data: res } = await getWelcomeData('article', 5, 5, num);
    setData(res);
  }, [setData, num]);
  useEffect(() => {
    setLoading(true);
    fetchData().then(() => {
      setLoading(false);
    });
  }, [fetchData, setLoading]);
  const pieConfig = {
    data: data?.categoryPieData || [],
    // appendPadding: 10,
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };
  const columnConfig = {
    data: data?.columnData || [],
    xField: 'type',
    yField: 'value',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
    },
    color: () => {
      return '#1772B4';
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {
        alias: '标签名',
      },
      value: {
        alias: '文章数量',
      },
    },
  };
  return (
    <Spin spinning={loading}>
      <StatisticCard.Group>
        <StatisticCard
          statistic={{
            title: '文章数',
            value: data?.articleNum || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总字数',
            value: data?.wordNum || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '分类数',
            value: data?.categoryNum || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: '标签数',
            value: data?.tagNum || 0,
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group style={{ marginTop: -20 }}>
        <StatisticCard
          className={style['card-full-title']}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>分类饼图</div>
            </div>
          }
          chart={
            <div style={{ marginTop: -30 }}>
              <Pie {...pieConfig} />
            </div>
          }
        />
      </StatisticCard.Group>
      <StatisticCard.Group style={{ marginTop: -40 }}>
        <StatisticCard
          className={style['card-full-title']}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>标签文章数 TOP 柱状图</div>
              <NumSelect d="条" value={num} setValue={setNum} />
            </div>
          }
          chart={
            <div style={{ marginTop: -10 }}>
              <Column {...columnConfig} />
            </div>
          }
        />
      </StatisticCard.Group>
    </Spin>
  );
};

export default ArticleTab;
