import Editor from '@/components/Editor';
import PublishDraftModal from '@/components/PublishDraftModal';
import Tags from '@/components/Tags';
import {
  getAbout,
  getAllCategories,
  getArticleById,
  getDraftById,
  getTags,
  updateAbout,
  updateArticle,
  updateDraft,
} from '@/services/van-blog/api';
import { formatTimes } from '@/services/van-blog/tool';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, message, Modal, Row, Space, Tag } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';

export default function () {
  const [vd, setVd] = useState();
  const [currObj, setCurrObj] = useState({});
  const [loading, setLoading] = useState(true);
  const { initialState } = useModel('@@initialState');
  const sysTheme = useMemo(() => {
    return initialState?.settings?.navTheme || 'light';
  }, [initialState]);
  const updateCodeTheme = useCallback(() => {
    if (!vd || !initialState?.settings?.navTheme) {
      return;
    }
    if (initialState?.settings?.navTheme == 'light') {
      vd?.setTheme('light', undefined, 'github');
    } else {
      vd?.setTheme('dark', undefined, 'native');
    }
  }, [vd, initialState]);
  useEffect(() => {
    updateCodeTheme();
  }, [updateCodeTheme]);
  // 类型，可以是文章、草稿、或者 about
  const type = history.location.query?.type || 'article';
  const typeMap = {
    article: '文章',
    draft: '草稿',
    about: '关于',
  };
  const fetchData = useCallback(async () => {
    setLoading(true);
    const type = history.location.query?.type || 'article';
    const id = history.location.query?.id;
    if (type == 'about') {
      const { data } = await getAbout();
      setCurrObj(data);
    }
    if (type == 'article' && id) {
      const { data } = await getArticleById(id);
      setCurrObj(data);
    }
    if (type == 'draft' && id) {
      const { data } = await getDraftById(id);
      setCurrObj(data);
    }
    setLoading(false);
  }, [history, setLoading]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (vd && currObj?.content && !loading) {
      vd?.setValue(currObj.content);
    }
  }, [currObj, vd, loading]);
  return (
    <PageContainer
      className="editor-full"
      header={{
        children: (
          <>
            <Row>
              <Col span={8}>
                <span>类型：</span>
                <span>{typeMap[type] || '-'}</span>
              </Col>
              <Col span={16}>
                <span>更新：</span>
                <span>{formatTimes(currObj?.updatedAt, currObj?.createdAt)}</span>
              </Col>
            </Row>
            {type != 'about' && (
              <Row style={{ marginTop: 8 }}>
                <Col span={8}>
                  <span>标签：</span>
                  <span>
                    <Tags tags={currObj?.tags} />
                  </span>
                </Col>
                <Col span={16}>
                  <span>分类：</span>
                  <span>{currObj?.category || '-'}</span>
                </Col>
              </Row>
            )}
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
              // 先检查一下有没有 more .
              if (['article', 'draft'].includes(history.location.query?.type)) {
                const v = vd?.getValue();
                if (!v?.includes('<!-- more -->')) {
                  message.warning(
                    '缺少more标记，请点击工具栏第一个按钮在合适的地方插入标记！这样阅读全文前的内容才能被正确识别。',
                  );
                  return;
                }
              }
              let hasTags =
                ['article', 'draft'].includes(history.location.query?.type) &&
                currObj?.tags &&
                currObj.tags.length > 0;
              if (history.location.query?.type == 'about') {
                return true;
              }
              Modal.confirm({
                title: `确定保存吗？${hasTags ? '' : '此文章还没设置标签呢'}`,
                onOk: async () => {
                  const v = vd?.getValue();
                  setLoading(true);
                  if (type == 'article') {
                    await updateArticle(currObj?.id, { content: v });
                    await fetchData();
                    message.success('保存成功！');
                  } else if (type == 'draft') {
                    await updateDraft(currObj?.id, { content: v });
                    await fetchData();
                    message.success('保存成功！');
                  } else if (type == 'about') {
                    await updateAbout({ content: v });
                    await fetchData();
                    message.success('保存成功！');
                  } else {
                  }
                  setLoading(false);
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
              message.success('重置为初始值成功！');
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
              setLoading(true);
              if (type == 'article') {
                await updateArticle(currObj?.id, values);
                await fetchData();
                message.success('修改文章成功！');
                setLoading(false);
              } else if (type == 'draft') {
                await updateDraft(currObj?.id, values);
                await fetchData();
                message.success('修改草稿成功！');
                setLoading(false);
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
                const { data: categories } = await getAllCategories();
                return categories?.map((e) => {
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
      <Editor setVd={setVd} sysTheme={sysTheme} />
    </PageContainer>
  );
}
