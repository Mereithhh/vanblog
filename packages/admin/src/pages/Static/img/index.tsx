import CopyUploadBtn from '@/components/CopyUploadBtn';
import UploadBtn from '@/components/UploadBtn';
import { getImgs } from '@/services/van-blog/api';
import { writeClipBoardText } from '@/services/van-blog/clipboard';
import { useNum } from '@/services/van-blog/useNum';
import { PageContainer } from '@ant-design/pro-components';
import { Image, message, Pagination, Space, Spin } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';
import { StaticItem } from '../type';
const errorImg =
  'data:image/png;base64,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';
const ImgPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useNum(1, 'static-img-page');
  const [pageSize, setPageSize] = useNum(10, 'static-img-page-size');
  const [responsive, setResponsive] = useState(false);
  const { initialState } = useModel('@@initialState');
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await getImgs(page, pageSize as number);
      setTotal(res.total || 0);
      setData(res.data);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setData, page, pageSize, setTotal, setLoading]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer
      extra={
        <Space>
          <CopyUploadBtn
            setLoading={setLoading}
            onError={() => {
              message.error('剪切板无图片！');
            }}
            text="剪切板上传"
            onFinish={(data) => {
              if (data.isNew) {
                message.success(`剪切板图片上传成功!`);
              } else {
                message.warning(`剪切板图片已存在!`);
              }
              writeClipBoardText(`${initialState?.baseUrl}/static/${data.src}`).then((res) => {
                if (res) {
                  message.success('已复制图片链接到剪切板！');
                } else {
                  message.error('复制链接到剪切板失败！');
                }
              });
              fetchData();
            }}
            url="/api/admin/img/upload"
            accept=".png,.jpg,.jpeg,.webp,.jiff"
          />
          <UploadBtn
            setLoading={setLoading}
            muti={true}
            text="上传图片"
            onFinish={(info) => {
              if (info?.response?.data?.isNew) {
                message.success(`${info.name} 上传成功!`);
              } else {
                message.warning(`${info.name} 已存在!`);
              }
              writeClipBoardText(
                `${initialState?.baseUrl}/static/${info?.response?.data?.src}`,
              ).then((res) => {
                if (res) {
                  message.success('已复制图片链接到剪切板！');
                } else {
                  message.error('复制链接到剪切板失败！');
                }
              });
              fetchData();
            }}
            url="/api/admin/img/upload"
            accept=".png,.jpg,.jpeg,.webp,.jiff"
          />
        </Space>
      }
    >
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setResponsive(offset.width < 500);
        }}
      >
        <Spin spinning={loading}>
          <Image.PreviewGroup>
            <Space align="start" wrap>
              {data.map((item: StaticItem) => {
                return (
                  <div
                    key={item.sign}
                    style={{
                      height: responsive ? 150 : 200,
                      width: responsive ? 150 : 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      fallback={errorImg}
                      style={{
                        maxHeight: responsive ? 150 : 200,
                        maxWidth: responsive ? 150 : 200,
                      }}
                      width={'auto'}
                      height={'auto'}
                      src={`/static/img/${item.name}`}
                    />
                  </div>
                );
              })}
            </Space>
          </Image.PreviewGroup>
          <Pagination
            style={{ marginTop: 20, textAlign: 'right' }}
            hideOnSinglePage={true}
            current={page as number}
            pageSize={pageSize as number}
            onChange={(p, ps) => {
              if (ps != pageSize) {
                (setPageSize as any)(ps);
              }
              if (p != page) {
                (setPage as any)(p);
              }
            }}
            total={total}
          />
        </Spin>
      </RcResizeObserver>
    </PageContainer>
  );
};

export default ImgPage;
