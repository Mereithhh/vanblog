import NewArticleModal from '@/components/NewArticleModal';
import { getArticlesByOption } from '@/services/van-blog/api';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import { articleObjAll, articleObjSmall, columns } from './columns';
import { history } from 'umi';
import RcResizeObserver from 'rc-resize-observer';

export default () => {
  const actionRef = useRef();
  const [colKeys, setColKeys] = useState(articleObjAll);
  const [simplePage, setSimplePage] = useState(false);

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        const r = offset.width < 1000;
        setSimplePage(offset.width < 600);
        if (r) {
          setColKeys(articleObjSmall);
        } else {
          setColKeys(articleObjAll);
        }
        //  小屏幕的话把默认的 col keys 删掉一些
      }}
    >
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
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
          if (sort.viewer) {
            if (sort.viewer == 'ascend') {
              option.sortViewer = 'asc';
            } else {
              option.sortViewer = 'desc';
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
          const { data } = await getArticlesByOption(option);
          const { articles, total } = data;
          return {
            data: articles,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: Boolean(data),
            // 不传会使用 data 的长度，如果是分页一定要传
            total: total,
          };
        }}
        editable={false}
        columnsState={{
          persistenceKey: 'van-blog-article-table',
          persistenceType: 'localStorage',
          value: colKeys,
          onChange(value) {
            setColKeys(value);
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          span: 8,
        }}
        pagination={{
          pageSize: 5,
          simple: simplePage,
        }}
        dateFormatter="string"
        headerTitle={
          <span>
            <span>文章管理</span>
          </span>
        }
        toolBarRender={() => [
          <Button
            key="editAboutMe"
            onClick={() => {
              history.push(`/editor?type=about&id=${0}`);
            }}
          >
            {`编辑关于`}
          </Button>,
          <NewArticleModal
            key="newArticle123"
            onFinish={() => {
              actionRef?.current?.reload();
            }}
          />,
        ]}
      />
    </RcResizeObserver>
  );
};
