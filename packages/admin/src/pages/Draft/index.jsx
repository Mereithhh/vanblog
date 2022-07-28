import NewDraftModal from '@/components/NewDraftModal';
import { mutiSearch } from '@/services/van-blog/search';
import { ProTable } from '@ant-design/pro-components';
import moment from 'moment';
import { useRef } from 'react';
import { useModel } from 'umi';
import { columns } from './columes';

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
        data = data.drafts;
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
        }
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
      headerTitle="草稿管理"
      toolBarRender={() => [
        <NewDraftModal
          key="newDraft123"
          onFinish={() => {
            actionRef?.current?.reload();
          }}
        />,
      ]}
    />
  );
};
