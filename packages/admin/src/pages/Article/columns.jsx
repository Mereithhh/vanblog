import ColumnsToolBar from '@/components/ColumnsToolBar';
import UpdateModal from '@/components/UpdateModal';
import {
  deleteArticle,
  getAllCategories,
  getArticleById,
  getTags,
  updateArticle,
} from '@/services/van-blog/api';
import { getPathname } from '@/services/van-blog/getPathname';
import { parseObjToMarkdown } from '@/services/van-blog/parseMarkdownFile';
import { message, Modal, Space, Switch, Tag } from 'antd';
import { useState } from 'react';
import { history } from 'umi';
import { genActiveObj } from '../../services/van-blog/activeColTools';

function HiddenSwitch({ record, action }) {
  const [loading, setLoading] = useState(false);
  return (
    <span data-article-hidden-toggle={String(record.id)}>
      <Switch
        size="small"
        loading={loading}
        checked={Boolean(record.hidden)}
        checkedChildren="是"
        unCheckedChildren="否"
        aria-label={`是否隐藏 ${record.title}`}
        onChange={async (checked) => {
          if (location.hostname == 'blog-demo.mereith.com') {
            Modal.info({
              title: '演示站禁止修改信息！',
              content: '本来是可以的，但有个人在演示站首页放黄色信息，所以关了这个权限了。',
            });
            return;
          }
          setLoading(true);
          try {
            await updateArticle(record.id, { hidden: checked });
            message.success(checked ? '已设为隐藏' : '已取消隐藏');
            action?.reload();
          } finally {
            setLoading(false);
          }
        }}
      />
    </span>
  );
}

export const columns = [
  {
    dataIndex: 'id',
    valueType: 'number',
    title: 'ID',
    width: 48,
    search: false,
  },
  {
    title: '标题',
    dataIndex: 'title',
    width: 150,
    copyable: true,
    ellipsis: true,
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    title: '分类',
    dataIndex: 'category',
    valueType: 'select',
    width: 100,
    request: async () => {
      const { data: categories } = await getAllCategories();
      const data = categories.map((each) => ({
        label: each,
        value: each,
      }));
      return data;
    },
  },
  {
    title: '标签',
    dataIndex: 'tags',
    valueType: 'select',
    fieldProps: { showSearch: true, placeholder: '请搜索或选择' },
    width: 120,
    search: true,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    request: async () => {
      const { data: tags } = await getTags();
      const data = tags.map((each) => ({
        label: each,
        value: each,
      }));
      return data;
    },
    render: (val, record) => {
      if (!record?.tags?.length) {
        return '-';
      } else {
        return record?.tags?.map((each) => (
          <Tag style={{ marginBottom: 4 }} key={`tag-${each}`}>
            {each}
          </Tag>
        ));
      }
    },
  },
  {
    title: '创建时间',
    key: 'showTime',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    sorter: true,
    hideInSearch: true,
    width: 150,
  },
  {
    title: '顶置',
    key: 'top',
    dataIndex: 'top',
    valueType: 'number',
    sorter: true,
    width: 80,
    hideInSearch: true,
  },
  {
    title: '浏览量',
    key: 'viewer',
    dataIndex: 'viewer',
    valueType: 'number',
    sorter: true,
    width: 80,
    hideInSearch: true,
  },
  {
    title: '是否隐藏',
    key: 'hidden',
    dataIndex: 'hidden',
    width: 100,
    hideInSearch: true,
    tooltip: '隐藏后前台不展示，也不计入总字数 / 时间线等。可在此直接开关，不必打开修改信息。',
    render: (_, record, __, action) => <HiddenSwitch record={record} action={action} />,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateRange',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    width: 120,
    render: (text, record, _, action) => {
      return (
        <Space>
          <ColumnsToolBar
            outs={[
              <a
                key={'editable' + record.id}
                onClick={() => {
                  history.push(
                    `/editor?type=${record?.about ? 'about' : 'article'}&id=${record.id}`,
                  );
                }}
              >
                编辑
              </a>,
              <a
                href={`/post/${getPathname(record)}`}
                onClick={(ev) => {
                  if (record?.hidden) {
                    Modal.confirm({
                      title: '此文章为隐藏文章！',
                      content: (
                        <div>
                          <p>
                            隐藏文章在未开启通过 URL 访问的情况下（默认关闭），会出现 404 页面！
                          </p>
                          <p>
                            您可以在{' '}
                            <a
                              onClick={() => {
                                history.push('/site/setting?subTab=layout');
                              }}
                            >
                              布局配置
                            </a>{' '}
                            中修改此项。
                          </p>
                        </div>
                      ),
                      onOk: () => {
                        window.open(`/post/${getPathname(record)}`, '_blank');
                        return true;
                      },
                      okText: '仍然访问',
                      cancelText: '返回',
                    });
                    ev.preventDefault();
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                key={'view' + record.id}
              >
                查看
              </a>,
            ]}
            nodes={[
              <UpdateModal
                currObj={record}
                setLoading={() => {}}
                type="article"
                onFinish={() => {
                  action?.reload();
                }}
              />,
              <a
                key={'exportArticle' + record.id}
                onClick={async () => {
                  const { data: obj } = await getArticleById(record.id);
                  const md = parseObjToMarkdown(obj);
                  const data = new Blob([md]);
                  const url = URL.createObjectURL(data);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${record.title}.md`;
                  link.click();
                }}
              >
                导出
              </a>,
              <a
                key={'deleteArticle' + record.id}
                onClick={() => {
                  Modal.confirm({
                    title: `确定删除 "${record.title}"吗？`,
                    onOk: async () => {
                      if (location.hostname == 'blog-demo.mereith.com') {
                        if ([28, 29].includes(record.id)) {
                          message.warn('演示站禁止删除此文章！');
                          return false;
                        }
                      }
                      await deleteArticle(record.id);
                      message.success('删除成功!');
                      action?.reload();
                    },
                  });
                }}
              >
                删除
              </a>,
            ]}
          />
        </Space>
      );
    },
  },
];
export const articleKeys = [
  'category',
  'hidden',
  'id',
  'option',
  'showTime',
  'tags',
  'title',
  'top',
  'viewer',
];
export const articleKeysSmall = ['category', 'hidden', 'id', 'option', 'title'];
export const articleObjAll = genActiveObj(articleKeys, articleKeys);
export const articleObjSmall = genActiveObj(articleKeysSmall, articleKeys);
