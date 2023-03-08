import { ProFormSelect } from '@ant-design/pro-form';
import { getAllCollaboratorsList } from '@/services/van-blog/api';

export default () => (
  <ProFormSelect
    width="md"
    id="author"
    name="author"
    label="作者"
    placeholder="不填默认为登录者本人"
    request={async () =>
      (await getAllCollaboratorsList())?.data?.map(({ name, nickname = name }) => ({
        label: nickname,
        value: nickname,
      })) || []
    }
  />
);
