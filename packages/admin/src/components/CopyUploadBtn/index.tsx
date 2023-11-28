import { Button, message } from 'antd';

import { getClipboardContents } from '@/services/van-blog/clipboard';

export interface CopyUploadBtnProps {
  url: string;
  accept: string;
  text: string;
  setLoading: (loading: boolean) => void;
  onFinish: (data: unknown) => void;
  onError: () => void;
}

export default function (props: CopyUploadBtnProps) {
  const handleClick = async () => {
    props.setLoading(true);

    const fileObj = await getClipboardContents();

    if (!fileObj) {
      props.setLoading(false);
      props.onError();
      return;
    }
    const formData = new FormData();

    formData.append('file', fileObj);

    return fetch('/api/admin/img/upload?withWaterMark=true', {
      method: 'POST',
      headers: {
        token: localStorage.getItem('token') || 'null',
      },
      body: formData,
    })
      .then((res) => res.json())
      .then(({ statusCode, data }) => {
        if (statusCode === 200) {
          props?.onFinish(data);
        } else {
          message.error('上传失败！');
        }
      })
      .catch(() => {
        message.error('上传失败！');
      })
      .finally(() => {
        props.setLoading(false);
      });
  };

  return (
    <div>
      <Button onClick={handleClick} type="primary">
        {props.text}
      </Button>
    </div>
  );
}
