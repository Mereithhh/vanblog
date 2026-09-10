import { getImgLink } from '@/pages/Static/img/tools';
import { errorImg } from '@/pages/Static/img';
import UploadBtn from '@/components/UploadBtn';
import { ProFormText } from '@ant-design/pro-components';
import { Button, Form, Image, Space, message } from 'antd';

export const COVER_FIELD = {
  name: 'cover',
  label: '题头图',
  placeholder: '可选，图片 URL，留空不显示题头图',
  tooltip:
    '可选。设置后显示在文章页顶部，并作为分享到其他应用时的预览图（Open Graph / Twitter）。可上传到现有图床或填写图片 URL。留空则不显示，已有文章不受影响。',
};

export default function CoverImageField({ name = COVER_FIELD.name, id, fieldProps }) {
  const fieldId = id || name;
  const form = Form.useFormInstance();
  const cover = Form.useWatch(name, form);
  const preview = typeof cover === 'string' ? cover.trim() : '';

  return (
    <div data-article-cover-field={name}>
      <ProFormText
        width="md"
        id={fieldId}
        name={name}
        label={COVER_FIELD.label}
        tooltip={COVER_FIELD.tooltip}
        placeholder={COVER_FIELD.placeholder}
        fieldProps={{
          ...fieldProps,
          'data-article-cover-input': name,
        }}
        extra={
          <div style={{ display: 'flex', marginTop: 10, alignItems: 'flex-start' }}>
            <Image src={preview || ''} fallback={errorImg} height={80} width={120} />
            <Space style={{ marginLeft: 10 }} direction="vertical">
              <UploadBtn
                setLoading={() => {}}
                muti={false}
                crop={false}
                text="上传图片"
                onFinish={(info) => {
                  if (info?.response?.data?.isNew) {
                    message.success(`${info.name} 上传成功!`);
                  } else if (info?.response?.data?.src) {
                    message.warning(`${info.name} 已存在!`);
                  }
                  const src = getImgLink(info?.response?.data?.src);
                  form?.setFieldsValue({ [name]: src });
                }}
                url="/api/admin/img/upload"
                accept=".png,.jpg,.jpeg,.webp,.avif,.jiff,.gif"
              />
              <Button
                data-article-cover-clear={name}
                disabled={!preview}
                onClick={() => {
                  form?.setFieldsValue({ [name]: '' });
                }}
              >
                清除题头图
              </Button>
            </Space>
          </div>
        }
      />
    </div>
  );
}
