import CopyUploadBtn from '@/components/CopyUploadBtn';
import ObjTable from '@/components/ObjTable';
import UploadBtn from '@/components/UploadBtn';
import { deleteAllIMG, deleteImgBySign, getImgs } from '@/services/van-blog/api';
import { useNum } from '@/services/van-blog/useNum';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Empty, Image, message, Modal, Pagination, Space, Spin } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { useModel } from 'umi';
import TipTitle from '../../../components/TipTitle';
import { useTab } from '../../../services/van-blog/useTab';
import { StaticItem } from '../type';
import { copyImgLink, downloadImg, mergeMetaInfo } from './tools';

const MENU_ID = 'static-img';
const errorImg =
  'data:image/png;base64,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';
const ImgPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useTab(1, 'page');
  const [pageSize, setPageSize] = useNum(10, 'static-img-page-size');
  const [responsive, setResponsive] = useState(false);
  const { initialState } = useModel('@@initialState');
  const [clickItem, setClickItem] = useState<StaticItem>();
  const { show } = useContextMenu({
    id: MENU_ID,
  });
  async function deleteImg(sign: string) {
    try {
      setLoading(true);
      await deleteImgBySign(clickItem.sign);
      setLoading(false);
      message.success('删除成功！');
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
              <ObjTable obj={mergeMetaInfo(initialState?.baseUrl || '', clickItem)} />
            </div>
          ),
        });
        break;
      case 'copy':
        copyImgLink(initialState?.baseUrl, `${clickItem.staticType}/${clickItem.name}`);
        break;
      case 'copyMarkdown':
        copyImgLink(initialState?.baseUrl, `${clickItem.staticType}/${clickItem.name}`, true);
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
        downloadImg(clickItem.name, `/static/${clickItem.staticType}/${clickItem.name}`);
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
              if (data.isNew) {
                message.success(`剪切板图片上传成功!`);
              } else {
                message.warning(`剪切板图片已存在!`);
              }
              copyImgLink(initialState?.baseUrl, data.src);

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
              copyImgLink(initialState?.baseUrl, info?.response?.data?.src);
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
          {data.length == 0 && (
            <Empty description="暂无图片，快上传呀~" style={{ marginTop: 100 }} />
          )}
          <Image.PreviewGroup>
            <Space align="start" wrap>
              {data.map((item: StaticItem) => {
                return (
                  <div
                    onContextMenu={(e) => {
                      displayMenu(e, item);
                    }}
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
      <Menu id={MENU_ID}>
        <Item onClick={handleItemClick} data="copy">
          复制链接
        </Item>
        <Item onClick={handleItemClick} data="copyMarkdown">
          复制 Markdown 链接
        </Item>
        <Separator />
        <Item onClick={handleItemClick} data="download">
          下载
        </Item>
        <Item onClick={handleItemClick} data="delete">
          删除
        </Item>
        <Separator />
        <Item onClick={handleItemClick} data="info">
          信息
        </Item>
      </Menu>
    </PageContainer>
  );
};

export default ImgPage;
