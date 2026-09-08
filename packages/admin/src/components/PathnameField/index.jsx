import { ProFormText } from '@ant-design/pro-components';
import { PATHNAME_FIELD } from '@/utils/pathnameField';

export default function PathnameField({ name = PATHNAME_FIELD.name, id, fieldProps }) {
  return (
    <ProFormText
      width="md"
      id={id || name}
      name={name}
      label={PATHNAME_FIELD.label}
      tooltip={PATHNAME_FIELD.tooltip}
      placeholder={PATHNAME_FIELD.placeholder}
      fieldProps={fieldProps}
    />
  );
}
