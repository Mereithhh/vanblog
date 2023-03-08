import { Tag } from 'antd';

export default function (props) {
  if (!props.tags) {
    return '-';
  }
  return props?.tags?.map((item) => {
    return <Tag key={item}>{item}</Tag>;
  });
}
