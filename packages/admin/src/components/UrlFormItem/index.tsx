import { errorImg } from '@/assets/error';
import { getImgLink } from '@/pages/ImageManage/components/tools';
import { ProFormText } from '@ant-design/pro-form';
import { Image, message } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import UploadBtn from '../UploadBtn';

export default function (props: {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  formRef?: any;
  isInit: boolean;
  isFavicon?: boolean;
  colProps?: { xs: number; sm: number };
}) {
  const [url, setUrl] = useState('');
  const handleOnChange = debounce((ev) => {
    const val = ev?.target?.value;
    if (val && val != url) {
      setUrl(val);
    }
  }, 500);

  useEffect(() => {
    if (!props.formRef) return;
    
    const form = props.formRef?.current || props.formRef;
    if (form?.getFieldValue) {
      const src = form.getFieldValue(props.name);
      setUrl(src);
    }
  }, [props.formRef, props.name]);

  const dest = useMemo(() => {
    let r = props.isInit ? '/api/admin/init/upload' : '/api/admin/img/upload';
    if (props.isFavicon) {
      r = r + '?favicon=true';
    }
    return r;
  }, [props.isInit, props.isFavicon]);

  const handleUploadFinish = (info: any) => {
    if (info?.response?.data?.isNew) {
      message.success(`${info.name} 上传成功!`);
    } else {
      message.warning(`${info.name} 已存在!`);
    }
    const src = getImgLink(info?.response?.data?.src);
    setUrl(src);

    if (!props.formRef) return;
    
    const form = props.formRef?.current || props.formRef;
    if (form?.setFieldsValue) {
      const oldVal = form.getFieldsValue();
      form.setFieldsValue({
        ...oldVal,
        [props.name]: src,
      });
    }
  };

  return (
    <>
      <ProFormText
        name={props.name}
        label={props.label}
        required={props.required}
        placeholder={props.placeholder}
        tooltip="上传之前需要设置好图床哦，默认为本地图床。"
        fieldProps={{
          onChange: handleOnChange,
        }}
        colProps={props.colProps}
        extra={
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <Image src={url || ''} fallback={errorImg} height={100} width={100} />
            <div style={{ marginLeft: 10 }}>
              <UploadBtn
                setLoading={() => {}}
                muti={false}
                crop={true}
                text="上传图片"
                onFinish={handleUploadFinish}
                url={dest}
                accept=".png,.jpg,.jpeg,.webp,.jiff,.gif"
              />
            </div>
          </div>
        }
        rules={props.required ? [{ required: true, message: '这是必填项' }] : undefined}
      />
    </>
  );
}
