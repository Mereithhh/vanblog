import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { publishDraft } from '@/services/van-blog/api';
export default function (props) {
  const { title, id, trigger, action } = props;
  return (
    <>
      <ModalForm
        title={`发布草稿: ${title}`}
        key="publishModal"
        trigger={trigger}
        width={450}
        autoFocusFirstInput
        submitTimeout={3000}
        onFinish={async (values) => {
          await publishDraft(id, values);
          if (action && action.reload) {
            action.reload();
          }
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
      >
        <ProFormSelect
          width="md"
          name="private"
          id="private"
          label="是否加密"
          placeholder="是否加密"
          request={async () => {
            return [
              {
                label: '否',
                value: false,
              },
              {
                label: '是',
                value: true,
              },
            ];
          }}
        />
        <ProFormText
          label="置顶优先级"
          width="md"
          id="top"
          name="top"
          placeholder="留空或0表示不置顶，其余数字越大表示优先级越高"
        />
        <ProFormText.Password
          label="密码"
          width="md"
          id="password"
          name="password"
          placeholder="请输入密码"
          dependencies={['private']}
        />
        <ProFormSelect
          width="md"
          name="hidden"
          id="hidden"
          label="是否隐藏"
          placeholder="是否隐藏"
          request={async () => {
            return [
              {
                label: '否',
                value: false,
              },
              {
                label: '是',
                value: true,
              },
            ];
          }}
        />
      </ModalForm>
    </>
  );
}
