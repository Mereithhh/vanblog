import NewArticleModal from '@/components/NewArticleModal';
import { getArticlesByOption } from '@/services/van-blog/api';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef } from 'react';
import { columns } from './columns';
import { history } from 'umi';

export default () => {
  const actionRef = useRef();
  return (
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
        onChange(value) {},
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
        span: 8,
      }}
      pagination={{
        pageSize: 5,
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
  );
};
