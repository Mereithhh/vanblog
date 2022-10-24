import { publishDraft } from '@/services/van-blog/api';
import { Modal, ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
export default function (props) {
  const { title, id, trigger, action, onFinish } = props;
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
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({
              title: '演示站禁止新建文章！',
              content: '本来是可以的，但有个人在演示站首页放黄色信息，所以关了这个权限了。',
            });
            return;
          }
          await publishDraft(id, {
            ...values,
            password: values.pc,
            top: values.Ctop,
          });
          message.success('发布成功！');
          if (action && action.reload) {
            action.reload();
          }
          if (props.onFinish) {
            props.onFinish();
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
          name="Ctop"
          placeholder="留空或0表示不置顶，其余数字越大表示优先级越高"
          autocomplete="new-password"
          fieldProps={{
            autocomplete: 'new-password',
          }}
        />
        <ProFormText.Password
          label="密码"
          width="md"
          autocomplete="new-password"
          id="password"
          name="pc"
          placeholder="请输入密码"
          dependencies={['private']}
          fieldProps={{
            autocomplete: 'new-password',
          }}
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
