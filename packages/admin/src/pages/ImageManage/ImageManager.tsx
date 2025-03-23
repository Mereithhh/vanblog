import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Modal, message, Spin, Empty } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useModel } from '@/utils/umiCompat';
import { useTab } from '@/services/van-blog/useTab';
import { useNum } from '@/services/van-blog/useNum';
import TipTitle from '@/components/TipTitle';
import ObjTable from '@/components/ObjTable';
import { ImageGrid } from './components/ImageGrid';
import { PaginationComponent } from './components/Pagination';
import { ActionButtons } from './components/ActionButtons';
import { ContextMenuPortal } from './components/ContextMenuPortal';
import { StaticItem } from './types';
import 'react-contexify/dist/ReactContexify.css';
import './index.less';

import {
  deleteAllIMG,
  deleteImgBySign,
  getImgs,
  searchArtclesByLink,
} from '@/services/van-blog/api';
import { mergeMetaInfo, copyImgLink, downloadImg, getImgLink } from './components/tools';

const ImageManager: React.FC = () => {
  // State management
  const [data, setData] = useState<StaticItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useTab(1, 'page');
  const [responsive, setResponsive] = useState(false);
  const [clickItem, setClickItem] = useState<StaticItem>();
  
  // Using useNum hook with proper typing
  const [pageSize, setPageSize] = useNum(responsive ? 9 : 15, 'static-img-page-size');
  
  const { initialState } = useModel();

  // Permission checks
  const showDelBtn = useMemo(() => {
    if (!initialState?.user) return false;
    if (initialState.user.id === 0) return true;
    
    const ps = initialState.user?.permissions;
    if (!ps || ps.length === 0) return false;
    
    return ps.includes('img:delete') || ps.includes('all');
  }, [initialState]);

  const showDelAllBtn = useMemo(() => {
    return initialState?.version === 'dev';
  }, [initialState]);

  // Data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await getImgs(page, pageSize as number);
      setTotal(res.total || 0);
      setData(res.data || []);
    } catch (err) {
      message.error('获取图片失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Context menu handler
  const handleItemClick = useCallback(({ data: action }: { data: string }) => {
    if (!clickItem) return;

    switch (action) {
      case 'info':
        Modal.info({
          title: '图片信息',
          content: <ObjTable obj={mergeMetaInfo(clickItem)} />,
        });
        break;
      case 'copy':
        copyImgLink(clickItem.realPath);
        break;
      case 'copyMarkdown':
        copyImgLink(clickItem.realPath, true, undefined, false);
        break;
      case 'copyMarkdownAbsolutely':
        copyImgLink(clickItem.realPath, true, undefined, true);
        break;
      case 'delete':
        Modal.confirm({
          title: '确定删除该图片吗？删除后不可恢复！',
          onOk: async () => {
            try {
              setLoading(true);
              await deleteImgBySign(clickItem.sign);
              setLoading(false);
              message.success(
                `删除成功！${
                  clickItem.storageType === 'picgo' ? '但是 OSS 存储中并未删除哦' : '已彻底删除'
                }`
              );
              fetchData();
            } catch (err) {
              setLoading(false);
              message.error('删除失败！');
            }
          },
        });
        break;
      case 'download':
        downloadImg(clickItem.name, clickItem.realPath);
        break;
      case 'searchByLink':
        searchArtclesByLink(getImgLink(clickItem.realPath))
          .then(({ data }) => {
            Modal.info({
              title: '被引用文章',
              content: (
                <table className="referenceTable">
                  <thead>
                    <tr>
                      <th>文章 ID</th>
                      <th>标题</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data || []).map((record: any) => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.title}</td>
                        <td>
                          <a
                            onClick={() => {
                              window.location.href = `/editor?type=article&id=${record.id}`;
                            }}
                          >
                            编辑
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ),
            });
          });
        break;
      default:
        break;
    }
  }, [clickItem, fetchData]);

  // Display menu method
  const displayMenu = useCallback((e: React.MouseEvent, item: StaticItem) => {
    setClickItem(item);
    // The show function is handled by the ContextMenuPortal component
  }, []);

  // Page change handler
  const handlePageChange = useCallback((p: number, ps: number) => {
    if (ps !== pageSize) {
      if (typeof setPageSize === 'function') {
        setPageSize(ps);
      }
    }
    if (p !== page) {
      setPage(p);
    }
  }, [page, pageSize, setPage, setPageSize]);

  return (
    <PageContainer
      className="t-0"
      header={{
        title: (
          <TipTitle
            title="图片管理"
            tip="设置页可更改图片存储方式。对着图片点右键可解锁更多操作哦"
          />
        ),
      }}
      extra={<ActionButtons setLoading={setLoading} fetchData={fetchData} showDelAllBtn={showDelAllBtn} />}
    >
      <ContextMenuPortal clickItem={clickItem} showDelBtn={showDelBtn} handleItemClick={handleItemClick} />

      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          const isSmall = offset.width <= 601;
          setResponsive(isSmall);
          if (isSmall !== responsive && typeof setPageSize === 'function') {
            setPageSize(isSmall ? 9 : 15);
          }
        }}
      >
        <Spin spinning={loading}>
          {(!data || data.length === 0) && (
            <Empty description="暂无图片，快上传呀~" style={{ marginTop: 100 }} />
          )}
          
          {data && data.length > 0 && (
            <ImageGrid data={data} responsive={responsive} displayMenu={displayMenu} />
          )}
          
          <PaginationComponent
            page={page as number}
            pageSize={pageSize as number}
            total={total}
            handlePageChange={handlePageChange}
          />
        </Spin>
      </RcResizeObserver>
    </PageContainer>
  );
};

export default ImageManager; 