import { StatisticCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { Area } from '@ant-design/plots';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWelcomeData } from '@/services/van-blog/api';
import PowerIcon from '@/components/PowerIcon';
import moment from 'moment';
import ArticleList from '@/components/ArticleList';
import { getRecentTimeDes } from '@/services/van-blog/tool';
import { Link, history } from 'umi';
const { Statistic } = StatisticCard;

const Viewer = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    const { data: res } = await getWelcomeData('viewer');
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
  const recentHref = useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data?.siteLastVisitedPathname) {
      return undefined;
    }
    return data?.siteLastVisitedPathname;
  }, [data]);
  const recentVisitTime = useMemo(() => {
    if (!data) {
      return '-';
    }
    if (!data.siteLastVisitedTime) {
      return '-';
    }
    return getRecentTimeDes(data?.siteLastVisitedTime);
  }, [data]);

  return (
    <Spin spinning={loading}>
      <StatisticCard.Group>
        <StatisticCard
          statistic={{
            title: (
              <a
                href="https://tongji.baidu.com/main/homepage/"
                className="ua blue"
                target="_blank"
                rel="noreferrer"
              >
                百度统计
              </a>
            ),
            formatter: () => {
              if (data?.enableBaidu) {
                return <span>已开启</span>;
              } else {
                return <Link to="/site?tab=siteInfo">未配置</Link>;
              }
            },
            status: data?.enableBaidu ? 'success' : 'error',
          }}
        />
        <StatisticCard
          statistic={{
            title: (
              <a
                href="https://analytics.google.com/analytics/web/"
                className="ua blue"
                target="_blank"
                rel="noreferrer"
              >
                谷歌分析
              </a>
            ),
            formatter: () => {
              if (data?.enableGA) {
                return <span>已开启</span>;
              } else {
                return <Link to="/site?tab=siteInfo">未配置</Link>;
              }
            },
            status: data?.enableGA ? 'success' : 'error',
          }}
        />
        <StatisticCard
          statistic={{
            title: '最近访问',
            value: recentVisitTime,
          }}
        />
        <StatisticCard
          statistic={{
            title: '最近访问路径',
            formatter: (val) => {
              return (
                <a className="ua blue" target="_blank" rel="noreferrer" href={recentHref}>
                  {data?.siteLastVisitedPathname || '-'}
                </a>
              );
            },
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group>
        <StatisticCard
          title="最近访问 TOP"
          chart={
            <div style={{ marginTop: -14 }}>
              <ArticleList showRecentViewTime articles={data?.recentVisitArticles || []} />
            </div>
          }
        />
        <StatisticCard
          title="文章访问量 TOP"
          chart={
            <div style={{ marginTop: -14 }}>
              <ArticleList showViewerNum articles={data?.topViewer || []} />
            </div>
          }
        />
      </StatisticCard.Group>
    </Spin>
  );
};

export default Viewer;
