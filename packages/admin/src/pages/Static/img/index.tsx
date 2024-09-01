import CopyUploadBtn from '@/components/CopyUploadBtn';
import ObjTable from '@/components/ObjTable';
import UploadBtn from '@/components/UploadBtn';
import {
  deleteAllIMG,
  deleteImgBySign,
  getImgs,
  searchArtclesByLink,
} from '@/services/van-blog/api';
import { useNum } from '@/services/van-blog/useNum';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Empty, Image, message, Modal, Pagination, Space, Spin, Table } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { createPortal } from 'react-dom';
import { history, useModel } from 'umi';
import TipTitle from '../../../components/TipTitle';
import { useTab } from '../../../services/van-blog/useTab';
import type { StaticItem } from '../type';
import { copyImgLink, downloadImg, getImgLink, mergeMetaInfo } from './tools';
const MENU_ID = 'static-img';
export const errorImg =
  'data:image/png;base64,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';

function Portal({ children }) {
  return createPortal(children, document.querySelector('#root'));
}

const ImgPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useTab(1, 'page');
  const [responsive, setResponsive] = useState(false);
  const [pageSize, setPageSize] = useNum(responsive ? 9 : 15, 'static-img-page-size');
  const [clickItem, setClickItem] = useState<StaticItem>();
  const { initialState } = useModel('@@initialState');

  const showDelBtn = useMemo(() => {
    if (!initialState?.user) {
      return false;
    }
    if (initialState?.user?.id == 0) {
      return true;
    } else {
      const ps = initialState?.user?.permissions;
      if (!ps || ps.length == 0) {
        return false;
      } else {
        if (ps.includes('img:delete') || ps.includes('all')) {
          return true;
        }
        return false;
      }
    }
  }, [initialState]);

  const { show } = useContextMenu({
    id: MENU_ID,
  });
  async function deleteImg(sign: string) {
    try {
      setLoading(true);
      await deleteImgBySign(clickItem.sign);
      setLoading(false);
      message.success(
        `删除成功！${
          clickItem.storageType == 'picgo' ? '但是 OSS 存储中并未删除哦' : '已彻底删除'
        }`,
      );
    } catch (err) {
      message.error('删除失败！');
    }
    fetchData();
  }
  async function handleItemClick({ event, props, triggerEvent, data }) {
    switch (data) {
      case 'info':
        Modal.info({
          title: '图片信息',
          content: (
            <div>
              <ObjTable obj={mergeMetaInfo(clickItem)} />
            </div>
          ),
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
          onOk: () => {
            deleteImg(clickItem.sign);
          },
        });
        break;
      case 'download':
        downloadImg(clickItem.name, clickItem.realPath);
        break;
      case 'searchByLink':
        const { data } = await searchArtclesByLink(getImgLink(clickItem.realPath));
        Modal.info({
          title: '被引用文章',

          content: (
            <Table
              pagination={{
                hideOnSinglePage: true,
              }}
              rowKey={'id'}
              dataSource={data || []}
              size="small"
              columns={[
                { title: '文章 ID', dataIndex: 'id', key: 'id' },
                { title: '标题', dataIndex: 'title', key: 'title' },
                {
                  title: '操作',
                  key: 'action',
                  render: (val, record) => {
                    return (
                      <a
                        key={'editable' + record.id}
                        onClick={() => {
                          history.push(`/editor?type=${'article'}&id=${record.id}`);
                        }}
                      >
                        编辑
                      </a>
                    );
                  },
                },
              ]}
            />
          ),
        });
        // console.log(data);
        break;
    }
  }

  function displayMenu(e, item: StaticItem) {
    // put whatever custom logic you need
    // you can even decide to not display the Menu
    setClickItem(item);

    show(e);
  }
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
  const showDelAllBtn = useMemo(() => {
    if (initialState?.version && initialState?.version == 'dev') {
      return true;
    }
    return false;
  }, [initialState]);
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
      extra={
        <Space>
          {showDelAllBtn && (
            <Button
              danger
              onClick={async () => {
                Modal.confirm({
                  title: '【DEV ONLY】确定删除所有图片吗？删除后不可恢复！',
                  onOk: async () => {
                    await deleteAllIMG();
                    fetchData();
                    message.success('全部删除！');
                  },
                });
              }}
            >
              全部删除
            </Button>
          )}

          <CopyUploadBtn
            setLoading={setLoading}
            onError={() => {
              message.error('剪切板无图片！');
            }}
            text="剪切板上传"
            onFinish={(data) => {
              copyImgLink(
                data.src,
                true,
                data.isNew ? '剪切板图片上传成功! ' : '剪切板图片已存在! ',
                false,
              );

              fetchData();
            }}
            url="/api/admin/img/upload?withWaterMark=true"
            accept=".png,.jpg,.jpeg,.webp,.jiff,.gif"
          />
          <UploadBtn
            setLoading={setLoading}
            muti={true}
            text="上传图片"
            onFinish={(info) => {
              copyImgLink(
                info?.response?.data?.src,
                true,
                info?.response?.data?.isNew ? `${info.name} 上传成功! ` : `${info.name} 已存在! `,
                false,
              );

              fetchData();
            }}
            url="/api/admin/img/upload?withWaterMark=true"
            accept=".png,.jpg,.jpeg,.webp,.jiff,.gif"
          />
        </Space>
      }
    >
      <Portal>
        <Menu id={MENU_ID}>
          <Item onClick={handleItemClick} data="copy">
            复制链接
          </Item>
          <Item onClick={handleItemClick} data="copyMarkdown">
            复制 Markdown 链接
          </Item>
          <Item onClick={handleItemClick} data="copyMarkdownAbsolutely">
            复制完整 Markdown 链接
          </Item>
          <Separator />
          <Item onClick={handleItemClick} data="download">
            下载
          </Item>
          {showDelBtn && (
            <Item onClick={handleItemClick} data="delete">
              删除
            </Item>
          )}
          <Separator />
          <Item onClick={handleItemClick} data="info">
            信息
          </Item>
          <Item onClick={handleItemClick} data="searchByLink">
            搜索引用文章
          </Item>
        </Menu>
      </Portal>

      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          if (offset.width <= 601) {
            (setPageSize as any)(9);
          } else {
            (setPageSize as any)(15);
          }
          setResponsive(offset.width < 601);
        }}
      >
        <Spin spinning={loading}>
          {data.length == 0 && (
            <Empty description="暂无图片，快上传呀~" style={{ marginTop: 100 }} />
          )}
          <Image.PreviewGroup>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${responsive ? 3 : 5}, ${
                  responsive ? '30%' : '18.5%'
                })`,
                gridAutoRows: 'auto',
                gridGap: '10px 10px',
                justifyItems: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              {data.map((item: StaticItem) => {
                return (
                  <div
                    onContextMenu={(e) => {
                      displayMenu(e, item);
                    }}
                    key={item.sign + item.realPath}
                    // className="hover-gray"
                    style={{
                      // height: responsive ? 150 : 200,
                      // width: responsive ? 150 : 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <Image
                      fallback={errorImg}
                      // style={{
                      //   maxHeight: responsive ? 150 : 200,
                      //   maxWidth: responsive ? 150 : 200,
                      // }}
                      style={{ maxHeight: '200px' }}
                      width={'auto'}
                      height={'auto'}
                      src={`${item.realPath}`}
                    />
                  </div>
                );
              })}
            </div>
          </Image.PreviewGroup>
          <Pagination
            style={{ marginTop: 20, textAlign: 'right' }}
            hideOnSinglePage={true}
            current={page as number}
            showSizeChanger={false}
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
