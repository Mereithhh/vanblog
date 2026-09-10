import { deleteSocial, getSocial, getSocialTypes, updateSocial } from '@/services/van-blog/api';
import { EditableProTable } from '@ant-design/pro-components';
import { Modal, Spin } from 'antd';
import { useRef, useState } from 'react';

const CUSTOM_SOCIAL_TYPE = 'custom';

function isCustomSocialType(type) {
  return type === CUSTOM_SOCIAL_TYPE || String(type || '').startsWith(`${CUSTOM_SOCIAL_TYPE}-`);
}

function socialRowKey(item) {
  if (isCustomSocialType(item.type) && item.id) {
    return item.id;
  }
  return item.type || item.key;
}

export default function () {
  const [loading, setLoading] = useState(true);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const actionRef = useRef();
  const fetchData = async () => {
    setLoading(true);
    const { data } = await getSocial();

    setLoading(false);
    return (data || []).map((item) => ({ key: socialRowKey(item), ...item }));
  };
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
      request: async () => {
        const { data } = await getSocialTypes();
        return data || [];
      },
    },
    {
      title: '显示名称',
      dataIndex: 'label',
      fieldProps: {
        placeholder: '自定义时必填，如 Telegram',
      },
      formItemProps: (form) => {
        return {
          rules: [
            {
              validator: async (_, value) => {
                const type = form?.getFieldValue?.('type');
                if (isCustomSocialType(type) && !String(value || '').trim()) {
                  throw new Error('自定义社交媒体需要填写显示名称');
                }
              },
            },
          ],
        };
      },
    },
    {
      title: '值',
      dataIndex: 'value',
      fieldProps: {
        placeholder: '链接 / 邮箱 / 微信二维码地址',
      },
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '图标 URL',
      dataIndex: 'icon',
      fieldProps: {
        placeholder: '可选，自定义社交媒体的图标地址',
      },
    },
    {
      title: '最后设置时间',
      valueType: 'date',
      editable: false,
      dataIndex: 'updatedAt',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.key);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            Modal.confirm({
              onOk: async () => {
                await deleteSocial(socialRowKey(record));
                action?.reload();
              },
              title: `确认删除"${record.label || record.type}"吗?`,
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  return (
    <>
      <Spin spinning={loading}>
        <EditableProTable
          actionRef={actionRef}
          rowKey="key"
          headerTitle="社交媒体"
          scroll={{
            x: 960,
          }}
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ key: Date.now() }),
          }}
          loading={false}
          columns={columns}
          request={async () => {
            let data = await fetchData();

            return {
              data,
              success: true,
            };
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            onSave: async (rowKey, data, row) => {
              if (location.hostname == 'blog-demo.mereith.com') {
                Modal.info({ title: '演示站禁止修改此项！' });
                return;
              }
              const toSaveObj = {
                type: data.type,
                value: data.value,
                label: data.label,
                icon: data.icon,
                id: data.id,
              };
              await updateSocial(toSaveObj);
              actionRef?.current?.reload();
            },
            onChange: setEditableRowKeys,
          }}
        />
      </Spin>
    </>
  );
}
