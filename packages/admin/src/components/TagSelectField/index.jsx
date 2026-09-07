import { getTags } from '@/services/van-blog/api';
import {
  TAG_FIELD_PLACEHOLDER,
  TAG_FIELD_TOOLTIP,
  TAG_TOKEN_SEPARATORS,
} from '@/services/van-blog/tagTokens';
import { ProFormSelect } from '@ant-design/pro-components';

export default function TagSelectField({ name, ...rest }) {
  return (
    <ProFormSelect
      mode="tags"
      tokenSeparators={TAG_TOKEN_SEPARATORS}
      width="md"
      name={name}
      id={name}
      label="标签"
      placeholder={TAG_FIELD_PLACEHOLDER}
      tooltip={TAG_FIELD_TOOLTIP}
      request={async () => {
        const msg = await getTags();
        return msg?.data?.map((item) => ({ label: item, value: item })) || [];
      }}
      fieldProps={{
        tokenSeparators: TAG_TOKEN_SEPARATORS,
        id: name,
      }}
      {...rest}
    />
  );
}
