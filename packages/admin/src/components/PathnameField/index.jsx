import { PATHNAME_FIELD } from '@/services/van-blog/importPathname';
import { ProFormText } from '@ant-design/pro-components';

export default function PathnameField({ name = PATHNAME_FIELD.name, id, fieldProps }) {
  const fieldId = id || name;
  return (
    <ProFormText
      width="md"
      id={fieldId}
      name={name}
      label={PATHNAME_FIELD.label}
      tooltip={PATHNAME_FIELD.tooltip}
      placeholder={PATHNAME_FIELD.placeholder}
      fieldProps={fieldProps}
    />
  );
}
