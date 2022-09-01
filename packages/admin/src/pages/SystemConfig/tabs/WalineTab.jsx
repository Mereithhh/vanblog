import WalineForm from '@/components/WalineForm';
import { Alert, Card } from 'antd';

export default function () {
  return (
    <>
      <Card title="评论设置">
        <Alert
          type="info"
          message={
            <div>
              <p>
                <span>本表单可以控制内嵌 waline 评论系统的配置。具体请参考：</span>
                <a
                  target={'_blank'}
                  rel="noreferrer"
                  href="https://vanblog.mereith.com/feature/basic/comment.html"
                >
                  帮助文档
                </a>
              </p>
            </div>
          }
          style={{ marginBottom: 20 }}
        />
        <WalineForm />
      </Card>
    </>
  );
}
