import CustomPageModal from '@/components/CustomPageModal';
import { deleteCustomPageByPath, getCustomPages } from '@/services/van-blog/api';
import { ProTable } from '@ant-design/pro-components';
import { Button, Card, message, Modal, Space } from 'antd';
import { useRef } from 'react';
import { Link } from 'umi';
const columns = [
  {
    title: '序号',
    render: (_, record, index) => {
      return index;
    },
  },
  { dataIndex: 'name', title: '名称' },
  {
    dataIndex: 'type',
    title: '类型',
    valueType: 'select',
    valueEnum: {
      file: {
        text: '单文件页面',
        status: 'Default',
      },
      folder: {
        text: '多文件页面',
        status: 'Success',
      },
    },
  },
  { dataIndex: 'path', title: '路径' },
  {
    title: '操作',
    render: (text, record, _, action) => {
      return (
        <Link
          to={
            record.type == 'file'
              ? `/code?type=file&lang=html&path=${record.path}`
              : `/code?type=folder&path=${record.path}`
          }
        >
          {record.type == 'file' ? '编辑内容' : '文件管理'}
        </Link>
      );
    },
  },
  {
    title: '路径',
    render: (text, record, _, action) => {
      return (
        <Space>
          <a key="view" target="_blank" rel="noreferrer" href={`/c${record.path}`}>
            查看
          </a>

          <CustomPageModal
            key={'editInfo'}
            trigger={<a>修改信息</a>}
            initialValues={record}
            onFinish={() => {
              action?.reload();
            }}
          ></CustomPageModal>
          <a
            key="delete"
            onClick={() => {
              if (location.hostname == 'blog-demo.mereith.com') {
                Modal.info({
                  title: '演示站不可修改此项！',
                });
                return;
              }
              Modal.confirm({
                title: '删除确认',
                content: '是否确认删除该自定义页面？',
                onOk: async () => {
                  await deleteCustomPageByPath(record.path);
                  action?.reload();
                  message.success('删除成功！');
                },
              });
            }}
          >
            删除
          </a>
        </Space>
      );
    },
  },
];
export default function () {
  // const [loading, setLoading] = useState(true);
  const actionRef = useRef();

  const handleHelp = () => {
    Modal.info({
      title: '帮助',
      width: 560,
      content: (
        <div>
          <p>自定义页面把静态内容挂到站点的 <code>/c/路径/</code> 下，不是通用应用托管。</p>
          <p>分为两种：单文件页面（后台编辑一段 HTML）、多文件页面（上传 HTML/CSS/JS 等静态文件）。</p>
          <p>
            多文件页面访问 <code>/c/路径/</code> 时读取<strong>根目录的 index.html</strong>
            。请在文件树根上确认能看到它，不要多包一层解压文件夹。
          </p>
          <p>
            React / Vue 等 SPA 若资源写成 <code>/static/...</code> 这种站点根路径，放到{' '}
            <code>/c/uptime/</code> 下通常是白屏。请改成相对路径（如 <code>./static/...</code>
            ），或构建时把 homepage / base 设为 <code>/c/路径/</code>
            。需要后端或独立域名时请用反代，不要把整个项目塞进自定义页面。
          </p>
          <a
            target="_blank"
            href="https://vanblog.mereith.com/advanced/custom-page.html"
            rel="noreferrer"
          >
            帮助文档
          </a>
        </div>
      ),
    });
  };

  return (
    <>
      <Card
        className="card-body-full"
        title="自定义页面"
        extra={
          <Space>
            <CustomPageModal
              trigger={<Button type="primary">新建</Button>}
              onFinish={() => {
                actionRef.current?.reload();
                message.success('新建成功！');
              }}
            />
            <Button type="link" key="help" onClick={handleHelp}>
              帮助
            </Button>
          </Space>
        }
      >
        <ProTable
          rowKey="_id"
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
            let { data } = await getCustomPages();
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
