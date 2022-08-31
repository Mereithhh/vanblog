import { deleteTag, getTags, updateTag } from '@/services/van-blog/api';
import { ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { useRef } from 'react';
const columns = [
  {
    dataIndex: 'name',
    title: '标签名',
    search: false,

    // render: (text) => {
    //   return <span style={{ marginLeft: 8 }}>{text}</span>;
    // },
  },
  {
    title: '操作',
    valueType: 'option',
    width: 200,
    render: (text, record, _, action) => [
      <ModalForm
        key={`editCateoryC%{${record.name}}`}
        title={`批量修改标签 "${record.name}"`}
        trigger={<a key={'editC' + record.name}>批量改名</a>}
        autoFocusFirstInput
        submitTimeout={3000}
        onFinish={async (values) => {
          Modal.confirm({
            content: `确定修改标签 "${record.name}" 为 "${values.newName}" 吗？所有文章的该标签都将被更新为新名称!`,
            onOk: async () => {
              await updateTag(record.name, values.newName);
              message.success('更新成功！所有文章该标签都将变为新名称！');
              action?.reload();
              return true;
            },
          });

          return true;
        }}
      >
        <ProFormText
          width="lg"
          name="newName"
          label="新标签"
          placeholder="请输入新的标签名称"
          tooltip="所有文章的该标签都将被更新为新名称"
          required
          rules={[{ required: true, message: '这是必填项' }]}
        />
      </ModalForm>,
      <a
        key="delTag"
        onClick={() => {
          Modal.confirm({
            title: '确认删除',
            content: `确认删除该标签吗？所有文章的该标签都将被删除，其他标签不变。`,
            onOk: async () => {
              await deleteTag(record.name);
              message.success('删除成功！所有文章的该标签都将被删除，其他标签不变。');
              action?.reload();
              return true;
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
  const fetchData = async () => {
    const { data: res } = await getTags();
    return res.map((item) => ({
      key: item,
      name: item,
    }));
  };
  const actionRef = useRef();
  return (
    <>
      <ProTable
        rowKey="name"
        columns={columns}
        search={false}
        dateFormatter="string"
        // headerTitle="分类"
        actionRef={actionRef}
        options={false}
        // toolBarRender={() => [
        //   <ModalForm
        //     title="新建分类"
        //     key="newCategoryN"
        //     trigger={
        //       <Button key="buttonCN" icon={<PlusOutlined />} type="primary">
        //         新建分类
        //       </Button>
        //     }
        //     width={450}
        //     autoFocusFirstInput
        //     submitTimeout={3000}
        //     onFinish={async (values) => {
        //       await createCategory(values);
        //       actionRef?.current?.reload();
        //       message.success('新建分类成功！');
        //       return true;
        //     }}
        //     layout="horizontal"
        //     labelCol={{ span: 6 }}
        //   >
        //     <ProFormText
        //       width="md"
        //       required
        //       id="nameC"
        //       name="name"
        //       label="分类名称"
        //       key="nameCCCC"
        //       placeholder="请输入分类名称"
        //       rules={[{ required: true, message: '这是必填项' }]}
        //     />
        //   </ModalForm>,
        // ]}
        request={async () => {
          const data = await fetchData();
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
    </>
  );
}
