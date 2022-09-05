import { getAllCollaboratorsList } from '@/services/van-blog/api';
import { ProFormSelect } from '@ant-design/pro-form';
export default function () {
  return (
    <>
      <ProFormSelect
        width="md"
        id="author"
        name="author"
        label="作者"
        placeholder="不填默认为登录者本人"
        request={async () => {
          const msg = await getAllCollaboratorsList();

          return (
            msg?.data?.map((item) => ({
              label: item.nickname || item.name,
              value: item.nickname || item.name,
            })) || []
          );
        }}
      />
    </>
  );
}
