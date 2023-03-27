import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWelcomeData } from '@/services/van-blog/api';
import ArticleList from '@/components/ArticleList';
import { getRecentTimeDes } from '@/services/van-blog/tool';
import { Link } from 'umi';
import TipTitle from '@/components/TipTitle';
import style from '../index.less';
import NumSelect from '@/components/NumSelect';
import { useNum } from '@/services/van-blog/useNum';
import RcResizeObserver from 'rc-resize-observer';

const Viewer = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [responsive, setResponsive] = useState(false);
  const [num, setNum] = useNum(5);
  const fetchData = useCallback(async () => {
    const { data: res } = await getWelcomeData('viewer', 5, num);
    setData(res);
  }, [setData, num]);
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
              layout: responsive ? 'horizontal' : 'vertical',
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
                  return <Link to={`/admin/site/setting?siteInfoTab=more`}>未配置</Link>;
                }
              },
              status: data?.enableBaidu ? 'success' : 'error',
            }}
          />
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
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
                  return <Link to={`/admin/site/setting?siteInfoTab=more`}>未配置</Link>;
                }
              },
              status: data?.enableGA ? 'success' : 'error',
            }}
          />
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
              title: '最近访问',
              value: recentVisitTime,
            }}
          />
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
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
        </ProCard>
        <ProCard
          split={responsive ? 'horizontal' : 'vertical'}
          bordered
          style={{ marginBottom: responsive ? 8 : 0 }}
        >
          <StatisticCard
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
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
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
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
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
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
            colSpan={responsive ? 24 : 6}
            statistic={{
              layout: responsive ? 'horizontal' : 'vertical',
              title: (
                <TipTitle
                  title="单篇最高访问量"
                  tip="以每一次页面的访问及跳转为衡量标准计算出单篇文章最高的访问量"
                />
              ),
              value: data?.maxArticleViewer || 0,
            }}
          />
        </ProCard>
        <ProCard
          split={responsive ? 'horizontal' : 'vertical'}
          bordered={responsive ? false : true}
          ghost={responsive ? true : false}
          style={{ marginBottom: responsive ? 8 : 0 }}
        >
          <ProCard
            ghost
            colSpan={responsive ? 24 : 12}
            style={{ marginBottom: responsive ? 8 : 0 }}
          >
            <StatisticCard
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>最近访问TOP</div>
                  <NumSelect d="条" value={num} setValue={setNum} />
                </div>
              }
              className={style['card-full-title']}
              chart={
                <div style={{ marginTop: -14 }}>
                  <ArticleList showRecentViewTime articles={data?.recentVisitArticles || []} />
                </div>
              }
            />
          </ProCard>
          <ProCard ghost colSpan={responsive ? 24 : 12}>
            <StatisticCard
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>文章访问量TOP</div>
                  <NumSelect d="条" value={num} setValue={setNum} />
                </div>
              }
              className={style['card-full-title']}
              chart={
                <div style={{ marginTop: -14 }}>
                  <ArticleList showViewerNum articles={data?.topViewer || []} />
                </div>
              }
            />
          </ProCard>
        </ProCard>
      </Spin>
    </RcResizeObserver>
  );
};

export default Viewer;
