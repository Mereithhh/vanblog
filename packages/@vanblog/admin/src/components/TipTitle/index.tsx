import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export default function (props: { tip: string; title: string; isButton?: boolean }) {
  return (
    <span>
      <span style={{ marginRight: 4 }}>{props.title}</span>
      <Tooltip title={props.tip} placement="bottom">
        <QuestionCircleOutlined style={{ fontSize: 16, fontWeight: 400 }} />
      </Tooltip>
    </span>
  );
}
