import { Button, message, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { RcFile } from 'antd/lib/upload';
export default function (props: {
  setLoading: (loading: boolean) => void;
  text: string;
  onFinish: Function;
  url: string;
  accept: string;
  muti: boolean;
  crop?: boolean;
  folder?: boolean;
  customUpload?: boolean;
  basePath?: string | undefined;
  loading?: boolean;
  plainText?: boolean;
}) {
  const upload = (file: RcFile, rPath: string) => {
    const formData = new FormData();
    let fileName = rPath || file.name;
    if (!props.folder && props.basePath) {
      fileName = `${props.basePath}/${file.name}`;
    }
    formData.append('file', file, fileName);
    props.setLoading(true);
    fetch(`${props.url}&name=${fileName}`, {
      method: 'POST',
      body: formData,
      headers: {
        token: (() => {
          return window.localStorage.getItem('token') || 'null';
        })(),
      },
    })
      .then((res) => res.json())
      .then(() => {
        props?.onFinish(file, name);
      })
      .catch(() => {
        message.error(`${name} 上传失败!`);
      })
      .finally(() => {
        props.setLoading(false);
      });
  };
  const Core = (
    <Upload
      showUploadList={false}
      // name="file"
      multiple={props.muti}
      accept={props.accept}
      action={props.url}
      directory={props.folder}
      beforeUpload={
        props.customUpload
          ? (file, fileList) => {
              let rPath = file.webkitRelativePath;
              if (rPath && rPath.split('/').length >= 2) {
                rPath = rPath.split('/').slice(1).join('/');
              }
              upload(file, rPath);
              return false;
            }
          : undefined
      }
      headers={{
        token: (() => {
          return window.localStorage.getItem('token') || 'null';
        })(),
      }}
      onChange={(info) => {
        props?.setLoading(true);
        if (info.file.status !== 'uploading') {
          // console.log(info.file, info.fileList);
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
      {props.plainText ? (
        props.text
      ) : (
        <Button type="primary" loading={props.loading}>
          {props.text}
        </Button>
      )}
    </Upload>
  );
  if (props.crop) {
    return (
      <ImgCrop quality={1} fillColor="rgba(255,255,255,0)">
        {Core}
      </ImgCrop>
    );
  } else {
    return Core;
  }
}
