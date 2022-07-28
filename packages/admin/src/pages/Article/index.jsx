import NewArticleModal from '@/components/NewArticleModal';
import { mutiSearch } from '@/services/van-blog/search';
import { ProTable } from '@ant-design/pro-components';
import moment from 'moment';
import { useRef } from 'react';
import { useModel } from 'umi';
import { columns } from './columns';

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const actionRef = useRef();
  return (
    <ProTable
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params = {}, sort, filter) => {
        // console.log(sort, filter);

        let data = await initialState?.fetchInitData?.();
        await setInitialState((s) => ({ ...s, ...data }));
        data = data.articles;
        // 排序
        if (sort && sort.createdAt) {
          if (sort.createdAt == 'ascend') {
            data = data.sort((a, b) => {
              return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            });
          } else {
            data = data.sort((a, b) => {
              return moment(b.createdAt).unix() - moment(a.createdAt).unix();
            });
          }
        } else if (sort && sort.top) {
          data = data.sort((a, b) => {
            const atop = a.top || 0;
            const btop = b.top || 0;
            const r = btop - atop;
            if (r != 0) {
              return r;
            } else {
              return moment(b.createdAt).unix() - moment(a.createdAt).unix();
            }
          });
        } else {
          data = data.sort((a, b) => {
            return moment(b.createdAt).unix() - moment(a.createdAt).unix();
          });
        }
        const about = data.filter((a) => a.id == 0);
        const notAbout = data.filter((a) => a.id != 0);
        data = [...about, ...notAbout];

        // 搜索

        const { current, pageSize, ...searchObj } = params;
        if (searchObj) {
          for (const [targetName, target] of Object.entries(searchObj)) {
            switch (targetName) {
              case 'title':
                if (target != '') {
                  data = data.filter((eachRecord) => {
                    return mutiSearch(eachRecord.title, target);
                  });
                }
                break;
              case 'tags':
                if (target != '') {
                  console.log(target);
                  data = data.filter((eachRecord) => {
                    if (!eachRecord.tags || eachRecord.tags.length == 0) {
                      return false;
                    }
                    return eachRecord.tags.some((eachTag) => mutiSearch(eachTag, target));
                  });
                }
                break;
              case 'endTime':
                data = data.filter((eachRecord) => {
                  const t = moment(eachRecord.createdAt);
                  const t0 = moment(searchObj?.startTime);
                  const t1 = moment(searchObj?.endTime);
                  return t.isBetween(t0, t1, 'day', '[]');
                });
                break;
              case 'category':
                data = data.filter((eachRecord) => {
                  return mutiSearch(eachRecord.category, target);
                });
                break;
            }
          }
        }

        return {
          data,
          // success 请返回 true，
          // 不然 table 会停止解析数据，即使有数据
          success: Boolean(data),
          // 不传会使用 data 的长度，如果是分页一定要传
          total: data?.articles?.length,
        };
      }}
      editable={false}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        onChange(value) {},
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
        span: 6,
      }}
      pagination={{
        pageSize: 5,

        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="文章管理"
      toolBarRender={() => [
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
