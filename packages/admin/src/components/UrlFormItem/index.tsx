import { errorImg } from '@/pages/Static/img';
import { getImgLink } from '@/pages/Static/img/tools';
import { ProFormText } from '@ant-design/pro-form';
import { Image, message } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import UploadBtn from '../UploadBtn';

export default function (props: {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  formRef: any;
}) {
  const [url, setUrl] = useState('');
  const handleOnChange = debounce((ev) => {
    const val = ev?.target?.value;
    if (val && val != url) {
      setUrl(val);
    }
  }, 500);
  useEffect(() => {
    if (props.formRef && props.formRef.getFieldValue) {
      const src = props.formRef.getFieldValue(props.name);
      setUrl(src);
    }
    if (props.formRef?.current?.getFieldValue) {
      const src = props.formRef.current.getFieldValue(props.name);
      setUrl(src);
    }
  }, [props, setUrl]);
  return (
    <>
      <ProFormText
        name={props.name}
        label={props.label}
        required={props.required}
        placeholder={props.placeholder}
        tooltip="上传之前需要设置好图床哦"
        fieldProps={{
          onChange: handleOnChange,
        }}
        extra={
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <Image src={url || ''} fallback={errorImg} height={100} width={100} />
            <div style={{ marginLeft: 10 }}>
              <UploadBtn
                setLoading={() => {}}
                muti={false}
                crop={true}
                text="上传图片"
                onFinish={(info) => {
                  if (info?.response?.data?.isNew) {
                    message.success(`${info.name} 上传成功!`);
                  } else {
                    message.warning(`${info.name} 已存在!`);
                  }
                  const src = getImgLink(info?.response?.data?.src);
                  setUrl(src);
                  if (props?.formRef?.setFieldsValue) {
                    const oldVal = props.formRef.getFieldsValue();
                    props?.formRef?.setFieldsValue({ ...oldVal, [props.name]: src });
                  }
                  if (props.formRef?.current?.setFieldsValue) {
                    const oldVal = props.formRef.current.getFieldsValue();
                    props?.formRef?.current.setFieldsValue({ ...oldVal, [props.name]: src });
                  }
                }}
                url="/api/admin/img/upload"
                accept=".png,.jpg,.jpeg,.webp,.jiff"
              />
            </div>
          </div>
        }
        rules={props.required ? [{ required: true, message: '这是必填项' }] : undefined}
      ></ProFormText>
    </>
  );
}
