import { PoweroffOutlined } from '@ant-design/icons';
export default function (props) {
  const { on } = props.on || { on: false };
  return (
    <>
      <PoweroffOutlined color={on ? 'green' : 'gray'} />
    </>
  );
}
