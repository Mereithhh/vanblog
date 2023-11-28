import { Dropdown, Space } from 'antd';
import { useMemo } from 'react';

export default function (props: { nodes: any[]; outs: any[] }) {
  const items = useMemo(
    () =>
      props.nodes.map((val, index) => ({
        key: index,
        label: val,
      })),
    [props.nodes],
  );

  return (
    <Space>
      {props.outs}
      <Dropdown menu={{ items }} trigger={['click']}>
        <a className="more-hover">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            width="20"
            height="20"
            fill="currentColor"
            // FIXME: Update icon instead of using css to adjust center
            style={{ transform: 'translateY(3px)' }}
          >
            <path d="M223.962 607.898c-52.98 0-95.984-43.004-95.984-95.984s43.004-95.984 95.984-95.984 95.984 43.004 95.984 95.984-43.003 95.984-95.984 95.984zM511.914 607.898c-52.98 0-95.984-43.004-95.984-95.984s43.004-95.984 95.984-95.984 95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984zM800.038 607.898c-52.98 0-95.984-43.004-95.984-95.984s43.003-95.984 95.984-95.984 95.984 43.004 95.984 95.984-43.176 95.984-95.984 95.984z" />
          </svg>
        </a>
      </Dropdown>
    </Space>
  );
}
