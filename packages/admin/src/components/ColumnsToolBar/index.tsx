import { Dropdown, Menu, Space } from 'antd';
import { useMemo } from 'react';

export default function (props: { nodes: any[]; outs: any[] }) {
  const items = useMemo(() => {
    return props.nodes.map((val, index) => {
      return {
        key: index,
        label: val,
      };
    });
  }, [props.nodes]);
  const menu = <Menu items={items} />;
  return (
    <Space>
      {props.outs}
      <Dropdown overlay={menu} trigger={['click']}>
        <a className="more-hover">
          <svg
            fill="currentColor"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="2390"
            width={20}
            height={20}
            style={{ transform: 'translateY(3px)' }}
          >
            <path
              d="M223.962372 607.897867c-52.980346 0-95.983874-43.003528-95.983874-95.983874s43.003528-95.983874 95.983874-95.983874 95.983874 43.003528 95.983874 95.983874S276.942718 607.897867 223.962372 607.897867z"
              p-id="2391"
            ></path>
            <path
              d="M511.913993 607.897867c-52.980346 0-95.983874-43.003528-95.983874-95.983874s43.003528-95.983874 95.983874-95.983874 95.983874 43.003528 95.983874 95.983874S564.894339 607.897867 511.913993 607.897867z"
              p-id="2392"
            ></path>
            <path
              d="M800.037628 607.897867c-52.980346 0-95.983874-43.003528-95.983874-95.983874s43.003528-95.983874 95.983874-95.983874 95.983874 43.003528 95.983874 95.983874S852.84596 607.897867 800.037628 607.897867z"
              p-id="2393"
            ></path>
          </svg>
        </a>
      </Dropdown>
    </Space>
  );
}
