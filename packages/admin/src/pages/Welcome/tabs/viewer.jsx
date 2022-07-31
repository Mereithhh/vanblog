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
import TipTitle from '@/components/TipTitle';

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
                return <Link to={`/site?tab=siteInfo&subTab=more`}>未配置</Link>;
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
                return <Link to={`/site?tab=siteInfo&subTab=more`}>未配置</Link>;
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
      <StatisticCard.Group style={{ marginTop: -16 }}>
        <StatisticCard
          statistic={{
            title: (
              <TipTitle
                title="总访客数"
                tip="以浏览器内缓存的唯一标识符为衡量标准计算全站独立访客的数量"
              />
            ),
            value: data?.totalVisited || 0,
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
            value: data?.totalViewer || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: (
              <TipTitle
                title="单篇最高访客数"
                tip="以浏览器内缓存的唯一标识符为衡量标准计算出单篇文章最高的独立访客数"
              />
            ),
            value: data?.maxArticleVisited || 0,
          }}
        />
        <StatisticCard
          statistic={{
            title: (
              <TipTitle
                title="单篇最高访问量"
                tip="以每一次页面的访问及跳转为衡量标准计算出单篇文章最高的访问量"
              />
            ),
            value: data?.maxArticleViewer || 0,
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group style={{ marginTop: -10 }}>
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
