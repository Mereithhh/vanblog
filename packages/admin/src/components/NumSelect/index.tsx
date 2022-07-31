import { Select } from 'antd';
const optionNum = [3, 5, 7, 10, 15, 30];
const generateOptions = (nums: number[], d: string) => {
  const res = [];
  nums.forEach((n) => {
    res.push({
      label: `近${n}${d}`,
      value: n,
    });
  });
  return res;
};
export default function (props: { value: number; setValue: (n: number) => {}; d: string }) {
  return (
    <Select
      size={'small'}
      value={props.value}
      onChange={(v) => {
        props.setValue(v);
      }}
      options={generateOptions(optionNum, props.d)}
    />
  );
}
