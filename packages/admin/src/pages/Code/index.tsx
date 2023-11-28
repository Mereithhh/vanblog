import CodeEditor from '@/components/CodeEditor';
import UploadBtn from '@/components/UploadBtn';
import {
  getCustomPageByPath,
  getCustomPageFileDataByPath,
  getCustomPageFolderTreeByPath,
  updateCustomPage,
  updateCustomPageFileInFolder,
  getPipelineById,
  updatePipelineById,
  getPipelineConfig,
} from '@/services/van-blog/api';
import { DownOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Dropdown, Menu, message, Modal, Space, Spin, Tag, Tree } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { history } from 'umi';
import PipelineModal from '../Pipeline/components/PipelineModal';
import RunCodeModal from '../Pipeline/components/RunCodeModal';
import './index.less';
const { DirectoryTree } = Tree;

export default function () {
  const [value, setValue] = useState('');
  const [currObj, setCurrObj] = useState<any>({});
  const [node, setNode] = useState();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [pipelineConfig, setPipelineConfig] = useState<any[]>([]);
  const [pathPrefix, setPathPrefix] = useState('');
  const [treeData, setTreeData] = useState([{ title: 'door', key: '123' }]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  const [editorWidth, setEditorWidth] = useState(400);
  const [editorHeight, setEditorHeight] = useState('calc(100vh - 82px)');
  const type = history.location.query?.type;
  const path = history.location.query?.path;
  const id = history.location.query?.id;
  const isFolder = type == 'folder';
  const typeMap = {
    file: '单文件页面',
    folder: '多文件页面',
    pipeline: '流水线',
  };

  useEffect(() => {
    getPipelineConfig().then(({ data }) => {
      setPipelineConfig(data);
    });
  }, []);
  const language = useMemo(() => {
    if (type == 'pipeline') {
      return 'javascript';
    }
    if (!node) {
      return 'html';
    }
    const name = node.title;
    if (!name) {
      return 'html';
    }
    const cssArr = ['css', 'less', 'scss'];
    const tsArr = ['ts', 'tsx'];
    const htmlArr = ['html', 'htm'];
    const jsArr = ['js', 'jsx'];
    const m = {
      javascript: jsArr,
      typescript: tsArr,
      html: htmlArr,
      css: cssArr,
    };
    for (const [k, v] of Object.entries(m)) {
      if (v.some((t) => name.includes('.' + t))) {
        return k;
      }
    }
    return 'html';
  }, [node]);

  const onResize = () => {
    updateEditorSize();
  };

  const onClickMenuChangeBtn = () => {
    setTimeout(() => {
      updateEditorSize();
    }, 500);
  };

  useEffect(() => {
    window.addEventListener('resize', onResize);
    const menuBtnEl = document.querySelector('.ant-pro-sider-collapsed-button');
    if (menuBtnEl) {
      menuBtnEl.addEventListener('click', onClickMenuChangeBtn);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      const menuBtnEl = document.querySelector('.ant-pro-sider-collapsed-button');
      if (menuBtnEl) {
        menuBtnEl.removeEventListener('click', onClickMenuChangeBtn);
      }
    };
  }, []);

  const updateEditorSize = () => {
    const el = document.querySelector('.ant-page-header');
    const fullWidthString = window.getComputedStyle(el).width;
    const fullWidth = parseInt(fullWidthString.replace('px', ''));

    const width = isFolder ? fullWidth - 1 - 200 : fullWidth;

    setEditorWidth(width);

    const HeaderHeightString = window.getComputedStyle(el).height;
    const HeaderHeight = parseInt(HeaderHeightString.replace('px', ''));
    setEditorHeight(`calc(100vh - ${HeaderHeight + 12}px)`);
  };

  const onKeyDown = (ev) => {
    let save = false;
    if (ev.metaKey == true && ev.key.toLocaleLowerCase() == 's') {
      save = true;
    }
    if (ev.ctrlKey == true && ev.key.toLocaleLowerCase() == 's') {
      save = true;
    }
    if (save) {
      event?.preventDefault();
      ev?.preventDefault();
      handleSave();
    }
    return false;
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [currObj, value, type]);

  useEffect(() => {
    setTimeout(() => {
      updateEditorSize();
    }, 300);
  }, []);

  const handleUpload = async () => {};
  const fetchFileData = async (node: any) => {
    setEditorLoading(true);
    const { data } = await getCustomPageFileDataByPath(path, node.key);
    setValue(data);
    setEditorLoading(false);
  };
  const fetchData = useCallback(async () => {
    if (!path && !id) {
      message.error('无有效信息，无法获取数据！');
      return;
    } else {
      if (isFolder) {
        setTreeLoading(true);
        setCurrObj({ name: path });
        const { data } = await getCustomPageFolderTreeByPath(path);
        if (data) setTreeData(data);
        setTreeLoading(false);
      } else if (type == 'pipeline') {
        if (!id) {
          message.error('无有效信息，无法获取数据！');
          return;
        }
        setEditorLoading(true);
        const { data } = await getPipelineById(id);
        if (data) {
          setCurrObj(data);
          setValue(data?.script || '');
        }
        setEditorLoading(false);
      } else {
        setEditorLoading(true);
        const { data } = await getCustomPageByPath(path);
        if (data) {
          setCurrObj(data);
          setValue(data?.html || '');
        }
        setEditorLoading(false);
      }
    }
  }, [setCurrObj, setValue, path]);
  const handleSave = async () => {
    if (location.hostname == 'blog-demo.mereith.com') {
      Modal.info({
        title: '演示站不可修改此项！',
      });
      return;
    }
    if (type == 'file') {
      setEditorLoading(true);
      await updateCustomPage({ ...currObj, html: value });
      setEditorLoading(false);
      message.success('当前编辑器内文件保存成功！');
    } else if (type == 'pipeline') {
      setEditorLoading(true);
      await updatePipelineById(currObj.id, { script: value });
      setEditorLoading(false);
      message.success('当前编辑器内脚本保存成功！');
    } else {
      setEditorLoading(true);
      await updateCustomPageFileInFolder(path, node?.key, value);
      setEditorLoading(false);
      message.success('当前编辑器内文件保存成功！');
      return;
    }
  };

  const actionMenu = (
    <Menu
      items={[
        {
          key: 'saveBtn',
          label: '保存',
          onClick: handleSave,
        },
        ...(type == 'pipeline'
          ? [
              {
                key: 'runPipeline',
                label: <RunCodeModal pipeline={currObj} trigger={<a>调试脚本</a>} />,
              },
              {
                key: 'editPipelineInfo',
                label: (
                  <PipelineModal
                    mode="edit"
                    trigger={<a>编辑信息</a>}
                    onFinish={(vals) => {
                      console.log(vals);
                    }}
                    initialValues={currObj}
                  />
                ),
              },
            ]
          : []),
        ...(isFolder
          ? [
              {
                key: 'uploadFile',
                label: (
                  <UploadBtn
                    setLoading={setUploadLoading}
                    folder={true}
                    muti={true}
                    customUpload={true}
                    text="上传文件夹"
                    onFinish={(info) => {
                      fetchData();
                    }}
                    url={`/api/admin/customPage/upload?path=${path}`}
                    accept="*"
                    loading={uploadLoading}
                    plainText={true}
                  />
                ),
              },
              {
                key: 'uploadFolder',
                label: (
                  <UploadBtn
                    basePath={pathPrefix}
                    customUpload={true}
                    plainText={true}
                    setLoading={setUploadLoading}
                    folder={false}
                    muti={false}
                    text="上传文件"
                    onFinish={(info) => {
                      fetchData();
                    }}
                    url={`/api/admin/customPage/upload?path=${path}`}
                    accept="*"
                    loading={uploadLoading}
                  />
                ),
              },
            ]
          : []),
        ...(type == 'file'
          ? [
              {
                key: 'view',
                label: '查看',
                onClick: () => {
                  window.open(`/c${path}`);
                },
              },
            ]
          : []),
      ]}
    ></Menu>
  );
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <PageContainer
      className="editor-full"
      header={{
        title: (
          <Space>
            <span title={currObj?.name}>{currObj?.name}</span>
            <>
              <Tag color="green">{typeMap[type] || '未知类型'}</Tag>
              {type == 'pipeline' && (
                <>
                  <Tag color="blue">
                    {
                      pipelineConfig?.find((p) => p.eventName == currObj.eventName)
                        ?.eventNameChinese
                    }
                  </Tag>
                  {pipelineConfig?.find((p) => p.eventName == currObj.eventName)?.passive ? (
                    <Tag color="yellow">非阻塞</Tag>
                  ) : (
                    <Tag color="red">阻塞</Tag>
                  )}
                </>
              )}
            </>
          </Space>
        ),
        extra: [
          <Dropdown key="moreAction" overlay={actionMenu} trigger={['click']}>
            <Button size="middle" type="primary">
              操作
              <DownOutlined />
            </Button>
          </Dropdown>,
          <Button
            key="backBtn"
            onClick={() => {
              history.go(-1);
            }}
          >
            返回
          </Button>,
          <Button
            key="docBtn"
            onClick={() => {
              if (type == 'pipeline') {
                window.open('https://vanblog.mereith.com/features/pipeline.html', '_blank');
              } else {
                window.open(
                  'https://vanblog.mereith.com/feature/advance/customPage.html',
                  '_blank',
                );
              }
            }}
          >
            文档
          </Button>,
        ],
        breadcrumb: {},
      }}
      footer={null}
    >
      <div style={{ height: '100%', display: 'flex' }} className="code-editor-content">
        {isFolder && (
          <>
            <Spin spinning={treeLoading}>
              <div
                className="file-tree-container"
                onClick={(ev) => {
                  const container = document.querySelector('.file-tree-container')!;
                  const tree = document.querySelector('.ant-tree-list')!;
                  if (ev.target == container || ev.target == tree) {
                    setSelectedKeys([]);
                    setPathPrefix('');
                  }
                }}
                style={{
                  width: '200px',
                  background: 'white',
                }}
              >
                {/* <div className="toolbar">
                  <div className="left"> {path}</div>
                  <div className="right">
                    <div
                      className="action-icon"
                      onClick={async () => {
                        setTreeLoading(true);
                        await createCustomFile(path, pathPrefix);
                        setTreeLoading(false);
                        fetchData();
                      }}
                    >
                      <Tooltip title="新建文件">
                        <FileAddOutlined />
                      </Tooltip>
                    </div>
                    <div
                      className="action-icon"
                      onClick={async () => {
                        setTreeLoading(true);
                        await createCustomFolder(path, pathPrefix);
                        setTreeLoading(false);
                        fetchData();
                      }}
                    >
                      <Tooltip title="新建文件夹">
                        <FolderAddOutlined />
                      </Tooltip>
                    </div>
                  </div>
                </div> */}
                <DirectoryTree
                  style={{ height: editorHeight }}
                  className="file-tree"
                  defaultExpandAll
                  selectedKeys={selectedKeys}
                  // onRightClick={({ event, node }) => {
                  //   console.log(event);
                  // }}
                  onSelect={(keys, info) => {
                    if (editorLoading) {
                      message.warning('加载中请勿选择!');
                      return;
                    }
                    setSelectedKeys(keys);
                    const node = info.node as any;

                    if (node.type == 'file') {
                      fetchFileData(node);
                      setNode(node);
                      const arr = node.key.split('/');
                      arr.pop();
                      setPathPrefix(arr.join('/'));
                    } else {
                      setPathPrefix(node.key);
                    }
                  }}
                  treeData={treeData}
                />
              </div>
            </Spin>
            <div className="divider-v"></div>
          </>
        )}
        <Spin spinning={editorLoading}>
          <CodeEditor
            value={value}
            onChange={setValue}
            language={language}
            width={editorWidth}
            height={editorHeight}
          />
        </Spin>
      </div>
    </PageContainer>
  );
}
