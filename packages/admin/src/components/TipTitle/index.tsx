import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export default function (props: { tip: string; title: string }) {
  return (
    <span>
      <span style={{ marginRight: 2 }}>{props.title}</span>
      <Tooltip title={props.tip}>
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );
}
