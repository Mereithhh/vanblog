import { PageContainer } from '@ant-design/pro-layout';
import { StatisticCard } from '@ant-design/pro-components';
import { Button, Space, Spin } from 'antd';
import { Area } from '@ant-design/plots';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWelcomeData } from '@/services/van-blog/api';
const { Statistic } = StatisticCard;

const Welcome = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    const { data: res } = await getWelcomeData();
    setData(res);
  }, [setData]);
  useEffect(() => {
    setLoading(true);
    fetchData().then(() => {
      setLoading(false);
    });
  }, [fetchData, setLoading]);
  const showCommentBtn = useMemo(() => {
    const url = data?.link?.walineServerUrl;
    if (!url || url == '') {
      return false;
    }
    return true;
  }, [data]);

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
    <PageContainer
      title={'Hi，今天写了没？'}
      extra={
        <Space>
          {showCommentBtn && (
            <Button
              type="primary"
              onClick={() => {
                const urlRaw = data?.link?.walineServerUrl || '';
                if (urlRaw == '') {
                  return;
                }
                const u = new URL(urlRaw).toString();
                window.open(`${u}ui`, '_blank');
              }}
            >
              评论管理
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => {
              const urlRaw = data?.link?.baseUrl || '';
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
      </Spin>

      {/* </Card> */}
    </PageContainer>
  );
};

export default Welcome;
