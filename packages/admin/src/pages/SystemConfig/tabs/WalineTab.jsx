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
                <span>
                  本表单控制内嵌 Waline 评论系统。换成自定义域名邮箱时，开启「是否启用邮件通知」后填写
                  SMTP、博主邮箱（收件人）和发件地址（From）即可，不用另外部署邮件服务。说明见：
                </span>
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
