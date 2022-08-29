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
import { DownOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Dropdown, Menu, message, Modal, Space, Tag } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { history } from 'umi';
export default function () {
  const [value, setValue] = useState('');
  const [currObj, setCurrObj] = useState({});
  const [loading, setLoading] = useState(true);
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
      setValue(data?.content || '');
      setCurrObj(data);
    }
    if (type == 'article' && id) {
      const { data } = await getArticleById(id);
      setValue(data?.content || '');
      setCurrObj(data);
    }
    if (type == 'draft' && id) {
      const { data } = await getDraftById(id);
      setValue(data?.content || '');
      setCurrObj(data);
    }
    setLoading(false);
  }, [history, setLoading, setValue]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    // 进入默认收起侧边栏
    const el = document.querySelector('.ant-pro-sider-collapsed-button');
    if (el && el.style.paddingLeft != '') {
      el.click();
    }
  }, []);
  const handleBlurFn = async () => {
    const type = history.location.query?.type || 'article';
    const id = history.location.query?.id;
    if (type == 'draft') {
      await updateDraft(id, { content: value });
      console.log('失焦保存草稿成功！');
    }
  };
  const handleBlur = debounce(handleBlurFn, 1000);
  const handleSave = async () => {
    // 先检查一下有没有 more .
    let hasMore = true;
    if (['article', 'draft'].includes(history.location.query?.type)) {
      if (!value?.includes('<!-- more -->')) {
        hasMore = false;
      }
    }
    let hasTags =
      ['article', 'draft'].includes(history.location.query?.type) &&
      currObj?.tags &&
      currObj.tags.length > 0;
    if (history.location.query?.type == 'about') {
      hasTags = true;
    }
    Modal.confirm({
      title: `确定保存吗？${hasTags ? '' : '此文章还没设置标签呢'}`,
      content: hasMore ? undefined : (
        <div style={{ marginTop: 8 }}>
          <p>缺少完整的 more 标记！</p>
          <p>这可能会造成阅读全文前的图片语句被截断从而无法正常显示！</p>
          <p>默认将截取指定的字符数量作为阅读全文前的内容。</p>
          <p>
            您可以点击编辑器工具栏最后第一个按钮在合适的地方插入标记。
            <a
              target={'_blank'}
              rel="noreferrer"
              href="https://vanblog.mereith.com/feature/basic/editor.html#%E4%B8%80%E9%94%AE%E6%8F%92%E5%85%A5-more-%E6%A0%87%E8%AE%B0"
            >
              相关文档
            </a>
          </p>
          <img
            src="https://pic.mereith.com/img/d0eaad2ec63ec895c7d009fbbb0c1893.clipboard-2022-08-29.png"
            alt="more"
            width={200}
          ></img>
        </div>
      ),
      onOk: async () => {
        const v = value;
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
      okText: '确认保存',
    });
  };
  const actionMenu = (
    <Menu
      items={[
        {
          key: 'resetBtn',
          label: '重置',
          onClick: () => {
            setValue(currObj?.content || '');
            message.success('重置为初始值成功！');
          },
        },
        type != 'about'
          ? {
              key: 'updateBtn',
              label: (
                <ModalForm
                  title="修改信息"
                  trigger={
                    <a key="button" type="link">
                      修改信息
                    </a>
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
                </ModalForm>
              ),
            }
          : null,
        type == 'draft'
          ? {
              key: 'publishBtn',
              label: (
                <PublishDraftModal
                  title={currObj?.title}
                  key="publishModal1"
                  id={currObj?.id}
                  trigger={<a key={'publishBtn' + currObj?.id}>发布草稿</a>}
                />
              ),
            }
          : null,
        {
          key: 'helpBtn',
          label: '帮助文档',
          onClick: () => {
            window.open('https://vanblog.mereith.com/feature/basic/editor.html', '_blank');
          },
        },
      ]}
    ></Menu>
  );
  return (
    <PageContainer
      className="editor-full"
      header={{
        title: (
          <Space>
            <span title={type == 'about' ? '关于' : currObj?.title}>
              {type == 'about' ? '关于' : currObj?.title}
            </span>
            {type != 'about' && (
              <>
                <Tag color="green">{typeMap[type] || '-'}</Tag>
                <Tag color="blue">{currObj?.category || '-'}</Tag>
                <Tags tags={currObj?.tags} />
              </>
            )}
          </Space>
        ),
        extra: [
          <Button key="extraSaveBtn" type="primary" onClick={handleSave}>
            保存
          </Button>,
          <Dropdown key="moreAction" overlay={actionMenu} trigger={['click']}>
            <Button size="middle">
              操作
              <DownOutlined />
            </Button>
          </Dropdown>,
        ],
        breadcrumb: {},
      }}
      footer={null}
    >
      <Editor
        loading={loading}
        setLoading={setLoading}
        value={value}
        onChange={setValue}
        onBlur={handleBlur}
      />
    </PageContainer>
  );
}
