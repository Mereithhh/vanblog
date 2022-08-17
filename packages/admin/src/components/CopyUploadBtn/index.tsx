import { getClipboardContents } from '@/services/van-blog/clipboard';
import { Button, message } from 'antd';

export default function (props: {
  setLoading: Function;
  onFinish: Function;
  onError: Function;
  url: string;
  accept: string;
  text: string;
}) {
  const handleClick = async (ev) => {
    props.setLoading(true);
    const fileObj = await getClipboardContents();
    if (!fileObj) {
      props.setLoading(false);
      props.onError();
      return;
    }
    const formData = new FormData();
    formData.append('file', fileObj);
    fetch('/api/admin/img/upload', {
      method: 'POST',
      body: formData,
      headers: {
        token: (() => {
          return window.localStorage.getItem('token') || 'null';
        })(),
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.statusCode == 200) {
          props?.onFinish(res?.data);
        } else {
          message.error('上传失败！');
          // console.log(res);
        }
      })
      .catch((err) => {
        message.error('上传失败！');
        // console.log(err);
      })
      .finally(() => [props.setLoading(false)]);
  };
  return (
    <div>
      <Button onClick={handleClick} type="primary">
        {props.text}
      </Button>
    </div>
  );
}
