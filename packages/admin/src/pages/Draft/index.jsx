import ImportDraftModal from '@/components/ImportDraftModal';
import NewDraftModal from '@/components/NewDraftModal';
import { getDraftsByOption } from '@/services/van-blog/api';
import { useNum } from '@/services/van-blog/useNum';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';
import { useMemo, useRef, useState } from 'react';
import { history } from 'umi';
import { columns, draftKeysObj, draftKeysObjSmall } from './columes';
import { Button, Space, message } from 'antd';
import { batchExport, batchDelete } from '@/services/van-blog/batch';
export default () => {
  const actionRef = useRef();
  const [colKeys, setColKeys] = useState(draftKeysObj);
  const [simplePage, setSimplePage] = useState(false);
  const [simpleSearch, setSimpleSearch] = useState(false);
  const [pageSize, setPageSize] = useNum(10, 'draft-page-size');
  const searchSpan = useMemo(() => {
    if (!simpleSearch) {
      return 8;
    } else {
      return 24;
    }
  }, [simpleSearch]);
  return (
    <PageContainer
      title={null}
      extra={null}
      ghost
      header={{ title: null, extra: null, ghost: true }}
      className="t-8"
    >
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setSimpleSearch(offset.width < 750);
          const r = offset.width < 800;
          setSimplePage(offset.width < 600);
          if (r) {
            setColKeys(draftKeysObjSmall);
          } else {
            setColKeys(draftKeysObj);
          }
          //  小屏幕的话把默认的 col keys 删掉一些
        }}
      >
        <ProTable
          columns={columns}
          actionRef={actionRef}
          cardBordered
          rowSelection={{
            fixed: true,
            preserveSelectedRowKeys: true,
          }}
          tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => {
            return (
              <Space>
                <a
                  onClick={async () => {
                    await batchDelete(selectedRowKeys, true);
                    message.success('批量删除成功！');
                    actionRef.current.reload();
                    onCleanSelected();
                  }}
                >
                  批量删除
                </a>
                <a
                  onClick={() => {
                    batchExport(selectedRowKeys, true);
                    onCleanSelected();
                  }}
                >
                  批量导出
                </a>
                <a onClick={onCleanSelected}>取消选择</a>
              </Space>
            );
          }}
          request={async (params = {}, sort, filter) => {
            const option = {};
            if (sort.createdAt) {
              if (sort.createdAt == 'ascend') {
                option.sortCreatedAt = 'asc';
              } else {
                option.sortCreatedAt = 'desc';
              }
            }
            if (sort.top) {
              if (sort.top == 'ascend') {
                option.sortTop = 'asc';
              } else {
                option.sortTop = 'desc';
              }
            }

            // 搜索
            const { current, pageSize, ...searchObj } = params;
            if (searchObj) {
              for (const [targetName, target] of Object.entries(searchObj)) {
                switch (targetName) {
                  case 'title':
                    if (target.trim() != '') {
                      option.title = target;
                    }
                    break;
                  case 'tags':
                    if (target.trim() != '') {
                      option.tags = target;
                    }
                    break;
                  case 'endTime':
                    if (searchObj?.startTime) {
                      option.startTime = searchObj?.startTime;
                    }
                    if (searchObj?.endTime) {
                      option.endTime = searchObj?.endTime;
                    }
                    break;
                  case 'category':
                    if (target.trim() != '') {
                      option.category = target;
                    }
                    break;
                }
              }
            }
            option.page = current;
            option.pageSize = pageSize;
            const { data } = await getDraftsByOption(option);
            const { drafts, total } = data;

            return {
              data: drafts,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: Boolean(data),
              // 不传会使用 data 的长度，如果是分页一定要传
              total: total,
            };
          }}
          editable={false}
          columnsState={{
            // persistenceKey: 'van-blog-draft-table',
            // persistenceType: 'localStorage',
            value: colKeys,
            onChange(value) {
              setColKeys(value);
            },
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            className: 'searchCard',
            span: searchSpan,
          }}
          pagination={{
            pageSize: pageSize,
            onChange: (p, ps) => {
              if (ps != pageSize) {
                setPageSize(ps);
              }
            },
            simple: simplePage,
          }}
          dateFormatter="string"
          headerTitle={simpleSearch ? undefined : '草稿管理'}
          options={simpleSearch ? false : true}
          toolBarRender={() => [
            <NewDraftModal
              key="newDraft123"
              onFinish={(data) => {
                actionRef?.current?.reload();
                history.push(`/editor?type=draft&id=${data.id}`);
              }}
            />,
            <ImportDraftModal
              key="importDraftMarkdown"
              onFinish={() => {
                actionRef?.current?.reload();
                message.success('导入成功！');
              }}
            />,
          ]}
        />
      </RcResizeObserver>
    </PageContainer>
  );
};
