import CollaboratorModal, { getPermissionLabel } from '@/components/CollaboratorModal';
import Tags from '@/components/Tags';
import { deleteCollaborator, getAllCollaborators, updateUser } from '@/services/van-blog/api';
import { encryptPwd } from '@/services/van-blog/encryptPwd';
import { ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Card, message, Modal, Space } from 'antd';
import { useRef } from 'react';
import { history, useModel } from 'umi';
const columns = [
  { dataIndex: 'id', title: 'ID' },
  { dataIndex: 'name', title: '用户名' },
  { dataIndex: 'nickname', title: '昵称' },
  {
    dataIndex: 'permissions',
    title: '权限',
    render: (data) => {
      return (
        <Tags
          tags={data.map((t) => {
            return getPermissionLabel(t);
          })}
        />
      );
    },
  },
  {
    title: '操作',
    render: (text, record, _, action) => [
      <CollaboratorModal
        initialValues={record}
        id={record.id}
        key="edit"
        onFinish={() => {
          action?.reload();
          message.success('修改协作者成功！');
        }}
        trigger={<a>修改</a>}
      />,
      <a
        key="delete"
        style={{ marginLeft: 8 }}
        onClick={() => {
          Modal.confirm({
            title: '删除确认',
            content: '是否确认删除该协作者？',
            onOk: async () => {
              await deleteCollaborator(record.id);
              action?.reload();
              message.success('删除成功！');
            },
          });
        }}
      >
        删除
      </a>,
    ],
  },
];
export default function () {
  const { initialState, setInitialState } = useModel('@@initialState');
  const actionRef = useRef();
  return (
    <>
      <Card title="用户设置">
        <ProForm
          grid={true}
          layout={'horizontal'}
          labelCol={{ span: 6 }}
          request={async (params) => {
            return {
              name: initialState?.user?.name || '',
              password: initialState?.user?.password || '',
            };
          }}
          syncToInitialValues={true}
          onFinish={async (data) => {
            await updateUser({
              name: data.name,
              password: encryptPwd(data.name, data.password),
            });
            window.localStorage.removeItem('token');
            setInitialState((s) => ({ ...s, user: undefined }));
            history.push('/');
            message.success('更新用户成功！请重新登录！');
          }}
        >
          <ProFormText
            width="lg"
            name="name"
            required={true}
            rules={[{ required: true, message: '这是必填项' }]}
            label="登录用户名"
            placeholder={'请输入登录用户名'}
          />
          {/* <ProFormText
            width="lg"
            name="nickname"
            required={true}
            rules={[{ required: true, message: '这是必填项' }]}
            label="昵称"
            placeholder={'请输入昵称（显示的名字）'}
          ></ProFormText> */}
          <ProFormText.Password
            width="lg"
            name="password"
            required={true}
            rules={[{ required: true, message: '这是必填项' }]}
            autocomplete="new-password"
            label="登录密码"
            placeholder={'请输入登录密码'}
          />
        </ProForm>
      </Card>
      <Card
        title="协作者"
        style={{ marginTop: 8 }}
        className="card-body-full"
        extra={
          <Space>
            <CollaboratorModal
              onFinish={() => {
                message.success('新建协作者成功！');
                actionRef.current?.reload();
              }}
              trigger={<Button type="primary">新建</Button>}
            />
            <Button
              onClick={() => {
                Modal.info({
                  title: '协作者功能',
                  content: (
                    <div>
                      <p>
                        <span>您可以添加一些具有指定权限的协作者用户。</span>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href="https://vanblog.mereith.com/feature/advance/collaborator.html"
                        >
                          帮助文档
                        </a>
                      </p>
                      <p>协作者默认具有文章、草稿、图片的查看/上传权限，其余权限需要您显式指定。</p>
                      <p>
                        协作者登录后将看到被精简的后台页面（除非此协作者具备所有权限），同时无权限的接口将抛错。
                      </p>
                    </div>
                  ),
                });
              }}
            >
              帮助
            </Button>
          </Space>
        }
      >
        <ProTable
          rowKey="id"
          columns={columns}
          dateFormatter="string"
          actionRef={actionRef}
          search={false}
          options={false}
          pagination={{
            hideOnSinglePage: true,
            simple: true,
          }}
          request={async (params = {}) => {
            let { data } = await getAllCollaborators();
            return {
              data,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: data.length,
            };
          }}
        />
      </Card>
    </>
  );
}
