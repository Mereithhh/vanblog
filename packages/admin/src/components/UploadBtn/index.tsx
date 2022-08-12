import { Button, message, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
export default function (props: {
  setLoading: (loading: boolean) => void;
  text: string;
  onFinish: Function;
  url: string;
  accept: string;
  muti: boolean;
  crop?: boolean;
}) {
  const Core = (
    <Upload
      showUploadList={false}
      // name="file"
      multiple={props.muti}
      accept={props.accept}
      action={props.url}
      headers={{
        token: (() => {
          return window.localStorage.getItem('token') || 'null';
        })(),
      }}
      onChange={(info) => {
        props?.setLoading(true);
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          props?.setLoading(false);
          props?.onFinish(info.file);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败!`);
          props?.setLoading(false);
        }
      }}
    >
      <Button type="primary">{props.text}</Button>
    </Upload>
  );
  if (props.crop) {
    return <ImgCrop>{Core}</ImgCrop>;
  } else {
    return Core;
  }
}
