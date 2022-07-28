import Editor from '@/components/Editor';
import PublishDraftModal from '@/components/PublishDraftModal';
import Tags from '@/components/Tags';
import { getTags, updateAbout, updateArticle, updateDraft } from '@/services/van-blog/api';
import { formatTimes } from '@/services/van-blog/tool';
import { useQuery } from '@/services/van-blog/useQuery';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Descriptions, Modal, Space, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

export default function () {
  const [vd, setVd] = useState();
  const [query] = useQuery();
  const { initialState, setInitialState } = useModel('@@initialState');
  // 类型，可以是文章、草稿、或者 about
  const type = query?.type || 'article';
  const typeMap = {
    article: '文章',
    draft: '草稿',
    about: '关于',
  };
  const currObj = useMemo(() => {
    let obj = {};
    let array = [];
    switch (type) {
      case 'article':
        array = initialState?.articles;
        obj = array.find((item) => {
          return String(item.id) == query.id;
        });
        break;
      case 'draft':
        array = initialState?.drafts;
        obj = array?.find((item) => {
          return String(item.id) == query.id;
        });
        break;
      case 'about':
        obj = initialState?.meta?.about;
    }
    return obj;
  }, [type, initialState, query]);
  useEffect(() => {
    if (vd) {
      vd.setValue(currObj?.content || '');
    }
  }, [vd, currObj]);
  const reload = async () => {
    const data = await initialState?.fetchInitData?.();
    await setInitialState((s) => ({ ...s, ...data }));
  };
  return (
    <PageContainer
      header={{
        children: (
          <>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="类型">{typeMap[type] || '-'}</Descriptions.Item>
              <Descriptions.Item label="修改时间">
                {formatTimes(currObj?.updatedAt, currObj?.createdAt)}
              </Descriptions.Item>
              {type != 'about' && (
                <Descriptions.Item label="标签">
                  <Tags tags={currObj?.tags}></Tags>
                </Descriptions.Item>
              )}
              {type != 'about' && (
                <Descriptions.Item label="分类">{currObj?.category || '-'}</Descriptions.Item>
              )}
            </Descriptions>
          </>
        ),
        title: (
          <Space>
            <Tag style={{ marginBottom: '5px' }} color="blue">
              {type == 'about' ? '关于' : currObj?.id || '未知'}
            </Tag>
            <span>{type == 'about' ? '关于' : currObj?.title}</span>
          </Space>
        ),
        extra: [
          <Button
            type="primary"
            key="saveButton"
            onClick={async () => {
              // console.log(vd.getValue());
              Modal.confirm({
                title: `确定保存吗？`,
                onOk: async () => {
                  const v = vd?.getValue();

                  if (type == 'article') {
                    await updateArticle(currObj?.id, { content: v });
                    reload();
                  } else if (type == 'draft') {
                    await updateDraft(currObj?.id, { content: v });
                    reload();
                  } else if (type == 'about') {
                    await updateAbout({ content: v });
                    await reload();
                  } else {
                  }
                },
              });
            }}
          >
            保存
          </Button>,
          <Button
            key="resetButton"
            onClick={() => {
              vd.setValue(currObj?.content || '');
            }}
          >
            重置
          </Button>,
          <ModalForm
            title="修改信息"
            trigger={
              type != 'about' && (
                <Button key="button" type="primary">
                  修改信息
                </Button>
              )
            }
            width={450}
            autoFocusFirstInput
            submitTimeout={3000}
            initialValues={currObj || {}}
            onFinish={async (values) => {
              if (!currObj || !currObj.id) {
                return false;
              }
              if (type == 'article') {
                await updateArticle(currObj?.id, values);
                reload();
              } else if (type == 'draft') {
                await updateDraft(currObj?.id, values);
                reload();
              } else {
                return false;
              }
              return true;
            }}
            layout="horizontal"
            labelCol={{ span: 6 }}
            key="editForm"
            // wrapperCol: { span: 14 },
          >
            <ProFormText
              width="md"
              required
              id="title"
              name="title"
              label="文章标题"
              placeholder="请输入标题"
              rules={[{ required: true, message: '这是必填项' }]}
            />
            <ProFormSelect
              mode="tags"
              tokenSeparators={[',']}
              width="md"
              name="tags"
              label="标签"
              placeholder="请选择或输入标签"
              request={async () => {
                const msg = await getTags();
                return msg?.data?.map((item) => ({ label: item, value: item })) || [];
              }}
            />
            <ProFormSelect
              width="md"
              required
              id="category"
              name="category"
              label="分类"
              placeholder="请选择分类"
              rules={[{ required: true, message: '这是必填项' }]}
              request={async () => {
                return initialState?.categories?.map((e) => {
                  return {
                    label: e,
                    value: e,
                  };
                });
              }}
            />
            {type == 'article' && (
              <>
                <ProFormText
                  width="md"
                  id="top"
                  name="top"
                  label="置顶优先级"
                  placeholder="留空或0表示不置顶，其余数字越大表示优先级越高"
                />
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
              </>
            )}
          </ModalForm>,
          type == 'draft' && (
            <PublishDraftModal
              title={currObj?.title}
              key="publishModal1"
              id={currObj?.id}
              trigger={<Button key={'publishBtn' + currObj?.id}>发布草稿</Button>}
            />
          ),
        ],
        breadcrumb: {},
      }}
      footer={null}
    >
      <Editor setVd={setVd} />
    </PageContainer>
  );
}
